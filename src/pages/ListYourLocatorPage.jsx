import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  User,
  CheckCircle,
  Loader2,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { apiFetch, API_URL } from "@/lib/api";
import { Link } from "react-router-dom";
import MapPicker from "@/components/MapPicker";

const ListYourLocatorPage = () => {
  const [serviceTypes, setServiceTypes] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    address: "",
    state: "",
    district: "",
    phone: "",
    email: "",
    website: "",
    timings: "",
    services: "",
    info: "",
    contactPerson: "",
    contactPhone: "",
    contactEmail: "",
    serviceTypes: [],
    lat: null,
    lng: null,
    mapAddress: "",
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const typesRes = await apiFetch("/centres/service-types");
        setServiceTypes(typesRes.data || []);
      } catch {}
    };
    loadData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Phone fields: digits only, capped at 10.
    const next =
      name === "phone" || name === "contactPhone"
        ? value.replace(/\D/g, "").slice(0, 10)
        : value;
    setForm((prev) => ({ ...prev, [name]: next }));
  };

  const toggleServiceType = (id) => {
    setForm((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(id)
        ? prev.serviceTypes.filter((s) => s !== id)
        : [...prev.serviceTypes, id],
    }));
  };

  const handleMapChange = ({ lat, lng, address, state, district }) => {
    setForm((prev) => ({
      ...prev,
      lat,
      lng,
      mapAddress: address,
      address: address || prev.address,
      state: state || prev.state,
      district: district || prev.district,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !form.name.trim() ||
      !form.address.trim() ||
      !form.state.trim() ||
      !form.district.trim() ||
      !form.contactPerson.trim() ||
      !form.contactPhone.trim()
    ) {
      setError(
        "Please fill in all required fields: Centre Name, Address, State, District, Contact Person and Contact Phone.",
      );
      return;
    }

    const mobileRegex = /^[6-9]\d{9}$/;
    if (!mobileRegex.test(form.contactPhone.trim())) {
      setError("Contact Phone must be a valid 10-digit mobile number (starting 6-9).");
      return;
    }
    if (form.phone.trim() && !mobileRegex.test(form.phone.trim())) {
      setError("Phone must be a valid 10-digit mobile number (starting 6-9).");
      return;
    }

    setSubmitting(true);
    try {
      const body = {
        name: form.name.trim(),
        address: form.address.trim(),
        state: form.state.trim(),
        district: form.district.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        website: form.website.trim(),
        timings: form.timings.trim(),
        services: JSON.stringify(
          form.services
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
        ),
        info: form.info.trim(),
        contactPerson: form.contactPerson.trim(),
        contactPhone: form.contactPhone.trim(),
        contactEmail: form.contactEmail.trim(),
        serviceTypes: JSON.stringify(form.serviceTypes),
        lat: form.lat,
        lng: form.lng,
      };

      const res = await apiFetch("/centres/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.success) {
        setSubmitted(true);
      } else {
        setError(res.message || "Submission failed. Please try again.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again later.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-hw-base">
        <div className="pt-32 pb-20 px-4 mx-auto max-w-2xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="p-10 bg-white rounded-2xl shadow-lg"
          >
            <div className="flex justify-center mb-6">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-hw-text mb-3">
              Request Submitted Successfully!
            </h2>
            <p className="text-hw-muted mb-8">
              Thank you for submitting your centre listing request. Our team
              will review your information and get back to you shortly. Once
              approved, your centre will appear in our Centre Locator.
            </p>
            <div className="flex justify-center gap-4">
              <Link to="/centre-locator">
                <Button
                  size="lg"
                  className="bg-hw-primary hover:bg-hw-primary-dark text-white rounded-xl"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Centre Locator
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-hw-base">
      {/* Hero */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-blue-50/50 to-cyan-50/30" />
        <div className="relative z-10 px-4 pt-12 pb-4 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto text-center"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 mb-6 text-sm font-medium rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary">
              <Building2 className="w-4 h-4" />
              List Your Centre
            </span>
            <h1 className="mb-4 text-3xl font-bold font-heading sm:text-4xl lg:text-5xl text-hw-text">
              Get Your Centre Listed on{" "}
              <span className="text-transparent bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text">
                HealWin
              </span>
            </h1>
            <p className="max-w-2xl mx-auto text-lg text-hw-muted">
              Submit your healthcare centre details below. Once reviewed and
              approved by our team, your centre will be visible on the HealWin
              Centre Locator.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Form */}
      <section className="relative z-20 px-4 pb-20 mx-auto max-w-4xl sm:px-6 lg:px-8">
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 bg-white rounded-2xl shadow-lg space-y-8"
        >
          {error && (
            <div className="p-4 text-sm text-red-700 border border-red-200 rounded-xl bg-red-50">
              {error}
            </div>
          )}

          {/* Centre Information */}
          <div>
            <h2 className="text-lg font-semibold text-hw-text mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-hw-primary" />
              Centre Information
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Label htmlFor="name">
                  Centre Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. HealWin Health Centre"
                  className="mt-1"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="address">
                  Address <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="address"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Full address of your centre"
                  className="mt-1"
                  rows={2}
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label className="flex items-center gap-1.5 mb-2">
                  <MapPin className="w-4 h-4 text-hw-primary" />
                  Pin on Map (optional)
                </Label>
                <MapPicker
                  value={{ lat: form.lat, lng: form.lng, address: form.mapAddress }}
                  onChange={handleMapChange}
                />
              </div>
              <div>
                <Label htmlFor="state">
                  State <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="state"
                  name="state"
                  value={form.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="district">
                  District <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="district"
                  name="district"
                  value={form.district}
                  onChange={handleChange}
                  placeholder="e.g. Mumbai"
                  className="mt-1"
                  required
                />
              </div>
            </div>
          </div>

          {/* Contact Details */}
          <div>
            <h2 className="text-lg font-semibold text-hw-text mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-hw-primary" />
              Centre Contact Details
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="contact@yourcentre.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  placeholder="https://www.yourcentre.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="timings">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Timings
                </Label>
                <Input
                  id="timings"
                  name="timings"
                  value={form.timings}
                  onChange={handleChange}
                  placeholder="Mon-Sat 9AM-6PM"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h2 className="text-lg font-semibold text-hw-text mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-hw-primary" />
              Services & Facilities
            </h2>
            <div className="space-y-4">
              <div>
                <Label htmlFor="services">Services (comma-separated)</Label>
                <Input
                  id="services"
                  name="services"
                  value={form.services}
                  onChange={handleChange}
                  placeholder="Emergency, ICU, OPD, Pharmacy, Lab"
                  className="mt-1"
                />
              </div>

              {serviceTypes.length > 0 && (
                <div>
                  <Label>Service Types</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {serviceTypes.map((st) => (
                      <button
                        key={st._id}
                        type="button"
                        onClick={() => toggleServiceType(st._id)}
                        className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                          form.serviceTypes.includes(st._id)
                            ? "bg-hw-primary text-white border-hw-primary"
                            : "bg-white text-gray-600 border-gray-200 hover:border-hw-primary/50"
                        }`}
                      >
                        {st.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="info">Description / Additional Info</Label>
                <Textarea
                  id="info"
                  name="info"
                  value={form.info}
                  onChange={handleChange}
                  placeholder="Brief description about your centre, specialities, etc."
                  className="mt-1"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Your Contact (Submitter) */}
          <div>
            <h2 className="text-lg font-semibold text-hw-text mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-hw-primary" />
              Your Contact Details (for verification)
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="contactPerson">
                  Contact Person <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPerson"
                  name="contactPerson"
                  value={form.contactPerson}
                  onChange={handleChange}
                  placeholder="Your full name"
                  className="mt-1"
                  required
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">
                  Contact Phone <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="contactPhone"
                  name="contactPhone"
                  type="tel"
                  inputMode="numeric"
                  maxLength={10}
                  value={form.contactPhone}
                  onChange={handleChange}
                  placeholder="10-digit mobile number"
                  className="mt-1"
                  required
                />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input
                  id="contactEmail"
                  name="contactEmail"
                  type="email"
                  value={form.contactEmail}
                  onChange={handleChange}
                  placeholder="your.email@example.com"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t">
            <Button
              type="submit"
              size="lg"
              disabled={submitting}
              className="w-full sm:w-auto px-10 py-6 text-lg bg-hw-primary hover:bg-hw-primary-dark text-white rounded-xl"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Listing Request"
              )}
            </Button>
            <p className="mt-3 text-sm text-hw-muted">
              Your request will be reviewed by the HealWin team. You will be
              contacted at the number/email you provided.
            </p>
          </div>
        </motion.form>
      </section>
    </div>
  );
};

export default ListYourLocatorPage;
