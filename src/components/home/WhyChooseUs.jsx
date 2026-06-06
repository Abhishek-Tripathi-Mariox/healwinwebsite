import React from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import * as Icons from "lucide-react";

const { CheckCircle } = Icons;

const getIcon = (name) => {
  if (!name) return Icons.Heart;
  return Icons[name] || Icons.Heart;
};

const defaultReasons = [];

const WhyChooseUs = ({ data }) => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });

  const badge = data?.whyBadge || "Why HealWin";
  const title = data?.whyTitle || "Trust Built on";
  const highlight = data?.whyHighlight || "Excellence";
  const subtitle =
    data?.whySubtitle ||
    "Every second counts in an emergency. Here's why thousands trust HealWin for their healthcare needs.";
  const reasons = data?.whyReasons?.length ? data.whyReasons : defaultReasons;

  return (
    <section
      className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative overflow-hidden"
      data-testid="why-choose-us-section"
      ref={ref}
    >
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-hw-primary/5 via-transparent to-transparent" />

      <div className="max-w-7xl mx-auto relative">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-highlight/10 text-hw-primary text-sm font-medium mb-6">
            <CheckCircle className="w-4 h-4" />
            {badge}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-hw-text mb-5">
            {title}{" "}
            <span className="bg-gradient-to-r from-hw-primary to-hw-highlight bg-clip-text text-transparent">
              {highlight}
            </span>
          </h2>
          <p className="text-hw-muted text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {reasons.map((reason, index) => {
            const ReasonIcon = getIcon(reason.icon);
            return (
              <motion.div
                key={reason.title}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="group"
              >
                <div
                  className={`relative ${reason.bgColor || "bg-gray-50"} rounded-3xl p-8 h-full overflow-hidden transition-all duration-500 hover:shadow-2xl`}
                >
                  {/* Hover Gradient */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${reason.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  <div className="relative">
                    {/* Icon & Stat */}
                    <div className="flex items-start justify-between mb-6">
                      <div
                        className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${reason.gradient} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}
                      >
                        <ReasonIcon className="w-8 h-8 text-white" />
                      </div>
                      <span
                        className={`font-heading text-3xl font-bold bg-gradient-to-r ${reason.gradient} bg-clip-text text-transparent`}
                      >
                        {reason.stat}
                      </span>
                    </div>

                    {/* Content */}
                    <h3 className="font-heading text-xl font-bold text-hw-text mb-2">
                      {reason.title}
                    </h3>
                    <p className="text-hw-muted">{reason.description}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;
