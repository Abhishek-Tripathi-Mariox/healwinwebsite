import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  Phone,
  FileText,
  Download,
  X,
  CheckCircle,
  Loader2,
  MapPin,
  ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/api";
import { watchSosSubmission } from "@/lib/socket";
import useSOSStore from "@/store/useSOSStore";

// Map raw backend status → a friendly live step shown to the caller.
const SOS_STEPS = [
  { key: "RECEIVED", label: "Request received" },
  { key: "IN_PROGRESS", label: "Team reviewing your emergency" },
  { key: "DISPATCHED", label: "Ambulance dispatched" },
  { key: "ACKNOWLEDGED", label: "Crew acknowledged" },
  { key: "EN_ROUTE", label: "Ambulance on the way" },
  { key: "ON_SCENE", label: "Ambulance arrived" },
  { key: "ON_TRIP", label: "On the way to hospital" },
  { key: "COMPLETED", label: "Completed" },
];
const STATUS_ALIASES = {
  RESOLVED: "COMPLETED",
  CLOSED: "COMPLETED",
  ASSIGNED: "DISPATCHED",
  ARRIVED: "ON_SCENE",
};
const normalizeStatus = (s) => STATUS_ALIASES[s] || s || "RECEIVED";
const stepIndex = (s) => {
  const i = SOS_STEPS.findIndex((x) => x.key === normalizeStatus(s));
  return i < 0 ? 0 : i;
};

