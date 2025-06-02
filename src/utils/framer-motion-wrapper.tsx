"use client";

import { motion, AnimatePresence, useInView } from "framer-motion";

// Export a wrapper component that provides access to all framer-motion components
const FramerMotionWrapper = {
  motion,
  AnimatePresence,
  useInView
};

export default FramerMotionWrapper;
