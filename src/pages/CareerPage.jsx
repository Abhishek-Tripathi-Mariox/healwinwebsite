import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Briefcase,
  MapPin,
  Clock,
  ArrowRight,
  CheckCircle,
  Users,
  Heart,
  Send,
  Building2,
  GraduationCap,
  Sparkles,
  X,
  Upload,
  Loader2,
  Eye,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import useCareersStore from "@/store/useCareersStore";
import useTeamStore from "@/store/useTeamStore";
import useHomeStore from "@/store/useHomeStore";
import { apiFetch, API_URL } from "@/lib/api";

const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const DISPOSABLE_EMAIL_KEYWORDS = [
  "yopmail",
  "mailinator",
  "tempmail",
  "10minutemail",
  "guerrillamail",
  "trashmail",
  "sharklasers",
  "dispostable",
  "maildrop",
  "getnada",
  "temp-mail",
  "throwawaymail",
  "fakeinbox",
  "mailnesia",
  "mintemail",
];

const normalizeIndianPhone = (phone = "") => {
  const digits = String(phone).replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) return digits.slice(2);
  if (digits.length === 11 && digits.startsWith("0")) return digits.slice(1);
  return digits;
};

const isValidIndianPhone = (phone = "") =>
  INDIAN_MOBILE_REGEX.test(normalizeIndianPhone(phone));

const isAllowedEmail = (email = "") => {
  const normalized = String(email).trim().toLowerCase();
  if (!EMAIL_REGEX.test(normalized)) return false;
  const domain = normalized.split("@")[1] || "";
  return !DISPOSABLE_EMAIL_KEYWORDS.some((k) => domain.includes(k));
};

const getMaxDobDate = () => {
  const d = new Date();
  d.setFullYear(d.getFullYear() - 18);
  return d.toISOString().split("T")[0];
};

const isAtLeast18 = (dob) => {
  if (!dob) return false;
  const birthDate = new Date(dob);
  if (Number.isNaN(birthDate.getTime())) return false;

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age -= 1;
  }

  return age >= 18;
};

