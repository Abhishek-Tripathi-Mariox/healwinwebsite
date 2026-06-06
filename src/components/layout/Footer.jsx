import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Heart,
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Linkedin,
  Instagram,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import useAppStore from "@/store/useAppStore";
import LiveVisitorCounter from "@/components/home/LiveVisitorCounter";

const Footer = () => {
  const contactData = useAppStore((s) => s.contactData);
  const logoSettings = useAppStore((s) => s.logoSettings);
  const fetchContact = useAppStore((s) => s.fetchContact);
  const fetchLogo = useAppStore((s) => s.fetchLogo);

  useEffect(() => {
    fetchContact();
    fetchLogo();
  }, [fetchContact, fetchLogo]);
  const footerLinks = {
    services: [
      { name: "Ambulance Booking", path: "/services#ambulance" },
      { name: "Emergency Centres", path: "/centre-locator" },
      { name: "Laboratory Network", path: "/services#laboratory" },
      { name: "Financial Services", path: "/financial-services" },
    ],
    company: [
      { name: "About Us", path: "/about" },
      { name: "Our Team", path: "/team" },
      { name: "Careers", path: "/careers" },
      { name: "News & Updates", path: "/news-gallery" },
    ],
    support: [
      { name: "Contact Us", path: "/contact" },
      { name: "FAQs", path: "/contact#faq" },
      { name: "Privacy Policy", path: "/privacy-policy" },
      { name: "Terms & Conditions", path: "/terms-and-conditions" },
    ],
  };

  return (
    <footer
      className="relative overflow-hidden text-white bg-hw-text"
      data-testid="main-footer"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-hw-text to-gray-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-hw-primary/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-hw-accent/5 rounded-full blur-[120px]" />

      <div className="relative px-4 py-20 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex flex-col items-start mb-6 group">
              {logoSettings.mainLogo ? (
                <div className="flex flex-col items-start py-1 transition-transform duration-300 shrink-0 group-hover:scale-105">
                  <img
                    src={logoSettings.mainLogo}
                    alt="HealWin"
                    className="object-contain w-auto h-10"
                  />
                  <span className="text-[12px] font-semibold tracking-[0.18em] italic text-hw-accent/70 mt-1 ml-0.5">
                    Your Life, Our Mission
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-start">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center shadow-lg w-11 h-11 bg-gradient-to-br from-hw-primary to-hw-accent rounded-xl">
                      <Heart className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-2xl font-bold font-heading">
                      HealWin
                    </span>
                  </div>
                  <span className="text-[12px] font-semibold tracking-[0.18em] italic text-hw-accent/70 mt-1 ml-0.5">
                    Your Life, Our Mission
                  </span>
                </div>
              )}
            </Link>
            <p className="max-w-sm mb-8 leading-relaxed text-gray-400">
              {contactData?.footerDescription || ""}
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-gray-400 transition-colors hover:text-white">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5">
                  <MapPin className="w-5 h-5 text-hw-accent" />
                </div>
                <span>{contactData?.footerOfficeLabel || ""}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 transition-colors hover:text-white">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5">
                  <Phone className="w-5 h-5 text-hw-primary" />
                </div>
                <span>Emergency: {contactData?.emergencyHelpline || ""}</span>
              </div>
              <div className="flex items-center gap-3 text-gray-400 transition-colors hover:text-white">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/5">
                  <Mail className="w-5 h-5 text-hw-highlight" />
                </div>
                <span>{contactData?.supportEmail || ""}</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h4 className="mb-6 text-lg font-semibold font-heading">
              Services
            </h4>
            <ul className="space-y-4">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-gray-400 transition-all duration-200 hover:text-white hover:pl-2 group"
                  >
                    <ArrowRight className="w-4 h-4 transition-opacity opacity-0 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="mb-6 text-lg font-semibold font-heading">Company</h4>
            <ul className="space-y-4">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-gray-400 transition-all duration-200 hover:text-white hover:pl-2 group"
                  >
                    <ArrowRight className="w-4 h-4 transition-opacity opacity-0 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="mb-6 text-lg font-semibold font-heading">Support</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    className="flex items-center gap-2 text-gray-400 transition-all duration-200 hover:text-white hover:pl-2 group"
                  >
                    <ArrowRight className="w-4 h-4 transition-opacity opacity-0 group-hover:opacity-100" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="flex flex-col items-center justify-between gap-6 pt-8 mt-16 border-t border-white/10 md:flex-row">
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-6">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} HealWin Healthcare. All rights
              reserved.
            </p>
            <LiveVisitorCounter variant="dark" />
          </div>
          <div className="flex items-center gap-3">
            {[
              { icon: Facebook, href: contactData?.facebookUrl || "" },
              { icon: Twitter, href: contactData?.twitterUrl || "" },
              { icon: Linkedin, href: contactData?.linkedinUrl || "" },
              { icon: Instagram, href: contactData?.instagramUrl || "" },
            ]
              .filter((s) => s.href)
              .map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  className="flex items-center justify-center w-10 h-10 text-gray-400 transition-all duration-300 rounded-xl bg-white/5 hover:bg-gradient-to-br hover:from-hw-primary hover:to-hw-accent hover:text-white"
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
