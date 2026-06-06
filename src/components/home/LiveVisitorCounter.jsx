import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users } from "lucide-react";
import useVisitorCount from "@/hooks/useVisitorCount";

/**
 * @param {object} props
 * @param {"light"|"dark"} [props.variant] - "light" for light backgrounds, "dark" for dark (footer)
 */
const LiveVisitorCounter = ({ variant = "light" }) => {
  const visitorNumber = useVisitorCount();

  const isDark = variant === "dark";

  const formattedNumber = visitorNumber
    ? String(visitorNumber).padStart(6, "0")
    : "------";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-full shadow-md ${
        isDark ? "bg-white/10 backdrop-blur-md" : "glass"
      }`}
    >
      <Users
        className={`w-4 h-4 ${isDark ? "text-gray-400" : "text-hw-muted"}`}
      />
      <span className={`text-sm ${isDark ? "text-gray-400" : "text-hw-muted"}`}>
        Your Visitor Number is
      </span>
      <AnimatePresence mode="wait">
        <motion.span
          key={visitorNumber}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 10, opacity: 0 }}
          transition={{ duration: 0.2 }}
          className={`text-sm font-bold tracking-wider ${isDark ? "text-white" : "text-hw-text"}`}
        >
          {formattedNumber}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );
};

export default LiveVisitorCounter;
