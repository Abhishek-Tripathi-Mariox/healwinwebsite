import React from "react";
import { motion } from "framer-motion";
import { Ambulance } from "lucide-react";
import useSOSStore from "@/store/useSOSStore";

const FloatingActions = () => {
  const fireTrigger = useSOSStore((s) => s.fireTrigger);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.95 }}
      onClick={fireTrigger}
      className="fixed left-6 bottom-6 z-40 relative w-14 h-14 rounded-2xl shadow-xl flex items-center justify-center bg-gradient-to-br from-hw-primary to-hw-accent text-white"
      data-testid="floating-actions"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-hw-primary to-hw-accent rounded-2xl opacity-50 blur-lg pointer-events-none" />
      <Ambulance className="w-6 h-6 relative z-10" />
    </motion.button>
  );
};

export default FloatingActions;
