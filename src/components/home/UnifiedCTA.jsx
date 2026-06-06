import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";

const { Sparkles, ArrowRight } = Icons;

const getIcon = (name) => {
  if (!name) return Icons.Heart;
  return Icons[name] || Icons.Heart;
};

const defaultCtaButtons = [];

const defaultTrustIndicators = [];

const defaultServiceIcons = [];

const UnifiedCTA = ({ data }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });

  const badge = data?.ctaBadge || "";
  const title = data?.ctaTitle || "";
  const highlight = data?.ctaHighlight || "";
  const subtitle = data?.ctaSubtitle || "";
  const ctaButtons = data?.ctaButtons?.length
    ? data.ctaButtons
    : defaultCtaButtons;
  const trustIndicators = data?.ctaTrustIndicators?.length
    ? data.ctaTrustIndicators
    : defaultTrustIndicators;

  const services = data?.ctaServiceIcons?.length
    ? data.ctaServiceIcons
    : defaultServiceIcons;

  if (!badge && !title && !highlight && ctaButtons.length === 0) {
    return null;
  }

  return (
    <section
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      data-testid="unified-cta-section"
      ref={ref}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-hw-base to-white" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-radial from-hw-primary/10 to-transparent rounded-full blur-3xl" />

      <div className="max-w-5xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative"
        >
          {/* Card */}
          <div className="relative glass rounded-[2.5rem] overflow-hidden shadow-2xl shadow-hw-primary/10">
            {/* Gradient Border */}
            <div className="absolute inset-0 rounded-[2.5rem] p-[2px] bg-gradient-to-br from-hw-primary/50 via-hw-accent/50 to-hw-highlight/50">
              <div className="w-full h-full bg-white/95 rounded-[2.4rem]" />
            </div>

            <div className="relative px-8 py-16 sm:px-12 lg:px-20">
              {/* Service Icons */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex justify-center items-center gap-4 mb-10"
              >
                {services.map((service, index) => {
                  const SvcIcon = getIcon(service.icon);
                  return (
                    <motion.div
                      key={index}
                      animate={{ y: [0, -8, 0] }}
                      transition={{
                        duration: 2,
                        delay: index * 0.2,
                        repeat: Infinity,
                      }}
                      className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br ${service.color} flex items-center justify-center shadow-lg`}
                      style={{ transform: `rotate(${(index - 1.5) * 6}deg)` }}
                    >
                      <SvcIcon className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </motion.div>
                  );
                })}
              </motion.div>

              {/* Content */}
              <div className="text-center">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary text-sm font-medium mb-6">
                  <Sparkles className="w-4 h-4" />
                  {badge}
                </span>
                <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-hw-text mb-5">
                  {title}{" "}
                  <span className="bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text text-transparent">
                    {highlight}
                  </span>
                </h2>
                <p className="text-hw-muted text-lg max-w-xl mx-auto mb-10">
                  {subtitle}
                </p>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {ctaButtons.map((btn, index) => {
                    const BtnIcon = getIcon(btn.icon);
                    if (btn.variant === "primary") {
                      return (
                        <Button
                          key={index}
                          asChild
                          size="lg"
                          className="btn-gradient text-lg px-10 py-7 rounded-2xl shadow-xl shadow-hw-primary/25"
                        >
                          <Link to={btn.link || "#"}>
                            <BtnIcon className="w-5 h-5 mr-2" />
                            {btn.label}
                          </Link>
                        </Button>
                      );
                    }
                    return (
                      <Button
                        key={index}
                        asChild
                        size="lg"
                        variant="outline"
                        className="text-lg px-10 py-7 rounded-2xl border-2 border-hw-text/20 text-hw-text hover:bg-hw-text hover:text-white"
                      >
                        <Link to={btn.link || "#"}>
                          <BtnIcon className="w-5 h-5 mr-2" />
                          {btn.label}
                        </Link>
                      </Button>
                    );
                  })}
                </div>

                {/* Trust Indicators */}
                <div className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-hw-muted">
                  {trustIndicators.map((indicator, index) => (
                    <span key={index} className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${indicator.color || "bg-green-500"}`}
                      />
                      {indicator.text}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default UnifiedCTA;
