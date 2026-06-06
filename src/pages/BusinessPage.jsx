import React, { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { Handshake, Loader2 } from "lucide-react";
import useCmsStore from "@/store/useCmsStore";
import useHomeStore from "@/store/useHomeStore";

const BusinessPage = () => {
  const containerRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const fetchPage = useCmsStore((s) => s.fetchPage);
  const pageData = useCmsStore((s) => s.getPage("business"));
  const isLoaded = useCmsStore((s) => s.isLoaded("business"));
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";
  const isLoading = !isLoaded;

  useEffect(() => {
    fetchPage("business");
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
      data-testid="business-page"
      ref={containerRef}
    >
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-purple-50/50 to-blue-50/30" />
          {homeHeroImage && (
            <img
              src={homeHeroImage}
              alt="Hero background"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />
          )}
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-hw-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-hw-highlight/10 rounded-full blur-[100px]" />
        </motion.div>

        <div className="relative z-10 px-4 pt-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 mb-6 text-sm font-medium rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-highlight/10 text-hw-primary"
            >
              <Handshake className="w-4 h-4" />
              {pageData?.badge || "Business Opportunities"}
            </motion.span>

            <h1 className="mb-6 text-4xl font-bold font-heading sm:text-5xl lg:text-6xl text-hw-text">
              {pageData?.title || "Business"}{" "}
              <span className="text-transparent bg-gradient-to-r from-hw-primary to-hw-highlight bg-clip-text">
                {pageData?.highlight || "Opportunities"}
              </span>
            </h1>

            {pageData?.subtitle && (
              <p className="max-w-2xl mx-auto text-lg leading-relaxed text-hw-muted">
                {pageData.subtitle}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section
        className="px-4 py-8 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8"
        ref={ref}
      >
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-hw-primary animate-spin mb-4" />
            <p className="text-hw-muted">Loading...</p>
          </div>
        ) : !pageData ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Handshake className="w-16 h-16 text-hw-primary/30 mb-4" />
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

export default BusinessPage;
