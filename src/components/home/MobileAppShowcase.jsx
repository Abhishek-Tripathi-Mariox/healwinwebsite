import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import * as Icons from "lucide-react";
import { Button } from "@/components/ui/button";
import useSOSStore from "@/store/useSOSStore";

const { Smartphone, Heart } = Icons;

const getIcon = (name) => {
  if (!name) return Icons.Heart;
  return Icons[name] || Icons.Heart;
};

const defaultFeatures = [];

const MobileAppShowcase = ({ data }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const fireTrigger = useSOSStore((s) => s.fireTrigger);

  const badge = data?.appBadge || "";
  const title = data?.appTitle || "";
  const highlight = data?.appHighlight || "";
  const subtitle = data?.appSubtitle || "";
  const features = data?.appFeatures?.length
    ? data.appFeatures
    : defaultFeatures;
  const appMockupImage = data?.appMockupImage || "";
  const appStoreUrl = data?.appStoreUrl || "";
  const playStoreUrl = data?.playStoreUrl || "";

  if (!badge && !title && !highlight && features.length === 0) {
    return null;
  }

  return (
    <section
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      data-testid="mobile-app-section"
      ref={ref}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-hw-base via-white to-hw-base" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[1000px] bg-gradient-radial from-hw-primary/10 via-hw-accent/5 to-transparent rounded-full blur-3xl" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-accent/10 to-hw-primary/10 text-hw-accent text-sm font-medium mb-6">
            <Smartphone className="w-4 h-4" />
            {badge}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-hw-text mb-5">
            {title}{" "}
            <span className="bg-gradient-to-r from-hw-accent to-hw-primary bg-clip-text text-transparent">
              {highlight}
            </span>
          </h2>
          <p className="text-hw-muted text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* App Showcase */}
        <div className="relative flex items-center justify-center">
          {/* Left Features */}
          <div className="hidden lg:flex flex-col gap-8 absolute left-0 xl:left-[5%]">
            {features
              .filter((f) => f.position === "left")
              .map((feature, index) => {
                const FeatureIcon = getIcon(feature.icon);
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 glass rounded-2xl p-5 shadow-lg max-w-xs"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hw-primary to-hw-accent flex items-center justify-center shadow-lg">
                      <FeatureIcon className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-heading font-semibold text-hw-text">
                      {feature.title}
                    </span>
                  </motion.div>
                );
              })}
          </div>

          {/* Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative z-10"
          >
            {/* Glow Behind Phone */}
            <div className="absolute inset-0 bg-gradient-to-b from-hw-primary/30 to-hw-accent/30 rounded-[4rem] blur-3xl scale-90" />

            <div className="relative mx-auto w-72 sm:w-80">
              {/* Phone Frame */}
              <div className="relative bg-hw-text rounded-[3.5rem] p-3 shadow-2xl shadow-hw-text/30">
                {/* Screen */}
                <div className="bg-white rounded-[3rem] overflow-hidden aspect-[9/19] relative">
                  {appMockupImage ? (
                    <>
                      <img
                        src={appMockupImage}
                        alt="HealWin App"
                        className="w-full h-full object-cover"
                      />
                      {/* Clickable SOS overlay on uploaded image */}
                      <button
                        type="button"
                        onClick={fireTrigger}
                        className="absolute inset-0 w-full h-full cursor-pointer bg-transparent z-10"
                        aria-label="Emergency SOS"
                      />
                    </>
                  ) : (
                    /* Default App UI */
                    <div className="h-full bg-gradient-to-b from-hw-primary to-hw-primary-dark p-5 flex flex-col">
                      {/* Status bar */}
                      <div className="flex justify-between items-center mb-6">
                        <span className="text-white/80 text-xs font-medium">
                          9:41
                        </span>
                        <div className="flex gap-1">
                          <div className="w-4 h-2 bg-white/50 rounded-sm" />
                          <div className="w-4 h-2 bg-white/70 rounded-sm" />
                          <div className="w-6 h-2 bg-white rounded-sm" />
                        </div>
                      </div>

                      {/* App Header */}
                      <div className="text-white text-center mb-8">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3">
                          <Heart className="w-7 h-7 text-white" />
                        </div>
                        <h3 className="font-heading font-bold text-xl">
                          HealWin
                        </h3>
                        <p className="text-white/70 text-sm">
                          Your Health Partner
                        </p>
                      </div>

                      {/* SOS Button */}
                      <div className="flex-1 flex items-center justify-center">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={fireTrigger}
                            className="w-32 h-32 bg-hw-sos rounded-full flex items-center justify-center shadow-xl shadow-hw-sos/50 sos-pulse cursor-pointer hover:scale-105 transition-transform relative z-10"
                          >
                            <span className="text-white font-heading font-bold text-3xl">
                              SOS
                            </span>
                          </button>
                          <div className="absolute inset-0 bg-hw-sos/30 rounded-full blur-xl" />
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="grid grid-cols-3 gap-3 mt-auto">
                        {["Ambulance", "Centres", "Labs"].map((item) => (
                          <div
                            key={item}
                            className="bg-white/15 backdrop-blur rounded-2xl p-4 text-center"
                          >
                            <span className="text-white text-xs font-medium">
                              {item}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Notch */}
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-28 h-7 bg-hw-text rounded-full" />
              </div>
            </div>
          </motion.div>

          {/* Right Features */}
          <div className="hidden lg:flex flex-col gap-8 absolute right-0 xl:right-[5%]">
            {features
              .filter((f) => f.position === "right")
              .map((feature, index) => {
                const FeatureIcon = getIcon(feature.icon);
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    className="flex items-center gap-4 glass rounded-2xl p-5 shadow-lg max-w-xs"
                  >
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hw-accent to-cyan-600 flex items-center justify-center shadow-lg">
                      <FeatureIcon className="w-7 h-7 text-white" />
                    </div>
                    <span className="font-heading font-semibold text-hw-text">
                      {feature.title}
                    </span>
                  </motion.div>
                );
              })}
          </div>
        </div>

        {/* Mobile Features */}
        <div className="lg:hidden grid grid-cols-2 gap-4 mt-12">
          {features.map((feature, index) => {
            const FeatureIcon = getIcon(feature.icon);
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.1 }}
                className="glass rounded-xl p-4 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hw-primary to-hw-accent flex items-center justify-center">
                  <FeatureIcon className="w-5 h-5 text-white" />
                </div>
                <span className="font-heading font-semibold text-hw-text text-sm">
                  {feature.title}
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Download Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-16"
        >
          <Button
            size="lg"
            className="bg-hw-text hover:bg-gray-800 text-white rounded-2xl px-8 py-6 shadow-xl"
            data-testid="app-store-btn"
            onClick={() =>
              appStoreUrl &&
              appStoreUrl !== "#" &&
              window.open(appStoreUrl, "_blank")
            }
          >
            <svg
              className="w-7 h-7 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-70">Download on the</div>
              <div className="font-semibold">App Store</div>
            </div>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-hw-text/20 text-hw-text hover:bg-hw-text hover:text-white rounded-2xl px-8 py-6"
            data-testid="play-store-btn"
            onClick={() =>
              playStoreUrl &&
              playStoreUrl !== "#" &&
              window.open(playStoreUrl, "_blank")
            }
          >
            <svg
              className="w-7 h-7 mr-3"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
            </svg>
            <div className="text-left">
              <div className="text-xs opacity-70">Get it on</div>
              <div className="font-semibold">Google Play</div>
            </div>
          </Button>
        </motion.div>
      </div>
    </section>
  );
};

export default MobileAppShowcase;
