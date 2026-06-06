import React, { useState, useRef, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  MessageSquare,
  Briefcase,
  AlertCircle,
  Send,
  Building,
  Heart,
  Globe,
  Headphones,
  ChevronDown,
  HelpCircle,
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Link } from "react-router-dom";
import useAppStore from "@/store/useAppStore";
import useHomeStore from "@/store/useHomeStore";
import { apiFetch } from "@/lib/api";

// Icon mapping for dynamic icons from the backend
const iconMap = {
  AlertCircle,
  MessageSquare,
  Briefcase,
  Phone,
  Mail,
  Heart,
  Globe,
  Headphones,
  Building,
  MapPin,
};

const ContactPage = () => {
  const containerRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isJobPopupOpen, setIsJobPopupOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Dynamic content from API
  const contactData = useAppStore((s) => s.contactData);
  const fetchContact = useAppStore((s) => s.fetchContact);
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";
  const [contactDirectories, setContactDirectories] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    fetchContact();
  }, [fetchContact]);
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  useEffect(() => {
    apiFetch("/contact/faqs")
      .then((json) => {
        if (json.data) setFaqs(json.data);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (contactData) {
      setContactDirectories(
        (contactData.contactDirectories || []).map((d) => ({
          ...d,
          icon: iconMap[d.icon] || MessageSquare,
        })),
      );
    }
  }, [contactData]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const phone = contactForm.phone.trim();
    if (phone && !/^[6-9]\d{9}$/.test(phone)) {
      alert("Please enter a valid 10-digit mobile number (starting 6-9).");
      return;
    }
    setSubmitting(true);
    try {
      const json = await apiFetch("/contact/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(contactForm),
      });
      if (json.message !== "Failed" && !json.error) {
        setSubmitSuccess(true);
        setContactForm({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        });
        setTimeout(() => setSubmitSuccess(false), 5000);
      } else {
        alert(json.message || "Failed to send message");
      }
    } catch (err) {
      alert("Failed to send message. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="min-h-screen bg-hw-base"
      data-testid="contact-page"
      ref={containerRef}
    >
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-blue-50/50 to-cyan-50/30" />
          {homeHeroImage && (
            <img
              src={homeHeroImage}
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
          )}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-hw-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-hw-accent/10 rounded-full blur-[100px]" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary text-sm font-medium mb-6"
            >
              <Headphones className="w-4 h-4" />
              Get in Touch
            </motion.span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-hw-text mb-6">
              {contactData?.heroTitle || "Contact"}{" "}
              <span className="bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text text-transparent">
                {contactData?.heroHighlight || "Us"}
              </span>
            </h1>

            <p className="text-lg text-hw-muted leading-relaxed max-w-2xl mx-auto">
              {contactData?.heroSubtitle || ""}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24"
        ref={ref}
      >
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Company Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1"
          >
            <div className="glass rounded-3xl p-6 shadow-xl sticky top-24">
              <div className="flex items-center gap-4 mb-8">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hw-primary to-hw-accent flex items-center justify-center shadow-lg">
                  <Building className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-lg text-hw-text">
                    {contactData?.companyName || ""}
                  </h3>
                  <p className="text-sm text-hw-muted">
                    {contactData?.companyTagline || ""}
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50">
                  <div className="w-10 h-10 rounded-xl bg-hw-primary/10 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-hw-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-hw-text">
                      Head Office
                    </p>
                    <p className="text-sm text-hw-muted">
                      {contactData?.officeAddress || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50">
                  <div className="w-10 h-10 rounded-xl bg-hw-sos/10 flex items-center justify-center flex-shrink-0">
                    <Phone className="w-5 h-5 text-hw-sos" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-hw-text">
                      Emergency Helpline
                    </p>
                    <p className="text-sm text-hw-muted">
                      {contactData?.emergencyHelpline || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50">
                  <div className="w-10 h-10 rounded-xl bg-hw-accent/10 flex items-center justify-center flex-shrink-0">
                    <Mail className="w-5 h-5 text-hw-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-hw-text">Email</p>
                    <p className="text-sm text-hw-muted">
                      {contactData?.supportEmail || ""}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-xl bg-white/50">
                  <div className="w-10 h-10 rounded-xl bg-hw-highlight/10 flex items-center justify-center flex-shrink-0">
                    <Clock className="w-5 h-5 text-hw-highlight" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-hw-text">
                      Working Hours
                    </p>
                    <p className="text-sm text-hw-muted">
                      {contactData?.workingHoursEmergency || ""}
                    </p>
                    <p className="text-sm text-hw-muted">
                      {contactData?.workingHoursOffice || ""}
                    </p>
                  </div>
                </div>
              </div>

              {/* Job Opportunity */}
              <div className="mt-8 pt-6 border-t border-hw-primary/10">
                <Dialog open={isJobPopupOpen} onOpenChange={setIsJobPopupOpen}>
                  <DialogTrigger asChild>
                    <Button
                      className="w-full bg-gradient-to-r from-hw-accent to-cyan-600 hover:opacity-90 text-white rounded-xl shadow-lg shadow-hw-accent/20"
                      data-testid="job-opportunity-btn"
                    >
                      <Briefcase className="w-4 h-4 mr-2" />
                      Looking for Jobs?
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl">
                    <DialogHeader>
                      <DialogTitle className="font-heading text-xl">
                        Career Opportunities at HealWin
                      </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 mt-4">
                      <p className="text-hw-muted">
                        We're always looking for talented individuals to join
                        our mission of transforming healthcare in Northeast
                        India.
                      </p>
                      <div className="glass rounded-2xl p-5">
                        <h4 className="font-heading font-semibold text-hw-text mb-3">
                          Current Openings
                        </h4>
                        <p className="text-sm text-hw-muted">
                          Visit our careers page for the latest openings.
                        </p>
                      </div>
                      <Button
                        asChild
                        className="w-full btn-gradient rounded-xl"
                      >
                        <Link to="/careers">View All Openings</Link>
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </motion.div>

          {/* Contact Form & Directory */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 space-y-8"
          >
            {/* Contact Directory */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {contactDirectories.map((contact, index) => (
                <motion.div
                  key={contact.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="premium-card rounded-2xl p-5 group"
                  data-testid={`contact-directory-${index}`}
                >
                  <div
                    className={`w-12 h-12 rounded-xl bg-gradient-to-br ${contact.gradient} flex items-center justify-center mb-4 shadow-lg`}
                  >
                    <contact.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="font-heading font-bold text-hw-text text-sm mb-1">
                    {contact.title}
                  </h3>
                  <p className="text-xs text-hw-muted mb-4">
                    {contact.description}
                  </p>
                  <div className="space-y-2 text-xs">
                    <p className="text-hw-text font-medium">{contact.name}</p>
                    <a
                      href={`mailto:${contact.email}`}
                      className="text-hw-primary hover:underline block truncate"
                    >
                      {contact.email}
                    </a>
                    <a
                      href={`tel:${contact.phone}`}
                      className="text-hw-accent hover:underline block"
                    >
                      {contact.phone}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-3xl p-8 shadow-xl"
            >
              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hw-primary to-hw-accent flex items-center justify-center">
                  <Send className="w-6 h-6 text-white" />
                </div>
                <h2 className="font-heading text-xl font-bold text-hw-text">
                  Send us a Message
                </h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-hw-muted mb-2 block">
                      Full Name
                    </label>
                    <Input
                      placeholder="Enter your name"
                      value={contactForm.name}
                      onChange={(e) =>
                        setContactForm({ ...contactForm, name: e.target.value })
                      }
                      className="rounded-xl py-6 border-hw-primary/10 focus:border-hw-primary/30"
                      data-testid="contact-name-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-hw-muted mb-2 block">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="your@email.com"
                      value={contactForm.email}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          email: e.target.value,
                        })
                      }
                      className="rounded-xl py-6 border-hw-primary/10 focus:border-hw-primary/30"
                      data-testid="contact-email-input"
                    />
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-hw-muted mb-2 block">
                      Phone
                    </label>
                    <Input
                      type="tel"
                      inputMode="numeric"
                      maxLength={10}
                      placeholder="10-digit mobile number"
                      value={contactForm.phone}
                      onChange={(e) =>
                        setContactForm({
                          ...contactForm,
                          phone: e.target.value.replace(/\D/g, "").slice(0, 10),
                        })
                      }
                      className="rounded-xl py-6 border-hw-primary/10 focus:border-hw-primary/30"
                      data-testid="contact-phone-input"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-hw-muted mb-2 block">
                      Subject
                    </label>
                    <Select
                      value={contactForm.subject}
                      onValueChange={(value) =>
                        setContactForm({ ...contactForm, subject: value })
                      }
                    >
                      <SelectTrigger
                        data-testid="contact-subject-select"
                        className="rounded-xl py-6 border-hw-primary/10"
                      >
                        <SelectValue placeholder="Select subject" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="general" className="rounded-lg">
                          General Inquiry
                        </SelectItem>
                        <SelectItem value="emergency" className="rounded-lg">
                          Emergency Services
                        </SelectItem>
                        <SelectItem value="business" className="rounded-lg">
                          Business Inquiry
                        </SelectItem>
                        <SelectItem value="feedback" className="rounded-lg">
                          Feedback
                        </SelectItem>
                        <SelectItem value="complaint" className="rounded-lg">
                          Complaint
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-hw-muted mb-2 block">
                    Message
                  </label>
                  <Textarea
                    placeholder="Write your message here..."
                    rows={5}
                    value={contactForm.message}
                    onChange={(e) =>
                      setContactForm({
                        ...contactForm,
                        message: e.target.value,
                      })
                    }
                    className="rounded-xl border-hw-primary/10 focus:border-hw-primary/30"
                    data-testid="contact-message-input"
                  />
                </div>
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 text-green-700 rounded-xl p-4 text-sm">
                    Your message has been sent successfully! We'll get back to
                    you soon.
                  </div>
                )}
                <Button
                  type="submit"
                  disabled={submitting}
                  className="w-full btn-gradient rounded-xl py-6 text-lg shadow-xl shadow-hw-primary/20 disabled:opacity-50"
                  data-testid="contact-submit-btn"
                >
                  <Send className="w-5 h-5 mr-2" />
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section
        id="faq"
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-24"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-center mb-12">
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary text-sm font-medium mb-4">
              <HelpCircle className="w-4 h-4" />
              FAQs
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-hw-text">
              Frequently Asked{" "}
              <span className="bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text text-transparent">
                Questions
              </span>
            </h2>
          </div>

          {faqs.length > 0 ? (
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <motion.div
                  key={faq._id}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 }}
                  className="glass rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenFaq(openFaq === faq._id ? null : faq._id)
                    }
                    className="w-full flex items-center justify-between p-5 text-left"
                  >
                    <span className="font-heading font-semibold text-hw-text pr-4">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-hw-muted flex-shrink-0 transition-transform duration-300 ${
                        openFaq === faq._id ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFaq === faq._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-5 text-hw-muted leading-relaxed border-t border-hw-primary/5 pt-4">
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-center text-hw-muted">
              No FAQs available at the moment.
            </p>
          )}
        </motion.div>
      </section>
    </div>
  );
};

export default ContactPage;
