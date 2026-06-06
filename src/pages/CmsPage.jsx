import React, { useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { FileText, Loader2 } from "lucide-react";
import useCmsStore from "@/store/useCmsStore";

const SLUG_TITLES = {
  "terms-and-conditions": "Terms & Conditions",
  "privacy-policy": "Privacy Policy",
  "refund-policy": "Refund Policy",
  disclaimer: "Disclaimer",
};

const CmsPage = () => {
  const { slug: paramSlug } = useParams();
  const location = useLocation();
  // Use route param if available, otherwise derive slug from pathname
  const slug = paramSlug || location.pathname.replace(/^\//, "");
  const fetchPage = useCmsStore((s) => s.fetchPage);
  const pageData = useCmsStore((s) => s.getPage(slug));
  const isLoaded = useCmsStore((s) => s.isLoaded(slug));
  const isLoading = !isLoaded;

  useEffect(() => {
    if (slug) fetchPage(slug);
  }, [slug, fetchPage]);

  const title = pageData?.title || SLUG_TITLES[slug] || "Page";

  return (
    <div className="min-h-screen bg-hw-base" data-testid="cms-page">
      {/* Hero Header */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-blue-50/50 to-purple-50/30" />
          <div className="absolute top-0 right-1/4 w-[500px] h-[500px] bg-hw-primary/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-hw-highlight/10 rounded-full blur-[100px]" />
        </div>

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
              <FileText className="w-4 h-4" />
              Legal
            </motion.span>

            <h1 className="mb-6 text-4xl font-bold font-heading sm:text-5xl lg:text-6xl text-hw-text">
              {title}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="px-4 py-8 pb-24 mx-auto max-w-7xl sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-10 h-10 text-hw-primary animate-spin mb-4" />
            <p className="text-hw-muted">Loading...</p>
          </div>
        ) : !pageData ? (
          <div className="flex flex-col items-center justify-center py-24">
            <FileText className="w-16 h-16 text-hw-primary/30 mb-4" />
            <p className="text-hw-muted text-lg">Content coming soon.</p>
          </div>
        ) : (
          <div
            className="prose prose-lg max-w-4xl mx-auto overflow-x-auto [&_img]:max-w-full [&_img]:rounded-lg [&_img]:mx-auto [&_table]:w-full [&_iframe]:max-w-full [&_.ql-align-center]:text-center [&_.ql-align-right]:text-right [&_.ql-align-justify]:text-justify"
            dangerouslySetInnerHTML={{ __html: pageData.content || "" }}
          />
        )}
      </section>
    </div>
  );
};

export default CmsPage;
