import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Heart,
  Target,
  Eye,
  Users,
  Award,
  MapPin,
  Clock,
  Shield,
  Zap,
  Activity,
  Truck,
  Building2,
  Star,
  Stethoscope,
} from "lucide-react";
import useAboutStore from "@/store/useAboutStore";
import useHomeStore from "@/store/useHomeStore";

// Map icon name strings from the API to actual components
const ICON_MAP = {
  Heart,
  Target,
  Eye,
  Users,
  Award,
  MapPin,
  Clock,
  Shield,
  Zap,
  Activity,
  Truck,
  Building2,
  Star,
  Stethoscope,
};

const getIcon = (name) => ICON_MAP[name] || Heart;

const AboutPage = () => {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const data = useAboutStore((s) => s.data);
  const fetchAbout = useAboutStore((s) => s.fetchAbout);
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";

  useEffect(() => {
    fetchAbout();
    fetchHome();
  }, [fetchAbout, fetchHome]);

  return (
    <div className="min-h-screen bg-hw-base pt-20" data-testid="about-page">
      {/* Hero Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-hw-primary/5 to-transparent" />
        {homeHeroImage && (
          <img
            src={homeHeroImage}
            alt="Hero background"
            className="absolute inset-0 w-full h-full object-cover opacity-10"
          />
        )}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-hw-primary/10 rounded-full blur-[120px]" />

        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-accent/10 text-hw-primary text-sm font-medium mb-6">
              {data.heroBadge}
            </span>
            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-hw-text mb-6">
              {data.heroTitle}{" "}
              <span className="bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text text-transparent">
                {data.heroHighlight}
              </span>
            </h1>
            <p className="text-lg text-hw-muted leading-relaxed">
              {data.heroSubtitle}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8" ref={ref}>
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {data.stats.map((stat, index) => {
              const IconComponent = getIcon(stat.icon);
              return (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="glass rounded-3xl p-8 text-center"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-hw-primary to-hw-accent flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="w-7 h-7 text-white" />
                  </div>
                  <div className="font-heading text-4xl font-bold bg-gradient-to-r from-hw-primary to-hw-accent bg-clip-text text-transparent mb-2">
                    {stat.value}
                  </div>
                  <div className="text-hw-muted">{stat.label}</div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              className="bg-gradient-to-br from-hw-primary to-hw-primary-dark rounded-3xl p-10 text-white"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Target className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                {data.missionTitle}
              </h2>
              <p className="text-white/80 leading-relaxed text-lg">
                {data.missionText}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="bg-gradient-to-br from-hw-accent to-cyan-600 rounded-3xl p-10 text-white"
            >
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center mb-6">
                <Eye className="w-8 h-8" />
              </div>
              <h2 className="font-heading text-3xl font-bold mb-4">
                {data.visionTitle}
              </h2>
              <p className="text-white/80 leading-relaxed text-lg">
                {data.visionText}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-16"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-hw-text mb-4">
              {data.valuesHeading}
            </h2>
            <p className="text-hw-muted max-w-2xl mx-auto">
              {data.valuesSubheading}
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {data.coreValues.map((value, index) => {
              const ValIcon = getIcon(value.icon);
              return (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="premium-card rounded-3xl p-8 text-center group"
                >
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-hw-primary/10 to-hw-accent/10 flex items-center justify-center mx-auto mb-6 group-hover:from-hw-primary group-hover:to-hw-accent transition-all duration-300">
                    <ValIcon className="w-8 h-8 text-hw-primary group-hover:text-white transition-colors" />
                  </div>
                  <h3 className="font-heading text-xl font-bold text-hw-text mb-3">
                    {value.title}
                  </h3>
                  <p className="text-hw-muted text-sm">{value.description}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-hw-text mb-8">
              {data.storyTitle}
            </h2>
            <div className="prose prose-lg mx-auto text-hw-muted">
              {data.storyParagraphs.map((para, i) => (
                <p
                  key={i}
                  className={i < data.storyParagraphs.length - 1 ? "mb-6" : ""}
                >
                  {para}
                </p>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
