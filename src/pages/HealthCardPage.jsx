import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { CreditCard, Loader2 } from "lucide-react";
import useCmsStore from "@/store/useCmsStore";
import useHomeStore from "@/store/useHomeStore";

const HealthCardPage = () => {
  const containerRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const fetchPage = useCmsStore((s) => s.fetchPage);
  const pageData = useCmsStore((s) => s.getPage("health-card"));
  const isLoaded = useCmsStore((s) => s.isLoaded("health-card"));
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";
  const isLoading = !isLoaded;

  useEffect(() => {
    fetchPage("health-card");
  }, [fetchPage]);
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  return (
    <div
      className="min-h-screen bg-hw-base"
      data-testid="health-card-page"
      ref={containerRef}
    >
      {/* Hero Header */}
      <section className="relative pt-20 pb-12 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-cyan-50/50 to-teal-50/30" />
          {homeHeroImage && (
            <img
              src={homeHeroImage}
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
          )}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-hw-accent/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-hw-primary/10 rounded-full blur-[100px]" />
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-accent/10 to-hw-primary/10 text-hw-accent text-sm font-medium mb-6"
            >
              <CreditCard className="w-4 h-4" />
              {pageData?.badge || "Health Card"}
            </motion.span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-hw-text mb-6">
              {pageData?.title || "Health"}{" "}
              <span className="bg-gradient-to-r from-hw-accent to-hw-primary bg-clip-text text-transparent">
                {pageData?.highlight || "Card"}
              </span>
            </h1>

            {pageData?.subtitle && (
              <p className="text-lg text-hw-muted leading-relaxed max-w-2xl mx-auto">
                {pageData.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-24"
        ref={ref}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-hw-accent animate-spin mb-4" />
            <p className="text-hw-muted">Loading...</p>
          </div>
        ) : !pageData ? (
          <div className="flex flex-col items-center justify-center py-24">
            <CreditCard className="w-16 h-16 text-hw-accent/30 mb-4" />
            <p className="text-hw-muted text-lg">Content coming soon.</p>
          </div>
        ) : (
          <div
            className="prose prose-lg max-w-4xl mx-auto overflow-x-auto [&_img]:max-w-full [&_table]:w-full [&_iframe]:max-w-full"
            dangerouslySetInnerHTML={{ __html: pageData.content || "" }}
          />
        )}
      </section>
    </div>
  );
};

export default HealthCardPage;
