"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";

// Export motion components for client-side use
export const MotionDiv = motion.div;
export const MotionButton = motion.button;
export const MotionH2 = motion.h2;
export const MotionP = motion.p;

// Export animation utilities
export const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export const scaleUp = {
  hidden: { scale: 0.95, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
};

export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Export other framer-motion utilities
export { AnimatePresence, useInView };

// Default export for dynamic import
const ClientMotion = {
  motion,
  AnimatePresence,
  useInView,
  MotionDiv,
  MotionButton,
  MotionH2,
  MotionP,
  fadeIn,
  scaleUp,
  staggerContainer
};

export default ClientMotion;
