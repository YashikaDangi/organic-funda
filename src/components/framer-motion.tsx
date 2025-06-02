'use client';

// Import specific exports from framer-motion
import { 
  motion as motionImport,
  AnimatePresence as AnimatePresenceImport,
  useInView as useInViewImport,
  Variants,
  HTMLMotionProps
} from 'framer-motion';

// Re-export specific components to avoid "export *" issues
export const motion = motionImport;
export const AnimatePresence = AnimatePresenceImport;
export const useInView = useInViewImport;

// Export types
export type { Variants, HTMLMotionProps };

// Animation variants
export const fadeIn: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

export const scaleUp: Variants = {
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

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Helper function to check if we're on the client
export const isClient = typeof window !== 'undefined';

// Create a safe useInView hook that works on both server and client
export const useSafeInView = (ref: React.RefObject<HTMLElement | null>, options = {}) => {
  if (!isClient) return false;
  return useInView(ref, options);
};
