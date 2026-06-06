import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import * as Icons from "lucide-react";
import useSOSStore from "@/store/useSOSStore";
import LiveVisitorCounter from "@/components/home/LiveVisitorCounter";

const getIcon = (name) => Icons[name] || Icons.Heart;

const HeroSection = ({ data }) => {
  // Dynamic data with fallbacks
  const badge = data?.heroBadge || "";
  const title = data?.heroTitle || "";
  const highlight = data?.heroHighlight || "";
  const subtitle = data?.heroSubtitle || "";
  const heroImage = data?.heroImage || "";
  const stats = data?.heroStats || [];
  const ctaButtons = data?.heroCtaButtons || [];
  const floatingCards = data?.heroFloatingCards || [];
  const containerRef = useRef(null);
  const fireTrigger = useSOSStore((s) => s.fireTrigger);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fgY = useTransform(scrollYProgress, [0, 1], ["0%", "10%"]);

  // Generate particles
  const particles = Array.from({ length: 20 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    top: `${Math.random() * 100}%`,
    delay: Math.random() * 5,
    duration: 5 + Math.random() * 5,
    size: 2 + Math.random() * 4,
  }));

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex items-center overflow-hidden pt-20"
      data-testid="hero-section"
    >
      {/* Background Layer - Parallax */}
      <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-blue-50/50 to-cyan-50/30" />
        {heroImage && (
          <img
            src={heroImage}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
        )}
        {/* Gradient Glow */}
        <div className="absolute top-1/4 right-1/4 w-[600px] h-[600px] bg-hw-primary/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 left-1/4 w-[500px] h-[500px] bg-hw-accent/10 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-hw-highlight/5 rounded-full blur-[80px]" />
      </motion.div>

      {/* Floating Particles */}
      <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full bg-hw-primary/30"
            style={{
              left: particle.left,
              top: particle.top,
              width: particle.size,
              height: particle.size,
            }}
            animate={{
              y: [-20, 20, -20],
              x: [-10, 10, -10],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Foreground Content - Parallax */}
      <motion.div
        style={{ y: fgY }}
        className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24"
      >
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-center lg:text-left"
          >
            {/* Trust Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass shadow-lg mb-8"
            >
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-hw-text">{badge}</span>
            </motion.div>

            {/* Live Visitor Counter */}
            <div className="mb-6 flex justify-center lg:justify-start">
              <LiveVisitorCounter />
            </div>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-hw-text leading-[1.1] mb-6">
              {title}{" "}
              <span className="bg-gradient-to-r from-hw-primary via-hw-accent to-hw-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
                {highlight}
              </span>
            </h1>

            <p className="text-lg lg:text-xl text-hw-muted mb-10 max-w-xl mx-auto lg:mx-0 leading-relaxed">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {ctaButtons.map((btn, idx) => {
                const BtnIcon = getIcon(btn.icon);
                if (btn.variant === "outline") {
                  return (
                    <Button
                      key={idx}
                      asChild
                      size="lg"
                      variant="outline"
                      className="text-lg px-8 py-7 rounded-2xl border-2 border-hw-primary/20 text-hw-primary hover:bg-hw-primary/5 hover:border-hw-primary/40 transition-all"
                    >
                      <Link to={btn.link}>
                        <BtnIcon className="w-5 h-5 mr-2" />
                        {btn.label}
                      </Link>
                    </Button>
                  );
                }
                return (
                  <Button
                    key={idx}
                    asChild
                    size="lg"
                    className="btn-gradient text-lg px-8 py-7 rounded-2xl shadow-xl shadow-hw-primary/25 hover:shadow-hw-primary/40 transition-shadow"
                  >
                    <Link to={btn.link}>
                      <BtnIcon className="w-5 h-5 mr-2" />
                      {btn.label}
                    </Link>
                  </Button>
                );
              })}
            </div>

            {/* Stats */}
            <div className="mt-14 grid grid-cols-3 gap-6 lg:gap-10">
              {stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="text-center lg:text-left"
                >
                  <div
                    className={`font-heading text-3xl lg:text-4xl font-bold ${stat.color}`}
                  >
                    {stat.value}
                  </div>
                  <div className="text-sm text-hw-muted mt-1">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right Content - Hero Visual */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              {/* Main Image Container */}
              <div className="relative w-full aspect-square max-w-lg mx-auto">
                {/* Glowing Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-hw-primary/20 via-hw-accent/10 to-hw-highlight/20 rounded-[3rem] blur-2xl" />

                {/* Image */}
                <motion.div
                  animate={{ y: [-10, 10, -10] }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="relative rounded-[2.5rem] overflow-hidden shadow-2xl shadow-hw-primary/20"
                >
                  {heroImage && (
                    <img
                      src={heroImage}
                      alt="Emergency ambulance services"
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-hw-primary/30 via-transparent to-transparent" />
                </motion.div>

                {/* Floating Card - Top Right (Emergency) */}
                {floatingCards[0] &&
                  (() => {
                    const FcIcon0 = getIcon(floatingCards[0].icon);
                    return (
                      <motion.button
                        type="button"
                        animate={{ y: [-15, 5, -15], rotate: [0, 3, 0] }}
                        transition={{
                          duration: 5,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute -top-6 -right-6 glass rounded-2xl p-4 shadow-xl cursor-pointer hover:scale-105 transition-transform text-left"
                        onClick={fireTrigger}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hw-sos to-red-600 flex items-center justify-center">
                            <FcIcon0 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-hw-muted">
                              {floatingCards[0].label}
                            </div>
                            <div className="font-heading font-bold text-hw-text">
                              {floatingCards[0].value}
                            </div>
                          </div>
                        </div>
                      </motion.button>
                    );
                  })()}

                {/* Floating Card - Bottom Left (Ambulance) */}
                {floatingCards[1] &&
                  (() => {
                    const FcIcon1 = getIcon(floatingCards[1].icon);
                    return (
                      <motion.div
                        animate={{ y: [10, -10, 10], rotate: [0, -3, 0] }}
                        transition={{
                          duration: 6,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                        className="absolute -bottom-4 -left-6 glass rounded-2xl p-4 shadow-xl"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-hw-accent to-cyan-600 flex items-center justify-center">
                            <FcIcon1 className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="text-xs text-hw-muted">
                              {floatingCards[1].label}
                            </div>
                            <div className="font-heading font-bold text-hw-text">
                              {floatingCards[1].value}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Bottom Gradient Fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-hw-base to-transparent z-30" />

      <style>{`
        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }
        .animate-gradient {
          animation: gradient 4s ease infinite;
        }
      `}</style>
    </section>
  );
};

export default HeroSection;
