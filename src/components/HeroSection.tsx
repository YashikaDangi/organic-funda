"use client"

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { FaLeaf, FaShippingFast, FaCheck, FaSeedling } from "react-icons/fa";
import { GiMushrooms } from "react-icons/gi";
import { FiArrowRight } from "react-icons/fi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncComplete, setSyncComplete] = useState(false);
  const cart = useSelector((state: RootState) => state.cart.items);
  
  // Handle client-side rendering to prevent hydration errors
  useEffect(() => {
    setIsLoaded(true);
    setIsClient(true);
    
    // Simulate cart sync with Firestore
    setIsSyncing(true);
    const timer = setTimeout(() => {
      setIsSyncing(false);
      setSyncComplete(true);
      
      // Reset sync complete status after showing success indicator
      const resetTimer = setTimeout(() => {
        setSyncComplete(false);
      }, 2000);
      
      return () => clearTimeout(resetTimer);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);

  // Handle parallax scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center bg-cover bg-center"
      style={{
        backgroundImage: "url('/bg-image-1.jpg')",
      }}
    >
      {/* Overlay with parallax effect */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-primary-dark/90 to-primary-dark/70"
        style={{
          transform: `translateY(${scrollY * 0.1}px)`,
        }}
      ></div>
      
      {/* Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-accent/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-secondary/20 rounded-full blur-3xl"></div>
      </div>
      
      {/* Content Container */}
      <div className="container relative z-10 grid md:grid-cols-2 gap-8 items-center py-16">
        {/* Left Content - Text */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={isLoaded ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-left px-4 md:px-0"
        >
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold text-white leading-tight">
            From Our Farm to <br />
            <span className="text-accent">Your Plate</span>
          </h1>
          
          <p className="mt-6 text-base sm:text-lg text-white/80 max-w-xl leading-relaxed">
            Discover the finest selection of hand-harvested organic mushrooms, 
            sustainably grown with care and delivered fresh to your doorstep.
          </p>
          
          {/* Features */}
          <div className="mt-8 grid grid-cols-2 gap-4">
            {[
              { icon: <FaLeaf />, text: "100% Organic" },
              { icon: <FaShippingFast />, text: "Fast Delivery" },
              { icon: <FaCheck />, text: "Premium Quality" },
              { icon: <FaSeedling />, text: "Sustainable" }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.4 + (index * 0.1) }}
                className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg p-3"
              >
                <div className="text-accent text-lg">{feature.icon}</div>
                <span className="text-white font-medium">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          
          {/* CTA Buttons */}
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/#shop">
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.8 }}
                className="btn-primary flex items-center gap-2 group"
              >
                Shop Now
                <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </Link>
            
            
          </div>
          
          {/* Cart sync status indicator - client-side only rendering */}
          {isClient && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="mt-6 flex items-center gap-2 text-sm"
            >
              <span className={`inline-block w-2 h-2 rounded-full ${isSyncing ? 'bg-yellow-400' : syncComplete ? 'bg-green-400' : 'bg-white/50'}`}></span>
              <span className="text-white/70">
                {isSyncing ? 'Syncing cart...' : syncComplete ? 'Cart synced!' : `${cart.length} items in cart`}
              </span>
            </motion.div>
          )}
        </motion.div>
        
       
      </div>
      
      {/* Scroll indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={isLoaded ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-white/70 text-sm mb-2">Scroll to explore</span>
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center pt-2">
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-1.5 h-1.5 bg-white rounded-full"
          />
        </div>
      </motion.div>
    </section>
  );
}
