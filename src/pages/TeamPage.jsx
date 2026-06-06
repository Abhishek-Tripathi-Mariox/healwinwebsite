import React, { useState, useRef, useEffect, useMemo } from "react";
import {
  motion,
  useScroll,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  Users,
  Mail,
  Phone,
  Linkedin,
  Briefcase,
  GraduationCap,
  Star,
  ArrowRight,
  X,
  Loader2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import useTeamStore from "@/store/useTeamStore";
import useHomeStore from "@/store/useHomeStore";

const divisionColors = {
  Leadership: {
    gradient: "from-hw-primary to-hw-primary-dark",
    light: "bg-hw-primary/10",
    text: "text-hw-primary",
  },
  Operations: {
    gradient: "from-hw-accent to-cyan-600",
    light: "bg-hw-accent/10",
    text: "text-hw-accent",
  },
  Medical: {
    gradient: "from-hw-sos to-red-600",
    light: "bg-hw-sos/10",
    text: "text-hw-sos",
  },
  Technology: {
    gradient: "from-hw-highlight to-purple-600",
    light: "bg-hw-highlight/10",
    text: "text-hw-highlight",
  },
  "Business Development": {
    gradient: "from-emerald-500 to-emerald-600",
    light: "bg-emerald-500/10",
    text: "text-emerald-600",
  },
};

const TeamPage = () => {
  const containerRef = useRef(null);
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1, initialInView: true });
  const [selectedDivision, setSelectedDivision] = useState("All");
  const [selectedMember, setSelectedMember] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const teamMembers = useTeamStore((s) => s.members);
  const isLoadingMembers = useTeamStore((s) => s.loading);
  const fetchTeam = useTeamStore((s) => s.fetchTeam);
  const homeContent = useHomeStore((s) => s.content);
  const fetchHome = useHomeStore((s) => s.fetchHome);
  const homeHeroImage = homeContent?.heroImage || "";

  useEffect(() => {
    fetchTeam();
  }, [fetchTeam]);
  useEffect(() => {
    fetchHome();
  }, [fetchHome]);

  // Build dynamic divisions from data
  const divisions = useMemo(() => {
    const uniqueDivisions = [
      ...new Set(teamMembers.map((m) => m.division)),
    ].sort();
    return ["All", ...uniqueDivisions];
  }, [teamMembers]);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);

  const filteredMembers = teamMembers.filter((member) => {
    const matchesDivision =
      selectedDivision === "All" || member.division === selectedDivision;
    const term = searchTerm.trim().toLowerCase();
    if (!term) return matchesDivision;

    const searchable = [
      member.name,
      member.designation,
      member.division,
      ...(member.highlights || []),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return matchesDivision && searchable.includes(term);
  });

  const getDivisionColor = (division) =>
    divisionColors[division] || divisionColors["Leadership"];

  return (
    <div
      className="min-h-screen bg-hw-base"
      data-testid="team-page"
      ref={containerRef}
    >
      {/* Hero Header with Parallax */}
      <section className="relative pt-20 pb-16 overflow-hidden">
        {/* Background Layer */}
        <motion.div style={{ y: bgY }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-hw-base via-blue-50/50 to-purple-50/30" />
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

        {/* Hero Content */}
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
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-hw-primary/10 to-hw-highlight/10 text-hw-primary text-sm font-medium mb-6"
            >
              <Users className="w-4 h-4" />
              Our Team
            </motion.span>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold text-hw-text mb-6">
              Our{" "}
              <span className="bg-gradient-to-r from-hw-primary to-hw-highlight bg-clip-text text-transparent">
                Team
              </span>
            </h1>

            {/* Team Stats */}
            <div className="flex flex-wrap justify-center gap-6 sm:gap-8 lg:gap-16">
              {[
                {
                  value: `${teamMembers.length}+`,
                  label: "Team Members",
                  color: "text-hw-primary",
                },
                {
                  value: `${divisions.length - 1}`,
                  label: "Departments",
                  color: "text-hw-accent",
                },
                {
                  value: `${new Set(teamMembers.map((m) => m.state).filter(Boolean)).size || 0}`,
                  label: "States Served",
                  color: "text-hw-highlight",
                },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="text-center"
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
        </div>
      </section>

      {/* Division Filter + Search */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl p-4 shadow-lg"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2">
              {divisions.map((division) => (
                <button
                  key={division}
                  onClick={() => setSelectedDivision(division)}
                  className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    selectedDivision === division
                      ? "bg-gradient-to-r from-hw-primary to-hw-primary-dark text-white shadow-lg"
                      : "text-hw-muted hover:text-hw-text hover:bg-white/50"
                  }`}
                  data-testid={`division-filter-${division.toLowerCase().replace(/\s+/g, "-")}`}
                >
                  {division}
                </button>
              ))}
            </div>

            <div className="w-full lg:w-80">
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by name, role, or department..."
                className="bg-white/80 focus-visible:ring-hw-primary"
                data-testid="team-search-input"
              />
            </div>
          </div>
        </motion.div>
      </section>

      {/* Team Grid */}
      <section
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-24"
        ref={ref}
      >
        {isLoadingMembers ? (
          <div className="flex items-center justify-center p-16">
            <Loader2 className="w-8 h-8 animate-spin text-hw-primary" />
          </div>
        ) : (
          <>
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDivision}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filteredMembers.map((member, index) => {
                  const divColor = getDivisionColor(member.division);
                  return (
                    <motion.div
                      key={member._id || member.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.6, delay: Math.min(index * 0.05, 0.5) }}
                      onClick={() => setSelectedMember(member)}
                      className="cursor-pointer group"
                      data-testid={`team-member-${member._id || member.id}`}
                    >
                      <div className="premium-card rounded-3xl overflow-hidden">
                        {/* Image */}
                        <div className="relative h-72 overflow-hidden">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                              <Users className="w-16 h-16 text-gray-400" />
                            </div>
                          )}
                          {/* Gradient Overlay */}
                          <div
                            className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent`}
                          />

                          {/* Department Badge */}
                          <div className="absolute top-4 left-4">
                            <span
                              className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${divColor.gradient} text-white text-xs font-semibold shadow-lg`}
                            >
                              {member.department || member.division}
                            </span>
                          </div>

                          {/* View Profile Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-r from-hw-primary/80 to-hw-accent/80 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <span className="text-white font-semibold flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                              View Profile
                              <ArrowRight className="w-4 h-4" />
                            </span>
                          </div>

                          {/* Bottom Info */}
                          <div className="absolute bottom-0 left-0 right-0 p-5" style={{ textAlign: "left" }}>
                            {/* <h3 className="font-heading font-bold text-xl text-white mb-1">
                              {member.name}
                            </h3> */}
                            <p className="font-heading font-bold text-xl text-white mb-1">
                              {member.name}
                            </p>
                            <p className="text-white/80 text-sm">
                              {member.designation}
                            </p>
                          </div>
                        </div>

                        {/* Highlights */}
                        <div className="p-5 bg-white">
                          <div className="flex flex-wrap gap-2">
                            {member.highlights
                              .slice(0, 2)
                              .map((highlight, i) => (
                                <span
                                  key={i}
                                  className={`px-3 py-1 rounded-full ${divColor.light} ${divColor.text} text-xs font-medium`}
                                >
                                  {highlight}
                                </span>
                              ))}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
            </AnimatePresence>

            {filteredMembers.length === 0 && !isLoadingMembers && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="premium-card rounded-3xl p-16 text-center"
              >
                <div className="w-20 h-20 rounded-full bg-hw-primary/10 flex items-center justify-center mx-auto mb-6">
                  <Users className="w-10 h-10 text-hw-primary/50" />
                </div>
                <h3 className="font-heading font-bold text-xl text-hw-text mb-2">
                  No team members found
                </h3>
                <p className="text-hw-muted">
                  Try a different search or department
                </p>
              </motion.div>
            )}
          </>
        )}
      </section>

      {/* Join Our Team CTA */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-hw-primary to-hw-highlight" />
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{
              backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.2) 0%, transparent 50%), radial-gradient(circle at 80% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)`,
            }}
          />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-8">
              <Briefcase className="w-10 h-10 text-white" />
            </div>

            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
              Join Our Mission
            </h2>
            <p className="text-white/80 text-lg mb-10 max-w-2xl mx-auto">
              Be part of a team that's revolutionizing healthcare in Northeast
              India. We're always looking for passionate individuals to join us.
            </p>

            <Button
              size="lg"
              className="bg-white text-hw-primary hover:bg-white/90 rounded-xl shadow-xl px-8 py-7 text-lg font-semibold"
              asChild
            >
              <a href="/careers">
                View Open Positions
                <ArrowRight className="w-5 h-5 ml-2" />
              </a>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Member Detail Modal */}
      <Dialog
        open={!!selectedMember}
        onOpenChange={() => setSelectedMember(null)}
      >
        <DialogContent className="max-w-lg rounded-3xl overflow-hidden p-0 bg-white">
          {selectedMember && (
            <>
              <DialogHeader className="sr-only">
                <DialogTitle>{selectedMember.name}</DialogTitle>
              </DialogHeader>

              {/* Header Image */}
              <div className="relative h-64">
                {selectedMember.image ? (
                  <img
                    src={selectedMember.image}
                    alt={selectedMember.name}
                    className="w-full h-full object-contain bg-gray-100"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                    <Users className="w-16 h-16 text-gray-400" />
                  </div>
                )}
                <div
                  className={`absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent`}
                />

                {/* Division Badge */}
                <div className="absolute top-4 left-4">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r ${getDivisionColor(selectedMember.division).gradient} text-white text-xs font-semibold shadow-lg`}
                  >
                    {selectedMember.department || selectedMember.division}
                  </span>
                </div>

                {/* Name Overlay */}
                <div className="absolute bottom-4 left-6 right-6">
                  <h3 className="font-heading font-bold text-2xl text-white">
                    {selectedMember.name}
                  </h3>
                  <p className="text-white/80">{selectedMember.designation}</p>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Highlights */}
                <div className="flex flex-wrap gap-2 mb-6">
                  {selectedMember.highlights.map((highlight, i) => (
                    <span
                      key={i}
                      className={`px-3 py-1.5 rounded-full ${getDivisionColor(selectedMember.division).light} ${getDivisionColor(selectedMember.division).text} text-xs font-medium`}
                    >
                      {highlight}
                    </span>
                  ))}
                </div>

                {/* Bio */}
                <p className="text-hw-muted leading-relaxed mb-6">
                  {selectedMember.bio}
                </p>

                {/* Contact */}
                <div className="space-y-3">
                  {selectedMember.email && (
                    <a
                      href={`mailto:${selectedMember.email}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-hw-primary/5 hover:bg-hw-primary/10 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hw-primary to-hw-primary-dark flex items-center justify-center">
                        <Mail className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-hw-text font-medium group-hover:text-hw-primary transition-colors">
                        {selectedMember.email}
                      </span>
                    </a>
                  )}
                  {selectedMember.phone && (
                    <a
                      href={`tel:${selectedMember.phone}`}
                      className="flex items-center gap-4 p-4 rounded-xl bg-hw-accent/5 hover:bg-hw-accent/10 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-hw-accent to-cyan-600 flex items-center justify-center">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-hw-text font-medium group-hover:text-hw-accent transition-colors">
                        {selectedMember.phone}
                      </span>
                    </a>
                  )}
                  {selectedMember.linkedin && (
                    <a
                      href={selectedMember.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-4 p-4 rounded-xl bg-blue-50 hover:bg-blue-100 transition-colors group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center">
                        <Linkedin className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-hw-text font-medium group-hover:text-blue-600 transition-colors">
                        LinkedIn Profile
                      </span>
                    </a>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamPage;