const SOSSidePanel = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'call', 'form', 'app', 'confirm', 'countdown'
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  // Live SOS status (realtime via socket) after a form submission.
  const [liveStatus, setLiveStatus] = useState(null);
  const [liveEta, setLiveEta] = useState(null);
  const sosWatchRef = useRef(null);

  // SOS countdown state
  const [countdown, setCountdown] = useState(5);
  const countdownRef = useRef(null);
  const sosCancelledRef = useRef(false);
  const sosFiredRef = useRef(false); // Prevent duplicate SOS requests
  const locationRef = useRef(null); // Stable ref for location (avoids stale closures)

  // Caller name/phone for the SOS Call (a browser can't read the device's
  // number, so we ask for it). Mirrored to a ref so the dep-free fireSOS()

  const [callerName, setCallerName] = useState("");
  const [callerPhone, setCallerPhone] = useState("");
  const callerRef = useRef({ name: "", phone: "" });
  useEffect(() => {
    callerRef.current = { name: callerName, phone: callerPhone };
  }, [callerName, callerPhone]);

  // Get user location on mount (high accuracy GPS)
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(loc);
          locationRef.current = loc;
        },
        () => {
          // Location denied - that's ok
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
      );
    }
  }, []);

  // Keep location ref in sync
  useEffect(() => {
    locationRef.current = userLocation;
  }, [userLocation]);

  // Form states
  const [sosForm, setSosForm] = useState({
    name: "",
    phone: "",
    email: "",
    emergencyType: "",
    description: "",
    numberOfPeople: 1,
    address: "",
  });
  const [fieldErrors, setFieldErrors] = useState({});

  const resetForms = () => {
    setSosForm({
      name: "",
      phone: "",
      email: "",
      emergencyType: "",
      description: "",
      numberOfPeople: 1,
      address: "",
    });
    setFieldErrors({});
    setCallerName("");
    setCallerPhone("");
    setError(null);
    setSuccess(null);
    // Stop watching live SOS status.
    sosWatchRef.current?.();
    sosWatchRef.current = null;
    setLiveStatus(null);
    setLiveEta(null);
  };

  // Ensure the socket subscription is torn down if the component unmounts.
  useEffect(() => () => sosWatchRef.current?.(), []);

  // Update a field + clear its inline error as the user types.
  const setField = (key, value) => {
    setSosForm((f) => ({ ...f, [key]: value }));
    setFieldErrors((e) => (e[key] ? { ...e, [key]: undefined } : e));
  };

  // Validate name / phone / email / emergency type before submitting.
  const validateForm = () => {
    const errs = {};
    const name = (sosForm.name || "").trim();
    const phone = (sosForm.phone || "").trim();
    const email = (sosForm.email || "").trim();
    const people = Number(sosForm.numberOfPeople);

    if (!name) errs.name = "Name is required.";
    else if (name.length < 2) errs.name = "Please enter a valid name.";

    if (!phone) errs.phone = "Phone number is required.";
    else if (!/^[6-9]\d{9}$/.test(phone))
      errs.phone = "Enter a valid 10-digit mobile number (starting 6–9).";

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      errs.email = "Enter a valid email address.";

    if (!sosForm.emergencyType) errs.emergencyType = "Please select an emergency type.";

    if (sosForm.numberOfPeople !== "" && (!Number.isFinite(people) || people < 1))
      errs.numberOfPeople = "Must be at least 1.";

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const errInputCls = (key) =>
    fieldErrors[key]
      ? "border-red-400 focus:ring-red-200 focus:border-red-400"
      : "border-gray-200 focus:ring-hw-primary/30 focus:border-hw-primary";

  const closeModal = () => {
    setActiveModal(null);
    resetForms();
  };

  // Handle SOS Call - show confirmation first
  const handleSOSCall = () => {
    setActiveModal("confirm");
  };

  // Listen for external SOS triggers (e.g. from hero floating card)
  const triggerCall = useSOSStore((s) => s.triggerCall);
  const resetTrigger = useSOSStore((s) => s.resetTrigger);
  useEffect(() => {
    if (triggerCall) {
      resetTrigger();
      handleSOSCall();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [triggerCall]);

  // Actually fire the SOS — guarded by ref to prevent duplicates (stable, no deps)
  const fireSOS = useCallback(() => {
    if (sosFiredRef.current) return;
    sosFiredRef.current = true;

    setActiveModal(null);

    // Record in backend via fetch (fire-and-forget, keepalive survives navigation)
    const loc = locationRef.current;
    try {
      fetch(`${API_URL}/sos-public/call`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: callerRef.current.name || undefined,
          phone: callerRef.current.phone || undefined,
          latitude: loc?.lat,
          longitude: loc?.lng,
        }),
        keepalive: true,
      }).catch(() => {});
    } catch (err) {
      // Ignore
    }

    // Then initiate the emergency call
    window.location.href = "tel:112";
  }, []); // No deps — uses refs for location

  // User confirmed the SOS — start countdown
  const startCountdown = useCallback(() => {
    sosCancelledRef.current = false;
    sosFiredRef.current = false; // Reset fired flag for new SOS attempt
    setCountdown(5);
    setActiveModal("countdown");

    // Refresh GPS location right now for best accuracy
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const loc = {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
          };
          setUserLocation(loc);
          locationRef.current = loc;
        },
        () => {},
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
      );
    }

    // Countdown interval — NO side effects inside setCountdown updater
    countdownRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, []);

  // Fire SOS when countdown reaches 0 (OUTSIDE the state updater)
  useEffect(() => {
    if (countdown === 0 && !sosCancelledRef.current && !sosFiredRef.current) {
      fireSOS();
    }
  }, [countdown, fireSOS]);

  // Cancel the countdown
  const cancelCountdown = () => {
    sosCancelledRef.current = true;
    if (countdownRef.current) {
      clearInterval(countdownRef.current);
      countdownRef.current = null;
    }
    setActiveModal(null);
    resetForms();
  };

  // If user leaves the page / switches tab while countdown is running → fire SOS
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (
        document.visibilityState === "hidden" &&
        countdownRef.current &&
        !sosCancelledRef.current
      ) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        fireSOS(); // sosFiredRef guard inside prevents duplicates
      }
    };

    const handleBeforeUnload = () => {
      if (
        countdownRef.current &&
        !sosCancelledRef.current &&
        !sosFiredRef.current
      ) {
        clearInterval(countdownRef.current);
        countdownRef.current = null;
        sosFiredRef.current = true;
        // sendBeacon with text/plain to avoid CORS preflight
        const loc = locationRef.current;
        const payload = JSON.stringify({
          name: callerRef.current.name || undefined,
          phone: callerRef.current.phone || undefined,
          latitude: loc?.lat,
          longitude: loc?.lng,
        });
        navigator.sendBeacon?.(
          `${API_URL}/sos-public/call`,
          new Blob([payload], { type: "text/plain" }),
        );
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [fireSOS]); // fireSOS is stable (no deps) so this never re-runs

  // Handle SOS Form
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!validateForm()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/sos-public/form`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...sosForm,
          latitude: userLocation?.lat,
          longitude: userLocation?.lng,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSuccess(
          "Emergency request submitted! Our team will respond immediately.",
        );
        // Start watching this submission's live status in realtime.
        const id = data.data?.id;
        if (id) {
          setLiveStatus("RECEIVED");
          setLiveEta(null);
          sosWatchRef.current?.();
          sosWatchRef.current = watchSosSubmission(id, (payload) => {
            if (payload?.status) setLiveStatus(payload.status);
            if (payload?.etaMinutes != null) setLiveEta(payload.etaMinutes);
          });
        }
      } else {
        setError(data.message || "Failed to submit form");
      }
    } catch (err) {
      setError("Network error. Please try again or call 112.");
    }
    setLoading(false);
  };

  // Handle App Download
  const handleAppDownload = () => {
    setActiveModal("app");
  };

  const emergencyTypes = [
    { value: "MEDICAL", label: "Medical Emergency" },
    { value: "ACCIDENT", label: "Accident" },
    { value: "FIRE", label: "Fire" },
    { value: "NATURAL_DISASTER", label: "Natural Disaster" },
    { value: "VIOLENCE", label: "Violence / Threat" },
    { value: "OTHER", label: "Other" },
  ];

  return (
    <>
      <div
        className="fixed right-0 z-50 -translate-y-1/2 top-1/2"
        data-testid="sos-side-panel"
      >
        {/* Collapsed Tab */}
        <motion.button
          onClick={() => setIsExpanded(true)}
          className={`relative flex items-center justify-center transition-all duration-300 ${
            isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
          }`}
          whileHover={{ x: -5 }}
        >
          <div className="px-3 py-8 text-white shadow-lg bg-gradient-to-b from-hw-sos to-red-600 rounded-l-2xl shadow-hw-sos/30 sos-pulse">
            <span className="text-base font-bold tracking-wider writing-mode-vertical font-heading">
              SOS
            </span>
          </div>
          <div className="absolute inset-0 bg-hw-sos/20 blur-xl rounded-l-2xl" />
        </motion.button>

        {/* Expanded Panel */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="absolute right-0 -translate-y-1/2 top-1/2"
            >
              <div className="overflow-hidden shadow-2xl w-64 sm:w-72 glass rounded-l-3xl shadow-hw-sos/20">
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-hw-sos to-red-600">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-white/20 rounded-xl">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white font-heading">
                        Emergency
                      </h3>
                      <p className="text-xs text-white/70">Quick Actions</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsExpanded(false)}
                    className="flex items-center justify-center w-8 h-8 transition-colors rounded-lg bg-white/10 hover:bg-white/20"
                  >
                    <X className="w-4 h-4 text-white" />
                  </button>
                </div>

                {/* Actions */}
                <div className="p-5 space-y-3">
                  {/* SOS Call - Direct call, no form */}
                  <button
                    onClick={handleSOSCall}
                    className="flex items-center w-full gap-4 p-4 transition-all duration-200 border rounded-2xl bg-hw-sos/5 hover:bg-hw-sos/10 border-hw-sos/20 group"
                    data-testid="sos-call-btn"
                  >
                    <div className="flex items-center justify-center w-12 h-12 transition-transform shadow-lg rounded-xl bg-gradient-to-br from-hw-sos to-red-600 shadow-hw-sos/30 group-hover:scale-105">
                      <Phone className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block font-semibold font-heading text-hw-text">
                        SOS Call
                      </span>
                      <span className="text-xs text-hw-muted">
                        Tap to call emergency
                      </span>
                    </div>
                  </button>

                  {/* SOS Form */}
                  <button
                    onClick={() => {
                      setActiveModal("form");
                      resetForms();
                    }}
                    className="flex items-center w-full gap-4 p-4 transition-all duration-200 border rounded-2xl bg-hw-primary/5 hover:bg-hw-primary/10 border-hw-primary/20 group"
                    data-testid="sos-form-btn"
                  >
                    <div className="flex items-center justify-center w-12 h-12 transition-transform shadow-lg rounded-xl bg-gradient-to-br from-hw-primary to-hw-accent shadow-hw-primary/30 group-hover:scale-105">
                      <FileText className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block font-semibold font-heading text-hw-text">
                        SOS To Help
                      </span>
                      <span className="text-xs text-hw-muted">
                        Request emergency help
                      </span>
                    </div>
                  </button>

                  {/* Download App */}
                  <button
                    onClick={handleAppDownload}
                    className="flex items-center w-full gap-4 p-4 transition-all duration-200 border rounded-2xl bg-hw-accent/5 hover:bg-hw-accent/10 border-hw-accent/20 group"
                    data-testid="sos-app-btn"
                  >
                    <div className="flex items-center justify-center w-12 h-12 transition-transform shadow-lg rounded-xl bg-gradient-to-br from-hw-accent to-cyan-600 shadow-hw-accent/30 group-hover:scale-105">
                      <Download className="w-5 h-5 text-white" />
                    </div>
                    <div className="text-left">
                      <span className="block font-semibold font-heading text-hw-text">
                        Download App
                      </span>
                      <span className="text-xs text-hw-muted">
                        Faster emergency access
                      </span>
                    </div>
                  </button>
                </div>

                {/* Footer */}
                <div className="px-5 pb-5">
                  <p className="text-xs text-center text-hw-muted">&nbsp;</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <style jsx>{`
          .writing-mode-vertical {
            writing-mode: vertical-rl;
            text-orientation: mixed;
          }
          @keyframes sosBlink {
            0%,
            100% {
              opacity: 1;
              transform: scale(1);
              box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
            }
            50% {
              opacity: 0.85;
              transform: scale(1.03);
              box-shadow:
                0 0 30px rgba(239, 68, 68, 0.7),
                0 0 60px rgba(239, 68, 68, 0.3);
            }
          }
          .animate-sos-blink {
            animation: sosBlink 0.8s ease-in-out infinite;
          }
        `}</style>
      </div>

      {/* ====== MODALS ====== */}
      <AnimatePresence>
        {activeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: "spring", damping: 25 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              {/* -------- SOS CONFIRM MODAL -------- */}
              {activeModal === "confirm" && (
                <div>
                  <div className="px-6 py-5 bg-gradient-to-r from-hw-sos to-red-600 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                          <ShieldAlert className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white font-heading">
                            Emergency SOS
                          </h3>
                          <p className="text-sm text-white/70">
                            Confirm emergency call
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="p-8 text-center">
                    <h4 className="mb-4 text-2xl font-bold font-heading text-hw-text">
                      You are triggering SOS
                    </h4>
                    {/* So the dispatch team can call back — the browser can't
                        read your number automatically. */}
                    <div className="mb-5 space-y-3 text-left">
                      <input
                        type="text"
                        value={callerName}
                        onChange={(e) => setCallerName(e.target.value)}
                        placeholder="Your name (optional)"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hw-sos/30 focus:border-hw-sos outline-none text-sm"
                      />
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        value={callerPhone}
                        onChange={(e) =>
                          setCallerPhone(e.target.value.replace(/\D/g, "").slice(0, 10))
                        }
                        placeholder="Your phone number (for callback)"
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hw-sos/30 focus:border-hw-sos outline-none text-sm"
                      />
                    </div>
                    <div className="relative overflow-hidden rounded-2xl">
                      <button
                        onClick={startCountdown}
                        className="relative flex items-center justify-center w-full gap-2 py-5 text-xl font-bold text-white transition-all shadow-lg bg-gradient-to-r from-hw-sos to-red-600 rounded-xl shadow-red-500/40 animate-sos-blink"
                      >
                        <AlertTriangle className="w-7 h-7" />
                        Confirm SOS
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* -------- SOS COUNTDOWN MODAL -------- */}
              {activeModal === "countdown" && (
                <div>
                  <div className="px-6 py-5 bg-gradient-to-r from-hw-sos to-red-600 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                          <Phone className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white font-heading">
                            SOS Activated
                          </h3>
                          <p className="text-sm text-white/70">
                            Calling in {countdown}s...
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 text-center">
                    {/* Circular countdown */}
                    <div className="relative w-32 h-32 mx-auto mb-6">
                      <svg
                        className="w-32 h-32 -rotate-90"
                        viewBox="0 0 120 120"
                      >
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="#fee2e2"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="60"
                          cy="60"
                          r="52"
                          stroke="#ef4444"
                          strokeWidth="8"
                          fill="none"
                          strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 52}
                          strokeDashoffset={
                            2 * Math.PI * 52 * (1 - countdown / 5)
                          }
                          className="transition-all duration-1000 ease-linear"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-4xl font-bold text-hw-sos">
                          {countdown}
                        </span>
                      </div>
                    </div>

                    <h4 className="mb-2 text-lg font-bold font-heading text-hw-text">
                      Emergency call in {countdown} seconds
                    </h4>
                    <p className="mb-6 text-sm text-gray-500">
                      Tap cancel if this was a mistake. Leaving this page will
                      trigger the SOS immediately.
                    </p>

                    <button
                      onClick={cancelCountdown}
                      className="flex items-center justify-center w-full gap-2 py-5 text-2xl font-bold text-red-700 transition-all bg-red-100 border-2 border-red-300 hover:bg-red-200 rounded-xl animate-pulse"
                    >
                      <X className="w-7 h-7" />
                      Cancel SOS
                    </button>
                  </div>
                </div>
              )}

              {/* -------- SOS FORM MODAL -------- */}
              {activeModal === "form" && (
                <div>
                  <div className="px-6 py-5 bg-gradient-to-r from-hw-primary to-hw-accent rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white font-heading">
                            SOS To Help
                          </h3>
                          <p className="text-sm text-white/70">
                            Request emergency help
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  {success ? (
                    <div className="p-8 text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      </div>
                      <p className="text-lg font-semibold text-green-800">
                        {success}
                      </p>
                      <p className="mt-2 text-sm text-gray-500">
                        Our emergency team has been notified.
                      </p>

                      {/* Live status timeline (realtime via socket) */}
                      {liveStatus && (
                        <div className="mt-5 text-left">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-semibold tracking-wide text-gray-500 uppercase">
                              Live status
                            </span>
                            {liveEta != null && normalizeStatus(liveStatus) !== "COMPLETED" && (
                              <span className="text-xs font-medium text-hw-primary">
                                ETA ~{liveEta} min
                              </span>
                            )}
                          </div>
                          <div className="space-y-2">
                            {SOS_STEPS.map((step, i) => {
                              const cur = stepIndex(liveStatus);
                              const done = i <= cur;
                              const active = i === cur;
                              return (
                                <div key={step.key} className="flex items-center gap-3">
                                  <div
                                    className={`flex items-center justify-center w-5 h-5 rounded-full border ${
                                      done
                                        ? "bg-green-500 border-green-500"
                                        : "bg-white border-gray-300"
                                    }`}
                                  >
                                    {done && <CheckCircle className="w-3.5 h-3.5 text-white" />}
                                  </div>
                                  <span
                                    className={`text-sm ${
                                      active
                                        ? "font-semibold text-green-800"
                                        : done
                                        ? "text-gray-600"
                                        : "text-gray-400"
                                    }`}
                                  >
                                    {step.label}
                                    {active && (
                                      <Loader2 className="inline w-3.5 h-3.5 ml-2 animate-spin text-green-600" />
                                    )}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}

                      <button
                        onClick={closeModal}
                        className="mt-4 px-6 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-medium"
                      >
                        Close
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Name *
                          </label>
                          <input
                            type="text"
                            value={sosForm.name}
                            onChange={(e) => setField("name", e.target.value)}
                            className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 outline-none text-sm ${errInputCls("name")}`}
                            placeholder="Your name"
                          />
                          {fieldErrors.name && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Phone *
                          </label>
                          <input
                            type="tel"
                            inputMode="numeric"
                            maxLength={10}
                            value={sosForm.phone}
                            onChange={(e) =>
                              setField(
                                "phone",
                                e.target.value.replace(/\D/g, "").slice(0, 10),
                              )
                            }
                            className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 outline-none text-sm ${errInputCls("phone")}`}
                            placeholder="10-digit mobile number"
                          />
                          {fieldErrors.phone && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.phone}</p>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Email
                        </label>
                        <input
                          type="email"
                          value={sosForm.email}
                          onChange={(e) => setField("email", e.target.value)}
                          className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 outline-none text-sm ${errInputCls("email")}`}
                          placeholder="your@email.com"
                        />
                        {fieldErrors.email && (
                          <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Emergency Type *
                        </label>
                        <select
                          value={sosForm.emergencyType}
                          onChange={(e) => setField("emergencyType", e.target.value)}
                          className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 outline-none text-sm bg-white ${errInputCls("emergencyType")}`}
                        >
                          <option value="">Select emergency type</option>
                          {emergencyTypes.map((t) => (
                            <option key={t.value} value={t.value}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                        {fieldErrors.emergencyType && (
                          <p className="mt-1 text-xs text-red-500">{fieldErrors.emergencyType}</p>
                        )}
                      </div>

                      <div>
                        <label className="block mb-1 text-sm font-medium text-gray-700">
                          Description
                        </label>
                        <textarea
                          value={sosForm.description}
                          onChange={(e) => setField("description", e.target.value)}
                          rows={3}
                          className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hw-primary/30 focus:border-hw-primary outline-none text-sm resize-none"
                          placeholder="Describe the emergency situation..."
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            No. of People
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={sosForm.numberOfPeople}
                            onChange={(e) =>
                              setField(
                                "numberOfPeople",
                                e.target.value === "" ? "" : parseInt(e.target.value) || 1,
                              )
                            }
                            className={`w-full px-3 py-2.5 border rounded-xl focus:ring-2 outline-none text-sm ${errInputCls("numberOfPeople")}`}
                          />
                          {fieldErrors.numberOfPeople && (
                            <p className="mt-1 text-xs text-red-500">{fieldErrors.numberOfPeople}</p>
                          )}
                        </div>
                        <div>
                          <label className="block mb-1 text-sm font-medium text-gray-700">
                            Address
                          </label>
                          <input
                            type="text"
                            value={sosForm.address}
                            onChange={(e) => setField("address", e.target.value)}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-hw-primary/30 focus:border-hw-primary outline-none text-sm"
                            placeholder="Location"
                          />
                        </div>
                      </div>

                      {userLocation && (
                        <div className="flex items-center gap-2 px-3 py-2 text-xs text-green-600 rounded-lg bg-green-50">
                          <MapPin className="w-3 h-3" />
                          GPS location captured automatically
                        </div>
                      )}

                      {error && (
                        <div className="px-3 py-2 text-sm text-red-600 rounded-lg bg-red-50">
                          {error}
                        </div>
                      )}

                      <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3.5 bg-gradient-to-r from-hw-primary to-hw-accent text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-hw-primary/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {loading ? (
                          <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                          <FileText className="w-5 h-5" />
                        )}
                        {loading ? "Submitting..." : "Submit Emergency Request"}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* -------- APP DOWNLOAD MODAL (Coming Soon) -------- */}
              {activeModal === "app" && (
                <div>
                  <div className="px-6 py-5 bg-gradient-to-r from-hw-accent to-cyan-600 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl">
                          <Download className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-white font-heading">
                            Download App
                          </h3>
                          <p className="text-sm text-white/70">
                            HealWin Mobile App
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={closeModal}
                        className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="p-8 text-center">
                    <div className="flex items-center justify-center w-20 h-20 mx-auto mb-5 rounded-full bg-hw-accent/10">
                      <Download className="w-10 h-10 text-hw-accent" />
                    </div>
                    <h4 className="mb-2 text-xl font-bold font-heading text-hw-text">
                      Coming Soon!
                    </h4>
                    <p className="mb-6 text-sm text-gray-500">
                      Our mobile app is currently under development. Stay tuned
                      for faster emergency access, real-time tracking, and more
                      features right at your fingertips.
                    </p>
                    <div className="p-4 mb-6 border bg-hw-accent/5 border-hw-accent/20 rounded-xl">
                      <p className="text-sm font-medium text-hw-accent">
                        🚀 Expected launch: Coming Soon
                      </p>
                      <p className="mt-1 text-xs text-gray-500">
                        Available on Android & iOS
                      </p>
                    </div>
                    <button
                      onClick={closeModal}
                      className="px-8 py-3 font-semibold text-white transition-all bg-gradient-to-r from-hw-accent to-cyan-600 rounded-xl hover:shadow-lg"
                    >
                      Got it!
                    </button>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SOSSidePanel;
