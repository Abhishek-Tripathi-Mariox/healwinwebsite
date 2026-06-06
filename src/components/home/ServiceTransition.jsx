import React, { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useInView } from "react-intersection-observer";
import * as Icons from "lucide-react";

const { ArrowRight, CheckCircle } = Icons;

const getIcon = (name) => {
  if (!name) return Icons.Heart;
  return Icons[name] || Icons.Heart;
};

const defaultScenes = [];

const defaultBottomText = "";

const ServiceTransition = ({ data }) => {
  const containerRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });

  const badge = data?.actionsBadge || "HealWin in Action";
  const title = data?.actionsTitle || "One Platform,";
  const highlight = data?.actionsHighlight || "Complete Care";
  const subtitle =
    data?.actionsSubtitle ||
    "From the moment of emergency to complete recovery, HealWin is with you at every step.";
  const scenes = data?.actionsScenes?.length
    ? data.actionsScenes
    : defaultScenes;
  const bottomText = data?.actionsBottomText || defaultBottomText;

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);

  return (
    <section
      ref={containerRef}
      className="py-32 px-4 sm:px-6 lg:px-8 relative overflow-hidden bg-gradient-to-b from-white via-hw-base to-white"
      data-testid="service-transition-section"
    >
      {/* Parallax Background Elements */}
      <motion.div
        style={{ y: backgroundY }}
        className="absolute inset-0 pointer-events-none"
      >
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-hw-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-hw-accent/5 rounded-full blur-[100px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-hw-highlight/3 rounded-full blur-[120px]" />
      </motion.div>

      {/* Connection Lines */}
      <div className="absolute top-1/2 left-[10%] right-[10%] h-1 hidden lg:block">
        <div className="w-full h-full bg-gradient-to-r from-hw-sos via-hw-primary to-hw-highlight rounded-full opacity-20" />
      </div>

      <div className="max-w-7xl mx-auto relative" ref={ref}>
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary text-sm font-medium mb-6">
            {badge}
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-hw-text mb-5">
            {title}{" "}
            <span className="bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text text-transparent">
              {highlight}
            </span>
          </h2>
          <p className="text-hw-muted text-lg max-w-2xl mx-auto">{subtitle}</p>
        </motion.div>

        {/* Scenes Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {scenes.map((scene, index) => {
            const SceneIcon = getIcon(scene.icon);
            const color =
              scene.gradient || scene.color || "from-hw-primary to-hw-accent";
            return (
              <motion.div
                key={scene.id || scene.title}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                className="relative group"
              >
                {/* Card */}
                <div
                  className={`relative ${scene.bgColor || "bg-gray-50"} rounded-3xl p-8 h-full overflow-hidden transition-all duration-500 group-hover:shadow-2xl`}
                >
                  {/* Background Gradient on Hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
                  />

                  {/* Icon */}
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${color} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}
                  >
                    <SceneIcon className="w-8 h-8 text-white" />
                  </div>

                  {/* Stat */}
                  <div className="mb-4">
                    <div
                      className={`font-heading text-4xl font-bold bg-gradient-to-r ${color} bg-clip-text text-transparent`}
                    >
                      {scene.stat}
                    </div>
                    <div className="text-sm text-hw-muted">
                      {scene.statLabel}
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className="font-heading text-xl font-bold text-hw-text mb-3">
                    {scene.title}
                  </h3>
                  <p className="text-hw-muted text-sm leading-relaxed">
                    {scene.description}
                  </p>

                  {/* Arrow Indicator */}
                  {index < scenes.length - 1 && (
                    <div className="absolute -right-4 top-1/2 -translate-y-1/2 hidden lg:block z-10">
                      <ArrowRight className="w-6 h-6 text-hw-muted/30" />
                    </div>
                  )}
                </div>

                {/* Step Number */}
                <div
                  className={`absolute -top-3 -right-3 w-8 h-8 rounded-full bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                >
                  {index + 1}
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Text */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <p
            className="text-lg text-hw-muted max-w-3xl mx-auto leading-relaxed"
            dangerouslySetInnerHTML={{ __html: bottomText }}
          />
        </motion.div>
      </div>
    </section>
  );
};

export default ServiceTransition;
