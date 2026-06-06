import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone, Heart, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import useAppStore from "@/store/useAppStore";
import useSOSStore from "@/store/useSOSStore";

const navItems = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Services", path: "/services" },
  { name: "Centre Locator", path: "/centre-locator" },
  { name: "Our Team", path: "/team" },
  { name: "Business", path: "/business" },
  { name: "Health Card", path: "/health-card" },
  { name: "Careers", path: "/careers" },
  { name: "News & Updates", path: "/news-gallery" },
  { name: "Contact", path: "/contact" },
];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const logoSettings = useAppStore((s) => s.logoSettings);
  const fetchLogo = useAppStore((s) => s.fetchLogo);
  const fireTrigger = useSOSStore((s) => s.fireTrigger);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  // Fetch logo settings (cached in store – only calls API once)
  useEffect(() => {
    fetchLogo();
  }, [fetchLogo]);

  return (
    <>
      <motion.nav
        data-testid="main-navbar"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass shadow-lg shadow-hw-primary/5" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 lg:h-24">
            {/* Logo */}
            <Link
              to="/"
              className="flex items-center shrink-0 group lg:-ml-3"
              data-testid="navbar-logo"
            >
              {logoSettings.mainLogo ? (
                <div className="flex flex-col items-center shrink-0 transition-transform duration-300 group-hover:scale-105 py-1">
                  <img
                    src={logoSettings.mainLogo}
                    alt="HealWin"
                    className="h-10 w-auto object-contain"
                  />
                  <span
                    className="block text-[12px] font-semibold tracking-[0.18em] italic mt-0.5 text-center"
                    style={{
                      background: "linear-gradient(90deg, #0077B6, #E63946)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Your Life, Our Mission
                  </span>
                </div>
              ) : (
                <div className="flex flex-col items-center shrink-0 transition-transform duration-300 group-hover:scale-105 py-1">
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gradient-to-br from-hw-primary to-hw-accent rounded-xl flex items-center justify-center shadow-lg shadow-hw-primary/20 group-hover:shadow-hw-primary/40 transition-shadow duration-300">
                        <Heart className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <span className="font-heading font-bold text-xl bg-gradient-to-r from-hw-text to-hw-muted bg-clip-text text-transparent">
                      HealWin
                    </span>
                  </div>
                  <span
                    className="block text-[12px] font-semibold tracking-[0.18em] italic mt-0.5 text-center"
                    style={{
                      background: "linear-gradient(90deg, #0077B6, #E63946)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Your Life, Our Mission
                  </span>
                </div>
              )}
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.slice(0, 9).map((item) => (
                <Link
                  key={item.name}
                  to={item.path}
                  data-testid={`nav-link-${item.name.toLowerCase().replace(/\s+/g, "-")}`}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-300 flex items-center gap-1 whitespace-nowrap shrink-0 ${
                    location.pathname === item.path
                      ? "text-hw-primary bg-hw-primary/5"
                      : "text-hw-text/80 hover:text-hw-primary hover:bg-hw-primary/5"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden lg:flex items-center space-x-3">
              <Button
                variant="ghost"
                size="sm"
                className="text-hw-muted hover:text-hw-primary hover:bg-hw-primary/5"
                data-testid="nav-download-btn"
              >
                <Download className="w-4 h-4 mr-1.5" />
                App
              </Button>
              <Button
                size="sm"
                onClick={fireTrigger}
                className="btn-gradient rounded-xl px-5 shadow-lg shadow-hw-primary/20"
                data-testid="nav-emergency-btn"
              >
                <Phone className="w-4 h-4 mr-1.5" />
                Emergency
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              data-testid="mobile-menu-toggle"
              className="lg:hidden p-2 rounded-xl hover:bg-hw-primary/5 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed inset-y-0 right-0 w-full max-w-sm glass z-40 shadow-2xl lg:hidden overflow-y-auto"
            data-testid="mobile-menu"
          >
            <div className="pt-24 pb-6 px-6">
              <div className="space-y-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? "text-hw-primary bg-hw-primary/10"
                        : "text-hw-text hover:bg-hw-primary/5 hover:text-hw-primary"
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
              <div className="mt-8 pt-8 border-t border-hw-primary/10 space-y-3">
                <Button
                  variant="outline"
                  className="w-full rounded-xl border-hw-primary/20 text-hw-primary hover:bg-hw-primary/5"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download App
                </Button>
                <Button
                  onClick={() => {
                    fireTrigger();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full btn-gradient rounded-xl"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Emergency Call
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
