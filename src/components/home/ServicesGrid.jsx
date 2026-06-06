import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";

const { ArrowRight, CheckCircle, Clock } = Icons;
const getIcon = (name) => Icons[name] || Icons.Heart;

const defaultServices = [];

const ServicesGrid = ({ data }) => {
  const badge = data?.servicesBadge || "All Services";
  const title = data?.servicesTitle || "Comprehensive Healthcare";
  const highlight = data?.servicesHighlight || "Solutions";
  const subtitle =
    data?.servicesSubtitle ||
    "From emergency response to preventive care, we provide end-to-end healthcare services designed for the people of Northeast India.";
  const services = data?.services?.length ? data.services : defaultServices;
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
    initialInView: true,
  });

  return (
    <section
      className="py-24 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden"
      data-testid="services-grid-section"
      ref={ref}
    >
      {/* Background Decoration */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-gradient-radial from-hw-primary/5 to-transparent pointer-events-none" />

      <div className="max-w-7xl mx-auto relative">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <motion.span
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary text-sm font-medium mb-6"
          >
            <CheckCircle className="w-4 h-4" />
            {badge}
          </motion.span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-hw-text mb-5">
            {title}
            <span className="bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text text-transparent">
              {" "}
              {highlight}
            </span>
          </h2>
          <p className="text-hw-muted text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Services Grid */}
        <div
          className={`grid sm:grid-cols-2 ${services.length >= 4 ? "lg:grid-cols-4" : `lg:grid-cols-${services.length}`} gap-6 lg:gap-8`}
        >
          {services.map((service, index) => {
            const ServiceIcon = getIcon(service.icon);
            const serviceLink =
              service.ctaLink ||
              `/services#${service.slug || service.title?.toLowerCase().replace(/\s+/g, "-")}`;
            const serviceBadges =
              service.stats?.map((s) => s.label) || service.badges || [];
            const isFeatured = service.isPriority ?? service.featured ?? false;
            const bgGlow = service.bgGlow || "bg-hw-primary/5";
            return (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link
                  to={serviceLink}
                  data-testid={`service-card-${service.title.toLowerCase().replace(/\s+/g, "-")}`}
                  className="group block h-full"
                >
                  <div
                    className={`relative h-full premium-card rounded-3xl overflow-hidden service-card-gradient ${isFeatured ? "ring-2 ring-hw-sos/20" : ""}`}
                  >
                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={service.image}
                        alt={service.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                      <div
                        className={`absolute inset-0 bg-gradient-to-t ${service.gradient || "from-hw-primary/80 to-transparent"} opacity-40`}
                      />

                      {/* Featured Badge */}
                      {isFeatured && (
                        <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/90 backdrop-blur-sm text-hw-sos text-xs font-semibold flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Priority
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Icon */}
                      <div
                        className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${service.gradient || "from-hw-primary to-hw-accent"} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <ServiceIcon className="w-7 h-7 text-white" />
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-heading text-lg font-bold text-hw-text mb-2 group-hover:text-hw-primary transition-colors">
                        {service.title}
                      </h3>
                      <p className="text-sm text-hw-muted mb-4 line-clamp-2">
                        {service.description}
                      </p>

                      {/* Badges */}
                      {serviceBadges.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {serviceBadges.map((badgeItem) => (
                            <span
                              key={badgeItem}
                              className={`px-2.5 py-1 rounded-lg ${bgGlow} text-xs font-medium text-hw-text`}
                            >
                              {badgeItem}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Link */}
                      <div className="flex items-center text-sm font-semibold text-hw-primary group-hover:gap-3 gap-1 transition-all">
                        <span>{service.ctaText || "Learn more"}</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>

                    {/* Hover Glow */}
                    <div
                      className={`absolute inset-0 ${bgGlow} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
                    />
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default ServicesGrid;