const CareerPage = () => {
  const containerRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const [selectedJob, setSelectedJob] = useState(null);
  const [isApplyOpen, setIsApplyOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const jobs = useCareersStore((s) => s.jobs);
  const isLoadingJobs = useCareersStore((s) => s.loading);
  const fetchCareers = useCareersStore((s) => s.fetchCareers);
  const teamMembers = useTeamStore((s) => s.members);
  const fetchTeam = useTeamStore((s) => s.fetchTeam);
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";
  const [teamStats, setTeamStats] = useState({ members: 0, states: 0 });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isResumeSubmitOpen, setIsResumeSubmitOpen] = useState(false);
  const [resumeSubmitLoading, setResumeSubmitLoading] = useState(false);
  const [resumeSubmitSuccess, setResumeSubmitSuccess] = useState(false);
  const [resumeSubmitError, setResumeSubmitError] = useState("");
  const [resumeForm, setResumeForm] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    resume: null,
  });
  const [knowMoreJob, setKnowMoreJob] = useState(null);
  // OTP state
  const [otpStep, setOtpStep] = useState("form"); // form | otp | details
  const [emailOtp, setEmailOtp] = useState("");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneOtp, setPhoneOtp] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [emailCooldown, setEmailCooldown] = useState(0);
  const [phoneCooldown, setPhoneCooldown] = useState(0);
  // State / District selection
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedDistricts, setSelectedDistricts] = useState([]);
  const [applicationForm, setApplicationForm] = useState({
    name: "",
    phone: "",
    email: "",
    dob: "",
    gender: "",
    maritalStatus: "",
    address: "",
    department: "",
    position: "",
    declaration: false,
    resume: null,
    passportPhoto: null,
    idProof: null,
    educationalCertificates: null,
    professionalRegistration: null,
    experienceCertificates: null,
    otherDocuments: null,
  });

  // Fetch careers and team from stores
  useEffect(() => {
    fetchCareers();
    fetchTeam();
  }, [fetchCareers, fetchTeam]);
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  // Derive team stats from store
  useEffect(() => {
    if (teamMembers.length > 0) {
      const uniqueStates = new Set(
        teamMembers.map((m) => m.state).filter(Boolean),
      );
      setTeamStats({
        members: teamMembers.length,
        states: uniqueStates.size || 0,
      });
    }
  }, [teamMembers]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleApply = (job) => {
    setSelectedJob(job);
    setApplicationForm((prev) => ({
      ...prev,
      position: job.title,
      department: job.department || "",
    }));
    setSubmitSuccess(false);
    setOtpStep("form");
    setEmailOtp("");
    setEmailVerified(false);
    setPhoneOtp("");
    setPhoneVerified(false);
    setOtpError("");
    setSelectedStates([]);
    setSelectedDistricts([]);
    setIsApplyOpen(true);
  };

  // OTP cooldown timers
  useEffect(() => {
    if (emailCooldown > 0) {
      const t = setTimeout(() => setEmailCooldown(emailCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [emailCooldown]);

  useEffect(() => {
    if (phoneCooldown > 0) {
      const t = setTimeout(() => setPhoneCooldown(phoneCooldown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [phoneCooldown]);

  const sendOtp = async (type) => {
    let identifier;
    if (type === "email") {
      identifier = applicationForm.email.trim().toLowerCase();
      if (!identifier) {
        setOtpError("Please enter your email first");
        return;
      }
      if (!isAllowedEmail(identifier)) {
        setOtpError(
          "Please use a valid business/personal email (temporary emails are not allowed)",
        );
        return;
      }
    } else if (type === "phone") {
      identifier = normalizeIndianPhone(applicationForm.phone);
      if (!isValidIndianPhone(identifier)) {
        setOtpError(
          "Please enter a valid Indian mobile number (10 digits starting with 6-9)",
        );
        return;
      }
    } else {
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      const data = await apiFetch("/careers/otp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, type }),
      });
      if (data.success) {
        if (type === "email") setEmailCooldown(120);
        else setPhoneCooldown(120);
      } else {
        setOtpError(data.message || "Failed to send OTP");
      }
    } catch {
      setOtpError("Network error. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const verifyOtp = async (type) => {
    let identifier;
    let otp;
    if (type === "email") {
      identifier = applicationForm.email.trim().toLowerCase();
      otp = emailOtp;
      if (!isAllowedEmail(identifier)) {
        setOtpError(
          "Please use a valid business/personal email (temporary emails are not allowed)",
        );
        return;
      }
    } else if (type === "phone") {
      identifier = normalizeIndianPhone(applicationForm.phone);
      otp = phoneOtp;
      if (!isValidIndianPhone(identifier)) {
        setOtpError("Please enter a valid Indian mobile number");
        return;
      }
    } else {
      return;
    }

    if (!otp || otp.length < 4) {
      setOtpError("Enter a valid OTP");
      return;
    }

    setOtpLoading(true);
    setOtpError("");
    try {
      const data = await apiFetch("/careers/otp/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, type, otp }),
      });
      if (data.success) {
        if (type === "email") setEmailVerified(true);
        else setPhoneVerified(true);
      } else {
        setOtpError(data.message || "Invalid OTP");
      }
    } catch {
      setOtpError("Network error. Try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  const proceedToApplicationForm = () => {
    if (!emailVerified) {
      setOtpError("Please verify your email OTP");
      return;
    }
    if (!phoneVerified) {
      setOtpError("Please verify your mobile number OTP");
      return;
    }
    if (!isAllowedEmail(applicationForm.email)) {
      setOtpError(
        "Please use a valid business/personal email (temporary emails are not allowed)",
      );
      return;
    }
    if (!isValidIndianPhone(applicationForm.phone)) {
      setOtpError(
        "Please enter a valid Indian mobile number (10 digits starting with 6-9)",
      );
      return;
    }
    setOtpError("");
    setOtpStep("details");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedJob) return;

    if (!emailVerified || !phoneVerified) {
      setOtpStep("form");
      setOtpError("Please verify your email and mobile number before applying");
      return;
    }

    if (!isAllowedEmail(applicationForm.email)) {
      alert(
        "Please use a valid business/personal email (temporary emails are not allowed)",
      );
      return;
    }

    if (!isValidIndianPhone(applicationForm.phone)) {
      alert("Please enter a valid Indian mobile number");
      return;
    }

    if (!isAtLeast18(applicationForm.dob)) {
      alert("Applicant must be at least 18 years old");
      return;
    }

    const normalizedPhone = normalizeIndianPhone(applicationForm.phone);

    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append("name", applicationForm.name);
      formData.append("phone", normalizedPhone);
      formData.append("email", applicationForm.email.trim());
      formData.append("dob", applicationForm.dob);
      formData.append("gender", applicationForm.gender);
      formData.append("maritalStatus", applicationForm.maritalStatus);
      formData.append("address", applicationForm.address);
      formData.append("department", applicationForm.department);
      formData.append("position", applicationForm.position);
      formData.append("declaration", applicationForm.declaration);
      if (selectedStates.length > 0)
        formData.append("selectedStates", JSON.stringify(selectedStates));
      if (selectedDistricts.length > 0)
        formData.append("selectedDistricts", JSON.stringify(selectedDistricts));

      // File uploads
      const fileFields = [
        "resume",
        "passportPhoto",
        "idProof",
        "educationalCertificates",
        "professionalRegistration",
        "experienceCertificates",
        "otherDocuments",
      ];
      fileFields.forEach((field) => {
        if (applicationForm[field]) {
          formData.append(field, applicationForm[field]);
        }
      });

      const res = await fetch(`${API_URL}/careers/${selectedJob._id}/apply`, {
        method: "POST",
        body: formData,
      });

      // Handle non-OK responses (e.g. Nginx 413, 502, 504)
      if (!res.ok) {
        let errorMsg = "Failed to submit application";
        try {
          const data = await res.json();
          errorMsg = data.message || errorMsg;
        } catch {
          // Non-JSON response (likely Nginx/proxy error)
          if (res.status === 413)
            errorMsg =
              "Files are too large. Please reduce file sizes and try again.";
          else if (res.status === 504 || res.status === 502)
            errorMsg = "Server is temporarily unavailable. Please try again.";
          else errorMsg = `Server error (${res.status}). Please try again.`;
        }
        alert(errorMsg);
        return;
      }

      const data = await res.json();
      if (data.success) {
        setSubmitSuccess(true);
        setApplicationForm({
          name: "",
          phone: "",
          email: "",
          dob: "",
          gender: "",
          maritalStatus: "",
          address: "",
          department: "",
          position: "",
          declaration: false,
          resume: null,
          passportPhoto: null,
          idProof: null,
          educationalCertificates: null,
          professionalRegistration: null,
          experienceCertificates: null,
          otherDocuments: null,
        });
        setTimeout(() => {
          setIsApplyOpen(false);
          setSelectedJob(null);
          setSubmitSuccess(false);
        }, 2000);
      } else {
        alert(data.message || "Failed to submit application");
      }
    } catch (err) {
      console.error("Application submit error:", err);
      alert(
        "Network error. Please check your internet connection and try again.",
      );
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleResumeSubmit = async (e) => {
    e.preventDefault();

    const name = resumeForm.name.trim();
    const email = resumeForm.email.trim().toLowerCase();
    const phone = normalizeIndianPhone(resumeForm.phone).slice(0, 10);
    const message = resumeForm.message.trim();

    if (!name || !email || !phone) {
      setResumeSubmitError("Name, email, and phone are required");
      return;
    }

    if (!isAllowedEmail(email)) {
      setResumeSubmitError(
        "Please use a valid business/personal email (temporary emails are not allowed)",
      );
      return;
    }

    if (!INDIAN_MOBILE_REGEX.test(phone)) {
      setResumeSubmitError(
        "Please enter a valid Indian mobile number (10 digits starting with 6-9)",
      );
      return;
    }

    if (!resumeForm.resume) {
      setResumeSubmitError("Please upload your resume (.pdf, .doc, .docx)");
      return;
    }

    setResumeSubmitError("");
    setResumeSubmitLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("phone", phone);
      if (message) formData.append("message", message);
      formData.append("resume", resumeForm.resume);

      const res = await fetch(`${API_URL}/careers/resume/submit`, {
        method: "POST",
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setResumeSubmitSuccess(true);
        setResumeForm({
          name: "",
          email: "",
          phone: "",
          message: "",
          resume: null,
        });

        setTimeout(() => {
          setIsResumeSubmitOpen(false);
          setResumeSubmitSuccess(false);
        }, 1800);
      } else {
        setResumeSubmitError(data.message || "Failed to submit resume");
      }
    } catch {
      setResumeSubmitError("Something went wrong. Please try again.");
    } finally {
      setResumeSubmitLoading(false);
    }
  };

  const filteredJobs = jobs.filter((job) => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return true;

    const searchable = [
      job.title,
      job.department,
      job.location,
      job.type,
      job.description,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchable.includes(term);
  });

  return (
    <div
      className="min-h-screen bg-hw-base"
      data-testid="career-page"
      ref={containerRef}
    >
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-emerald-50/50 to-blue-50/30" />
          {homeHeroImage && (
            <img
              src={homeHeroImage}
              alt="Hero background"
              className="absolute inset-0 object-cover w-full h-full opacity-10"
            />
          )}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-hw-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px]" />
        </motion.div>

        <div className="relative z-10 px-4 pt-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 mb-6 text-sm font-medium rounded-full bg-gradient-to-r from-hw-primary/10 to-emerald-500/10 text-hw-primary"
            >
              <Briefcase className="w-4 h-4" />
              Career With Us
            </motion.span>

            <h1 className="mb-6 text-4xl font-bold font-heading sm:text-5xl lg:text-6xl text-hw-text">
              <span className="text-transparent bg-gradient-to-r from-hw-primary to-emerald-500 bg-clip-text">
                Careers
              </span>
            </h1>

            {/* Quick Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-16">
              {[
                {
                  value: `${teamStats.members}+`,
                  label: "Team Members",
                  color: "text-hw-primary",
                },
                {
                  value: `${teamStats.states}`,
                  label: "States",
                  color: "text-hw-accent",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
                >
                  <div
                    className={`font-heading text-3xl lg:text-4xl font-bold ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-hw-muted">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Job Openings */}
      <section
        className="px-4 py-12 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8"
        ref={ref}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col gap-6 mb-12 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="text-center lg:text-left">
            <h2 className="mb-2 text-2xl font-bold font-heading sm:text-3xl text-hw-text">
              Current Openings
            </h2>
            <p className="text-hw-muted">
              {filteredJobs.length} positions available
            </p>
          </div>

          <div className="w-full lg:w-96">
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by role, location, or department..."
              className="bg-white focus-visible:ring-hw-primary"
              data-testid="jobs-search-input"
            />
          </div>
        </motion.div>

        <div className="space-y-6">
          {isLoadingJobs ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 animate-spin text-hw-primary" />
            </div>
          ) : (
            <>
              {filteredJobs.map((job, index) => (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.08 }}
                  className="overflow-hidden premium-card rounded-2xl"
                  data-testid={`job-card-${job._id}`}
                >
                  <div className="flex items-center gap-0">
                    {/* Color stripe */}
                    <div
                      className="self-stretch w-2 shrink-0 rounded-l-2xl"
                      style={{ backgroundColor: job.cardColor || "#2563eb" }}
                    />

                    {/* Compact content */}
                    <div className="flex flex-col justify-between flex-1 gap-4 p-5 sm:flex-row sm:items-center lg:p-6">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-hw-muted">
                            {job.department}
                          </span>
                          <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-500/10 text-emerald-600">
                            {job.type}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold truncate career-job-title font-heading text-hw-text">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-3 mt-2 text-sm text-hw-muted">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5 text-hw-primary" />
                              {job.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-hw-accent" />
                            {job.experience}
                          </span>
                          {job.salary && (
                            <span className="font-semibold text-hw-text">
                              {job.salary}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2 shrink-0">
                        <Button
                          variant="outline"
                          onClick={() => setKnowMoreJob(job)}
                          className="text-sm rounded-xl text-hw-primary border-hw-primary/30 hover:bg-hw-primary/5"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> Know More
                        </Button>
                        <Button
                          onClick={() => handleApply(job)}
                          className="text-sm shadow-lg btn-gradient rounded-xl shadow-hw-primary/20"
                          data-testid={`apply-btn-${job._id}`}
                        >
                          Apply Now <ArrowRight className="w-4 h-4 ml-1.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </>
          )}

          {filteredJobs.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-12 text-center premium-card rounded-2xl"
            >
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 rounded-full bg-hw-primary/10">
                <Briefcase className="w-8 h-8 text-hw-primary" />
              </div>
              <h3 className="mb-2 text-xl font-bold font-heading text-hw-text">
                No roles match your search
              </h3>
              <p className="text-hw-muted">
                Try different keywords or browse all openings.
              </p>
            </motion.div>
          )}
        </div>
      </section>

      {/* Know More Dialog */}
      <Dialog
        open={!!knowMoreJob}
        onOpenChange={(open) => !open && setKnowMoreJob(null)}
      >
        <DialogContent className="max-w-xl max-h-[85vh] p-0 overflow-hidden rounded-3xl">
          {knowMoreJob && (
            <>
              <div
                className="p-6 text-white"
                style={{
                  background: `linear-gradient(135deg, ${knowMoreJob.cardColor || "#2563eb"}, ${knowMoreJob.cardColor || "#2563eb"}cc)`,
                }}
              >
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">
                    {knowMoreJob.title}
                  </DialogTitle>
                </DialogHeader>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-white/80">
                  <span>{knowMoreJob.department}</span>
                  <span>•</span>
                  <span>{knowMoreJob.type}</span>
                  {knowMoreJob.location && (
                    <>
                      <span>•</span>
                      <span>{knowMoreJob.location}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-6 space-y-5 overflow-y-auto max-h-[calc(85vh-140px)]">
                {knowMoreJob.experience && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold tracking-wider uppercase text-hw-text">
                      Experience
                    </h4>
                    <p className="flex items-start gap-2 text-sm whitespace-pre-wrap text-hw-muted">
                      <Clock className="w-4 h-4 mt-0.5 text-hw-accent shrink-0" />
                      <span>{knowMoreJob.experience}</span>
                    </p>
                  </div>
                )}

                {knowMoreJob.salary && (
                  <div className="text-sm font-semibold text-hw-text">
                    {knowMoreJob.salary}
                  </div>
                )}

                {/* Qualification (formerly description) */}
                {knowMoreJob.qualification && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold tracking-wider uppercase text-hw-text">
                      Qualification
                    </h4>
                    <p className="text-sm whitespace-pre-wrap text-hw-muted">
                      {knowMoreJob.qualification}
                    </p>
                  </div>
                )}
                {/* Legacy: description for old data */}
                {!knowMoreJob.qualification && knowMoreJob.description && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold tracking-wider uppercase text-hw-text">
                      Description
                    </h4>
                    <p className="text-sm whitespace-pre-wrap text-hw-muted">
                      {knowMoreJob.description}
                    </p>
                  </div>
                )}

                {/* Roles & Responsibilities (formerly requirements) */}
                {knowMoreJob.rolesAndResponsibilities &&
                  knowMoreJob.rolesAndResponsibilities.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold tracking-wider uppercase text-hw-text">
                        Roles & Responsibilities
                      </h4>
                      <ul className="space-y-1.5">
                        {knowMoreJob.rolesAndResponsibilities.map((r, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-hw-muted"
                          >
                            <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                {/* Legacy: requirements for old data */}
                {(!knowMoreJob.rolesAndResponsibilities ||
                  knowMoreJob.rolesAndResponsibilities.length === 0) &&
                  knowMoreJob.requirements &&
                  knowMoreJob.requirements.length > 0 && (
                    <div>
                      <h4 className="mb-2 text-sm font-semibold tracking-wider uppercase text-hw-text">
                        Requirements
                      </h4>
                      <ul className="space-y-1.5">
                        {knowMoreJob.requirements.map((r, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-sm text-hw-muted"
                          >
                            <CheckCircle className="w-4 h-4 mt-0.5 text-emerald-500 shrink-0" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {/* Available States/Districts */}
                {((knowMoreJob.states && knowMoreJob.states.length > 0) ||
                  (knowMoreJob.districts &&
                    knowMoreJob.districts.length > 0)) && (
                  <div>
                    <h4 className="mb-2 text-sm font-semibold tracking-wider uppercase text-hw-text">
                      Available Locations
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(knowMoreJob.states || []).map((s) => (
                        <span
                          key={s._id}
                          className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                        >
                          {s.name}
                        </span>
                      ))}
                      {(knowMoreJob.districts || []).map((d) => (
                        <span
                          key={d._id}
                          className="px-2.5 py-1 text-xs rounded-full bg-green-50 text-green-700"
                        >
                          {d.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  onClick={() => {
                    setKnowMoreJob(null);
                    handleApply(knowMoreJob);
                  }}
                  className="w-full py-5 text-base shadow-lg btn-gradient rounded-xl"
                >
                  Apply Now <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Application Modal */}
      <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] p-0 overflow-hidden rounded-3xl">
          {selectedJob && (
            <>
              {/* Header */}
              <div className="p-6 text-white bg-gradient-to-r from-hw-primary to-emerald-500">
                <DialogHeader>
                  <DialogTitle className="text-xl font-bold text-white">
                    HealWin Online Job Application Form
                  </DialogTitle>
                </DialogHeader>
                <p className="mt-1 text-sm text-white/80">
                  {selectedJob.title} • {selectedJob.department}
                </p>
              </div>

              {submitSuccess ? (
                <div className="p-8 text-center">
                  <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-hw-text">
                    Application Submitted!
                  </h3>
                  <p className="mb-4 text-hw-muted">
                    We'll review your application and get back to you soon.
                  </p>
                  <Button
                    onClick={() => {
                      setIsApplyOpen(false);
                      setSubmitSuccess(false);
                    }}
                    className="btn-gradient rounded-xl"
                  >
                    Close
                  </Button>
                </div>
              ) : otpStep === "form" ? (
                /* ── OTP Verification Step ── */
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                  <div className="mb-2 text-center">
                    <Shield className="w-10 h-10 mx-auto mb-3 text-hw-primary" />
                    <h3 className="text-lg font-bold text-hw-text">
                      Verify Your Identity
                    </h3>
                    <p className="mt-1 text-sm text-hw-muted">
                      Please verify your email and enter a valid mobile number
                      before proceeding
                    </p>
                  </div>

                  {otpError && (
                    <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl">
                      {otpError}
                    </div>
                  )}

                  {/* Email OTP */}
                  <div className="p-4 space-y-3 border rounded-xl">
                    <label className="block text-sm font-semibold text-hw-text">
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="email"
                      placeholder="example@email.com"
                      value={applicationForm.email}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          email: e.target.value,
                        })
                      }
                      disabled={emailVerified}
                      className="rounded-xl"
                    />
                    {emailVerified ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <CheckCircle className="w-4 h-4" /> Email verified
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => sendOtp("email")}
                          disabled={otpLoading || emailCooldown > 0}
                          className="w-full text-sm rounded-xl sm:w-auto"
                        >
                          {emailCooldown > 0
                            ? `Resend in ${emailCooldown}s`
                            : "Send OTP"}
                        </Button>
                        <div className="flex w-full gap-2">
                          <Input
                            placeholder="Enter OTP"
                            value={emailOtp}
                            onChange={(e) => setEmailOtp(e.target.value)}
                            className="flex-1 rounded-xl"
                          />
                          <Button
                            type="button"
                            onClick={() => verifyOtp("email")}
                            disabled={otpLoading || !emailOtp}
                            className="text-sm btn-gradient rounded-xl"
                          >
                            Verify
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Phone OTP */}
                  <div className="p-4 space-y-3 border rounded-xl">
                    <label className="block text-sm font-semibold text-hw-text">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit Indian mobile number"
                      value={applicationForm.phone}
                      onChange={(e) => {
                        const normalized = normalizeIndianPhone(
                          e.target.value,
                        ).slice(0, 10);
                        setApplicationForm({
                          ...applicationForm,
                          phone: normalized,
                        });
                        if (phoneVerified) setPhoneVerified(false);
                      }}
                      disabled={phoneVerified}
                      className="rounded-xl"
                    />
                    {phoneVerified ? (
                      <div className="flex items-center gap-2 text-sm text-emerald-600">
                        <CheckCircle className="w-4 h-4" /> Mobile verified
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2 sm:flex-row">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => sendOtp("phone")}
                          disabled={
                            otpLoading ||
                            phoneCooldown > 0 ||
                            !isValidIndianPhone(applicationForm.phone)
                          }
                          className="w-full text-sm rounded-xl sm:w-auto"
                        >
                          {phoneCooldown > 0
                            ? `Resend in ${phoneCooldown}s`
                            : "Send OTP"}
                        </Button>
                        <div className="flex w-full gap-2">
                          <Input
                            placeholder="Enter OTP"
                            value={phoneOtp}
                            onChange={(e) => setPhoneOtp(e.target.value)}
                            className="flex-1 rounded-xl"
                          />
                          <Button
                            type="button"
                            onClick={() => verifyOtp("phone")}
                            disabled={otpLoading || !phoneOtp}
                            className="text-sm btn-gradient rounded-xl"
                          >
                            Verify
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  <Button
                    onClick={proceedToApplicationForm}
                    disabled={
                      !emailVerified ||
                      !phoneVerified ||
                      !isAllowedEmail(applicationForm.email) ||
                      !isValidIndianPhone(applicationForm.phone)
                    }
                    className="w-full py-5 text-base btn-gradient rounded-xl"
                  >
                    Continue to Application Form{" "}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              ) : (
                <form
                  onSubmit={handleSubmit}
                  className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-120px)]"
                >
                  {/* ── Personal Details ── */}
                  <div>
                    <h3 className="flex items-center gap-2 mb-4 text-base font-semibold text-hw-text">
                      <Users className="w-4 h-4 text-hw-primary" />
                      Personal Details <span className="text-red-500">*</span>
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Full Name"
                          value={applicationForm.name}
                          onChange={(e) =>
                            setApplicationForm({
                              ...applicationForm,
                              name: e.target.value,
                            })
                          }
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                          Mobile Number <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="tel"
                          inputMode="numeric"
                          placeholder="10-digit Indian mobile number"
                          value={applicationForm.phone}
                          readOnly
                          required
                          className="rounded-xl bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                          Email Address <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="email"
                          placeholder="example@email.com"
                          value={applicationForm.email}
                          readOnly
                          required
                          className="rounded-xl bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                          Date of Birth <span className="text-red-500">*</span>
                        </label>
                        <Input
                          type="date"
                          value={applicationForm.dob}
                          onChange={(e) =>
                            setApplicationForm({
                              ...applicationForm,
                              dob: e.target.value,
                            })
                          }
                          max={getMaxDobDate()}
                          required
                          className="rounded-xl"
                        />
                        <p className="mt-1 text-xs text-hw-muted">
                          You must be at least 18 years old.
                        </p>
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                          Gender <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={applicationForm.gender}
                          onValueChange={(value) =>
                            setApplicationForm({
                              ...applicationForm,
                              gender: value,
                            })
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select Gender" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                          Marital Status <span className="text-red-500">*</span>
                        </label>
                        <Select
                          value={applicationForm.maritalStatus}
                          onValueChange={(value) =>
                            setApplicationForm({
                              ...applicationForm,
                              maritalStatus: value,
                            })
                          }
                        >
                          <SelectTrigger className="rounded-xl">
                            <SelectValue placeholder="Select Status" />
                          </SelectTrigger>
                          <SelectContent className="rounded-xl">
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            {/* <SelectItem value="Divorced">Divorced</SelectItem>
                            <SelectItem value="Widowed">Widowed</SelectItem> */}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                        Address <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        placeholder="Your full address"
                        rows={2}
                        value={applicationForm.address}
                        onChange={(e) =>
                          setApplicationForm({
                            ...applicationForm,
                            address: e.target.value,
                          })
                        }
                        required
                        className="rounded-xl"
                      />
                    </div>
                  </div>

                  {/* ── Department & Position ── */}
                  <div>
                    <h3 className="flex items-center gap-2 mb-4 text-base font-semibold text-hw-text">
                      <Briefcase className="w-4 h-4 text-hw-primary" />
                      Position Information
                    </h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                          Department <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Department"
                          value={applicationForm.department}
                          onChange={(e) =>
                            setApplicationForm({
                              ...applicationForm,
                              department: e.target.value,
                            })
                          }
                          required
                          className="rounded-xl"
                        />
                      </div>
                      <div>
                        <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                          Position Applied For{" "}
                          <span className="text-red-500">*</span>
                        </label>
                        <Input
                          placeholder="Position"
                          value={applicationForm.position}
                          onChange={(e) =>
                            setApplicationForm({
                              ...applicationForm,
                              position: e.target.value,
                            })
                          }
                          required
                          className="rounded-xl bg-gray-50"
                          readOnly
                        />
                      </div>
                    </div>
                  </div>

                  {/* ── Upload Documents ── */}
                  <div>
                    <h3 className="flex items-center gap-2 mb-1 text-base font-semibold text-hw-text">
                      <Upload className="w-4 h-4 text-hw-primary" />
                      Upload Documents
                    </h3>
                    <p className="mb-4 text-xs text-hw-muted">
                      File size allow PDF / JPG / PNG. Max 10 MB per file.
                    </p>
                    <div className="space-y-3">
                      {[
                        { key: "resume", label: "Resume / CV", required: true },
                        {
                          key: "passportPhoto",
                          label: "Passport Size Photo (Image only)",
                          required: true,
                          accept: "image/*",
                        },
                        {
                          key: "idProof",
                          label:
                            "ID Proof (Aadhaar / Voter ID / Driving License / Pan)",
                          required: true,
                        },
                        {
                          key: "educationalCertificates",
                          label: "Educational Certificates",
                          required: true,
                        },
                        {
                          key: "professionalRegistration",
                          label: "Professional Registration (If Any)",
                          required: false,
                        },
                        {
                          key: "experienceCertificates",
                          label: "Experience Certificates (If Any)",
                          required: false,
                        },
                        {
                          key: "otherDocuments",
                          label: "Other Documents (If Any)",
                          required: false,
                        },
                      ].map((doc) => (
                        <div
                          key={doc.key}
                          className="flex items-center gap-3 p-3 border border-gray-300 border-dashed rounded-xl bg-gray-50/50"
                        >
                          <div className="flex-1 min-w-0">
                            <label className="block text-sm font-medium text-hw-text">
                              {doc.label}
                              {doc.required && (
                                <span className="ml-1 text-red-500">*</span>
                              )}
                            </label>
                            {applicationForm[doc.key] && (
                              <p className="mt-0.5 text-xs text-emerald-600 truncate">
                                ✓ {applicationForm[doc.key].name}
                              </p>
                            )}
                          </div>
                          <label className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border rounded-lg cursor-pointer bg-white text-hw-primary border-hw-primary/30 hover:bg-hw-primary/5 whitespace-nowrap">
                            <Upload className="w-3.5 h-3.5" />
                            {applicationForm[doc.key] ? "Change" : "Upload"}
                            <input
                              type="file"
                              accept={doc.accept || ".pdf,.jpg,.jpeg,.png"}
                              className="hidden"
                              required={
                                doc.required && !applicationForm[doc.key]
                              }
                              onChange={(e) => {
                                if (e.target.files?.[0]) {
                                  setApplicationForm({
                                    ...applicationForm,
                                    [doc.key]: e.target.files[0],
                                  });
                                }
                              }}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Preferred Locations (max 3) ── */}
                  {selectedJob &&
                    ((selectedJob.states && selectedJob.states.length > 0) ||
                      (selectedJob.districts &&
                        selectedJob.districts.length > 0)) && (
                      <div>
                        <h3 className="flex items-center gap-2 mb-2 text-base font-semibold text-hw-text">
                          <MapPin className="w-4 h-4 text-hw-primary" />
                          Select Preferred Locations{" "}
                          <span className="text-xs font-normal text-hw-muted">
                            (max 3 total)
                          </span>
                        </h3>
                        {selectedStates.length + selectedDistricts.length >=
                          3 && (
                          <p className="mb-2 text-xs text-amber-600">
                            Maximum 3 locations selected
                          </p>
                        )}
                        {selectedJob.states &&
                          selectedJob.states.length > 0 && (
                            <div className="mb-3">
                              <label className="block mb-1 text-sm font-medium text-hw-muted">
                                States
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.states.map((s) => {
                                  const isSelected = selectedStates.includes(
                                    s._id,
                                  );
                                  const atMax =
                                    selectedStates.length +
                                      selectedDistricts.length >=
                                    3;
                                  return (
                                    <button
                                      key={s._id}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected)
                                          setSelectedStates(
                                            selectedStates.filter(
                                              (id) => id !== s._id,
                                            ),
                                          );
                                        else if (!atMax)
                                          setSelectedStates([
                                            ...selectedStates,
                                            s._id,
                                          ]);
                                      }}
                                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                        isSelected
                                          ? "bg-hw-primary text-white border-hw-primary"
                                          : atMax
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-hw-text border-gray-300 hover:border-hw-primary"
                                      }`}
                                      disabled={!isSelected && atMax}
                                    >
                                      {s.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        {selectedJob.districts &&
                          selectedJob.districts.length > 0 && (
                            <div>
                              <label className="block mb-1 text-sm font-medium text-hw-muted">
                                Districts
                              </label>
                              <div className="flex flex-wrap gap-2">
                                {selectedJob.districts.map((d) => {
                                  const isSelected = selectedDistricts.includes(
                                    d._id,
                                  );
                                  const atMax =
                                    selectedStates.length +
                                      selectedDistricts.length >=
                                    3;
                                  return (
                                    <button
                                      key={d._id}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected)
                                          setSelectedDistricts(
                                            selectedDistricts.filter(
                                              (id) => id !== d._id,
                                            ),
                                          );
                                        else if (!atMax)
                                          setSelectedDistricts([
                                            ...selectedDistricts,
                                            d._id,
                                          ]);
                                      }}
                                      className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                                        isSelected
                                          ? "bg-emerald-500 text-white border-emerald-500"
                                          : atMax
                                            ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                                            : "bg-white text-hw-text border-gray-300 hover:border-emerald-500"
                                      }`}
                                      disabled={!isSelected && atMax}
                                    >
                                      {d.name}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                      </div>
                    )}

                  {/* ── Declaration ── */}
                  <div className="p-4 border rounded-xl bg-gray-50">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={applicationForm.declaration}
                        onChange={(e) =>
                          setApplicationForm({
                            ...applicationForm,
                            declaration: e.target.checked,
                          })
                        }
                        required
                        className="w-4 h-4 mt-1 accent-hw-primary"
                      />
                      <span className="text-sm text-hw-text">
                        I confirm that the information provided is true and
                        correct.
                      </span>
                    </label>
                  </div>

                  {/* Submit */}
                  <div className="pt-2">
                    <Button
                      type="submit"
                      disabled={submitLoading || !applicationForm.declaration}
                      className="w-full py-6 text-lg shadow-lg btn-gradient rounded-xl"
                    >
                      {submitLoading ? (
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-5 h-5 mr-2" />
                      )}
                      {submitLoading ? "Submitting..." : "Submit Application"}
                    </Button>
                  </div>
                </form>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Resume Submit Modal */}
      <Dialog
        open={isResumeSubmitOpen}
        onOpenChange={(open) => {
          setIsResumeSubmitOpen(open);
          if (!open) {
            setResumeSubmitError("");
            setResumeSubmitSuccess(false);
          }
        }}
      >
        <DialogContent className="max-w-lg p-0 overflow-hidden rounded-3xl">
          <div className="p-6 text-white bg-gradient-to-r from-hw-primary to-emerald-500">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold text-white">
                Submit Your Resume
              </DialogTitle>
            </DialogHeader>
            <p className="mt-1 text-sm text-white/85">
              Share your profile and we will forward it to the HR team.
            </p>
          </div>

          {resumeSubmitSuccess ? (
            <div className="p-8 text-center">
              <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-hw-text">
                Resume Submitted!
              </h3>
              <p className="text-hw-muted">
                Your resume has been sent to HealWin HR.
              </p>
            </div>
          ) : (
            <form onSubmit={handleResumeSubmit} className="p-6 space-y-4">
              {resumeSubmitError && (
                <div className="p-3 text-sm text-red-700 bg-red-50 rounded-xl">
                  {resumeSubmitError}
                </div>
              )}

              <div>
                <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <Input
                  value={resumeForm.name}
                  onChange={(e) =>
                    setResumeForm({ ...resumeForm, name: e.target.value })
                  }
                  placeholder="Enter your name"
                  required
                  className="rounded-xl"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="email"
                    value={resumeForm.email}
                    onChange={(e) =>
                      setResumeForm({ ...resumeForm, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    required
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                    Mobile <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    maxLength={10}
                    value={resumeForm.phone}
                    onChange={(e) =>
                      setResumeForm({
                        ...resumeForm,
                        phone: normalizeIndianPhone(e.target.value).slice(
                          0,
                          10,
                        ),
                      })
                    }
                    placeholder="10-digit Indian mobile number"
                    required
                    className="rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                  Message (Optional)
                </label>
                <Textarea
                  value={resumeForm.message}
                  onChange={(e) =>
                    setResumeForm({ ...resumeForm, message: e.target.value })
                  }
                  placeholder="Tell us briefly about your profile"
                  className="rounded-xl min-h-[96px]"
                />
              </div>

              <div>
                <label className="block mb-1.5 text-sm font-medium text-hw-muted">
                  Resume <span className="text-red-500">*</span>
                </label>
                <label className="flex items-center justify-between w-full gap-3 px-4 py-3 transition border border-dashed cursor-pointer rounded-xl hover:border-hw-primary/60">
                  <span className="text-sm truncate text-hw-text">
                    {resumeForm.resume
                      ? resumeForm.resume.name
                      : "Upload resume (.pdf, .doc, .docx)"}
                  </span>
                  <span className="inline-flex items-center px-3 py-1 text-xs font-semibold border rounded-lg text-hw-primary border-hw-primary/30">
                    Choose File
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setResumeForm({
                          ...resumeForm,
                          resume: e.target.files[0],
                        });
                      }
                    }}
                    required
                  />
                </label>
              </div>

              <Button
                type="submit"
                disabled={resumeSubmitLoading}
                className="w-full py-6 text-base shadow-lg btn-gradient rounded-xl"
              >
                {resumeSubmitLoading ? (
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                ) : (
                  <Upload className="w-5 h-5 mr-2" />
                )}
                {resumeSubmitLoading ? "Submitting..." : "Submit Resume"}
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Bottom CTA */}
      <section className="relative px-4 py-24 overflow-hidden sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-gradient-to-r from-hw-primary to-emerald-500" />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center justify-center w-20 h-20 mx-auto mb-8 rounded-full bg-white/20">
              <Heart className="w-10 h-10 text-white" />
            </div>

            <h2 className="mb-6 text-3xl font-bold text-white font-heading sm:text-4xl lg:text-5xl">
              Can't Find a Suitable Role?
            </h2>
            <p className="max-w-2xl mx-auto mb-10 text-lg text-white/80">
              We're always looking for talented individuals. Send us your resume
              and we'll reach out when a suitable position opens up.
            </p>

            <Button
              size="lg"
              onClick={() => {
                setResumeSubmitError("");
                setResumeSubmitSuccess(false);
                setIsResumeSubmitOpen(true);
              }}
              className="px-8 text-lg font-semibold bg-white shadow-xl text-hw-primary hover:bg-white/90 rounded-xl py-7"
            >
              <Upload className="w-5 h-5 mr-2" />
              Submit Your Resume
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default CareerPage;
