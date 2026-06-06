import React, { useRef, useState, useEffect, useMemo } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import {
  Ambulance,
  Building2,
  FlaskConical,
  Wallet,
  ArrowRight,
  Phone,
  CheckCircle,
  Shield,
  Clock,
  MapPin,
  Heart,
  Stethoscope,
  Activity,
  Sparkles,
  Star,
  Zap,
  Users,
  Award,
  Briefcase,
  GraduationCap,
  TrendingUp,
  Loader2,
  Navigation,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import NearbyServicesMap from "@/components/services/NearbyServicesMap";
import useServicesStore from "@/store/useServicesStore";
import useHomeStore from "@/store/useHomeStore";

// Map icon name strings to components
const ICON_MAP = {
  Ambulance,
  Building2,
  FlaskConical,
  Wallet,
  ArrowRight,
  Phone,
  CheckCircle,
  Shield,
  Clock,
  MapPin,
  Heart,
  Stethoscope,
  Activity,
  Sparkles,
  Star,
  Zap,
  Users,
  Award,
  Briefcase,
  GraduationCap,
  TrendingUp,
};

const getIcon = (name) => ICON_MAP[name] || Heart;

const ServicesPage = () => {
  const containerRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const services = useServicesStore((s) => s.services);
  const isLoading = useServicesStore((s) => s.loading);
  const fetchServices = useServicesStore((s) => s.fetchServices);
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";
  const [mapModal, setMapModal] = useState({
    open: false,
    title: null,
    categoryId: null,
  });

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  // Smart CTA click handler — defined before useEffect to avoid lint issues
  const handleCtaClick = (service) => {
    const action = service.ctaAction || "info";

    switch (action) {
      case "location":
        // Open map modal with nearby services
        setMapModal({
          open: true,
          title: service.title,
          categoryId: service.category?._id || service.category || null,
        });
        break;
      case "booking":
        // Navigate to booking or ctaLink
        if (service.ctaLink) {
          window.location.href = service.ctaLink;
        }
        break;
      case "contact":
        // Open phone dialer or contact page
        if (service.ctaLink) {
          window.location.href = service.ctaLink;
        } else {
          window.location.href = "/contact";
        }
        break;
      case "link":
        if (service.ctaLink) {
          window.location.href = service.ctaLink;
        }
        break;
      case "info":
      default:
        // Scroll to learn more or do nothing
        break;
    }
  };

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div
      className="min-h-screen bg-hw-base"
      data-testid="services-page"
      ref={containerRef}
    >
      {/* Hero Header with Parallax */}
      <section className="relative pt-20 pb-20 overflow-hidden">
        {/* Background Layer */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-blue-50/50 to-cyan-50/30" />
          {homeHeroImage && (
            <img
              src={homeHeroImage}
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
          )}
          <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-hw-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[500px] h-[500px] bg-hw-accent/10 rounded-full blur-[100px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-hw-highlight/5 rounded-full blur-[80px]" />
        </motion.div>

        {/* Hero Content */}
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
              <Heart className="w-4 h-4" />
              Our Services
            </motion.span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-hw-text mb-6">
              Our{" "}
              <span className="bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text text-transparent">
                Services
              </span>
            </h1>

            {services.length > 0 && (
              <div className="flex justify-center gap-8 lg:gap-16 mt-10">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center"
                >
                  <div className="font-heading text-3xl lg:text-4xl font-bold text-hw-primary">
                    {services.length}
                  </div>
                  <div className="text-sm text-hw-muted mt-1">Services</div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* Services List */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24"
        ref={ref}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-hw-primary animate-spin mb-4" />
            <p className="text-hw-muted">Loading services...</p>
          </div>
        ) : services.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-hw-muted text-lg">
              No services available at the moment
            </p>
            <p className="text-hw-muted/60 text-sm mt-1">
              Please check back later
            </p>
          </div>
        ) : (
          <div className="space-y-16">
            {services.map((service, index) => {
              const ServiceIcon = getIcon(service.icon);
              const iconBg = `bg-gradient-to-br ${service.gradient}`;
              return (
                <motion.div
                  key={service._id || service.slug}
                  id={service.slug}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: index * 0.15 }}
                  className="scroll-mt-24"
                  data-testid={`service-section-${service.slug}`}
                >
                  <div className="premium-card rounded-[2rem] overflow-hidden">
                    <div
                      className={`grid lg:grid-cols-2 gap-0 ${index % 2 === 1 ? "lg:grid-flow-dense" : ""}`}
                    >
                      {/* Image Section */}
                      <div
                        className={`relative h-80 lg:h-auto min-h-[400px] ${index % 2 === 1 ? "lg:col-start-2" : ""}`}
                      >
                        <img
                          src={service.image}
                          alt={service.title}
                          className="absolute inset-0 w-full h-full object-cover"
                        />
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${service.gradient} opacity-20`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

                        {/* Floating Badge */}
                        {service.isPriority && (
                          <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute top-6 left-6"
                          >
                            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-hw-sos text-white text-sm font-semibold shadow-lg">
                              <Activity className="w-4 h-4" />
                              Emergency Priority
                            </span>
                          </motion.div>
                        )}

                        {/* Stats Overlay */}
                        <div className="absolute bottom-6 left-6 right-6">
                          <div className="glass rounded-2xl p-4">
                            <div className="grid grid-cols-3 gap-4">
                              {service.stats.map((stat, i) => (
                                <div key={i} className="text-center">
                                  <div className="font-heading text-xl font-bold text-hw-text">
                                    {stat.value}
                                  </div>
                                  <div className="text-xs text-hw-muted">
                                    {stat.label}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Content Section */}
                      <div
                        className={`p-8 lg:p-12 flex flex-col justify-center ${index % 2 === 1 ? "lg:col-start-1" : ""}`}
                      >
                        <div className="flex items-center gap-4 mb-6">
                          <div
                            className={`w-14 h-14 rounded-2xl ${iconBg} flex items-center justify-center shadow-lg`}
                          >
                            <ServiceIcon className="w-7 h-7 text-white" />
                          </div>
                          <div>
                            <span
                              className={`text-sm font-medium bg-gradient-to-r ${service.gradient} bg-clip-text text-transparent`}
                            >
                              {service.subtitle}
                            </span>
                            <h2 className="font-heading text-2xl sm:text-3xl font-bold text-hw-text">
                              {service.title}
                            </h2>
                          </div>
                        </div>

                        <p className="text-hw-muted text-lg leading-relaxed mb-8">
                          {service.description}
                        </p>

                        {/* Features Grid */}
                        <div className="grid sm:grid-cols-2 gap-4 mb-8">
                          {service.features.map((feature, i) => (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: 0.3 + i * 0.1 }}
                              className={`flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r ${service.lightGradient}`}
                            >
                              <div
                                className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center flex-shrink-0`}
                              >
                                {React.createElement(getIcon(feature.icon), {
                                  className: "w-4 h-4 text-white",
                                })}
                              </div>
                              <span className="text-sm text-hw-text font-medium">
                                {feature.text}
                              </span>
                            </motion.div>
                          ))}
                        </div>

                        {/* CTA Button — Smart Action */}
                        {service.ctaAction === "location" ? (
                          <Button
                            size="lg"
                            onClick={() => handleCtaClick(service)}
                            className={`bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white rounded-xl shadow-xl w-fit px-8 py-6 text-lg`}
                            data-testid={`service-cta-${service.slug}`}
                          >
                            <Navigation className="w-5 h-5 mr-2" />
                            {service.ctaText || "Find Nearby"}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        ) : service.ctaLink ? (
                          <Button
                            asChild
                            size="lg"
                            className={`btn-gradient rounded-xl shadow-xl w-fit px-8 py-6 text-lg`}
                            style={{
                              background: `linear-gradient(135deg, var(--color-primary), var(--color-accent))`,
                            }}
                            data-testid={`service-cta-${service.slug}`}
                          >
                            <Link to={service.ctaLink}>
                              {service.ctaText}
                              <ArrowRight className="w-5 h-5 ml-2" />
                            </Link>
                          </Button>
                        ) : (
                          <Button
                            size="lg"
                            onClick={() => handleCtaClick(service)}
                            className={`bg-gradient-to-r ${service.gradient} hover:opacity-90 text-white rounded-xl shadow-xl w-fit px-8 py-6 text-lg`}
                            data-testid={`service-cta-${service.slug}`}
                          >
                            {service.ctaText}
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Nearby Services Map Modal */}
      <NearbyServicesMap
        isOpen={mapModal.open}
        onClose={() =>
          setMapModal({ open: false, title: null, categoryId: null })
        }
        serviceTitle={mapModal.title}
        categoryId={mapModal.categoryId}
      />
    </div>
  );
};

export default ServicesPage;
