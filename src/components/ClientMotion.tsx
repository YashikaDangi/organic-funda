// "use client";

// import React, { useState, useEffect } from 'react';
// import dynamic from 'next/dynamic';
// // Import animation variants from our type-safe file
// import { fadeIn, scaleUp, staggerContainer, MotionProps, AnimatePresenceProps, InViewOptions } from './motion';

// // Import framer-motion components directly in this client component only
// // We use import() to get specific named exports instead of "export *"
// import { motion } from 'framer-motion/dom';

// // Client-only wrapper component
// export const ClientOnly: React.FC<{
//   children: React.ReactNode;
// }> = ({ children }) => {
//   const [isMounted, setIsMounted] = useState(false);

//   useEffect(() => {
//     setIsMounted(true);
//   }, []);

//   if (!isMounted) {
//     return null; // Don't render anything during SSR
//   }

//   return <>{children}</>;
// };

// // Create motion components directly from framer-motion/dom
// const MotionDiv = motion.div;
// const MotionButton = motion.button;
// const MotionH2 = motion.h2;
// const MotionP = motion.p;

// // Dynamically import AnimatePresence to avoid "export *" issues
// const DynamicAnimatePresence = dynamic(
//   () => import('framer-motion/dom').then(mod => mod.AnimatePresence),
//   { ssr: false }
// );

// // Dynamically import useInView to avoid "export *" issues
// const useInViewInternal = () => {
//   const [inView, setInView] = useState(false);
  
//   useEffect(() => {
//     // Only import on client
//     import('framer-motion/dom').then(mod => {
//       // Store the useInView function
//       const useInViewFn = mod.useInView;
//       // We can't call hooks conditionally, so this is a workaround
//       setInView(true);
//     });
//   }, []);
  
//   return inView;
// };

// // Exported motion components wrapped in ClientOnly
// export const SafeMotionDiv: React.FC<MotionProps> = (props) => (
//   <ClientOnly>
//     <MotionDiv {...props} />
//   </ClientOnly>
// );

// export const SafeMotionButton: React.FC<MotionProps> = (props) => (
//   <ClientOnly>
//     <MotionButton {...props} />
//   </ClientOnly>
// );

// export const SafeMotionH2: React.FC<MotionProps> = (props) => (
//   <ClientOnly>
//     <MotionH2 {...props} />
//   </ClientOnly>
// );

// export const SafeMotionP: React.FC<MotionProps> = (props) => (
//   <ClientOnly>
//     <MotionP {...props} />
//   </ClientOnly>
// );

// export const SafeAnimatePresence: React.FC<AnimatePresenceProps> = (props) => (
//   <ClientOnly>
//     {/* Use the dynamically imported component */}
//     <DynamicAnimatePresence {...props} />
//   </ClientOnly>
// );

// // Export a safe useInView hook
// export const useInViewSafe = (ref: React.RefObject<Element>, options?: InViewOptions) => {
//   const [isInView, setIsInView] = useState(false);
  
//   useEffect(() => {
//     // Only run on client
//     if (typeof window === 'undefined') return;
    
//     // Simple intersection observer as fallback
//     const observer = new IntersectionObserver(
//       ([entry]) => {
//         setIsInView(entry.isIntersecting);
//       },
//       {
//         threshold: options?.amount || 0,
//         rootMargin: options?.margin || '0px',
//       }
//     );
    
//     if (ref.current) {
//       observer.observe(ref.current);
//     }
    
//     return () => {
//       if (ref.current) {
//         observer.unobserve(ref.current);
//       }
//     };
//   }, [ref, options]);
  
//   return isInView;
// };

// // Export animation variants
// export { fadeIn, scaleUp, staggerContainer };
