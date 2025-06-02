"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingCartIcon, UserIcon, Bars3Icon, XMarkIcon } from "@heroicons/react/24/solid";
import { GiMushroomGills } from "react-icons/gi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { user, login, logout } = useAuth();
  const cart = useSelector((state: RootState) => state.cart.items);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const cartItemCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  useEffect(() => {
    setIsClient(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Shop", href: "/#shop" },
    { label: "About", href: "/about" },
    { label: "Recipes", href: "/#recipes" },
    { label: "Contact", href: "/contact" },
  ];

  return (
    <header
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-white/90 backdrop-blur-md shadow-md py-2"
        : "bg-gradient-to-b from-black/50 to-transparent py-4"
        }`}
    >
      <div className="container mx-auto px-4 ">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link
            href="/"
            className="text-2xl font-bold flex items-center gap-2 font-heading"
          >
            <GiMushroomGills className={`text-3xl ${isScrolled ? 'text-secondary' : 'text-accent'}`} />
            <span className={`${isScrolled ? 'text-primary-dark' : 'text-white'}`}>OrganicFunda</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-6 font-medium items-center">
            {navItems.map((item, index) => (
              <Link
                key={item.label}
                href={item.href}
                className={`relative px-2 py-1 font-accent text-sm font-medium transition-colors duration-200 group ${isScrolled ? 'text-primary-dark hover:text-primary' : 'text-white hover:text-accent'}`}
              >
                {item.label}
                <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isScrolled ? 'bg-secondary' : 'bg-accent'} group-hover:w-full transition-all duration-300`}></span>
              </Link>
            ))}
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <div className="relative">
              <Link
                href="/cart"
                className={`transition p-2 rounded-full ${isScrolled ? 'text-primary-dark hover:text-primary hover:bg-primary/5' : 'text-white hover:text-accent hover:bg-white/10'}`}
              >
                <ShoppingCartIcon className="w-6 h-6" />
                {isClient && cartItemCount > 0 && (
                  <motion.span 
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-2 -right-2 bg-accent text-white text-xs w-5 h-5 flex items-center justify-center rounded-full font-medium"
                  >
                    {cartItemCount}
                  </motion.span>
                )}
              </Link>
            </div>

            {/* Auth Buttons */}
            {!user && isClient ? (
              <button
                onClick={login}
                className={`text-sm py-2 px-4 rounded-full transition-colors ${isScrolled ? 'bg-primary text-white hover:bg-primary-dark' : 'bg-white/20 backdrop-blur-sm text-white hover:bg-white/30'}`}
              >
                Login
              </button>
            ) : user && isClient ? (
              <div className={`flex items-center gap-2 ${isScrolled ? 'text-primary-dark' : 'text-white'}`}>
                <div className="bg-accent rounded-full p-1.5">
                  <UserIcon className="w-4 h-4 text-white" />
                </div>
                <span className="hidden md:inline text-sm font-medium truncate max-w-[100px]">
                  {user.displayName}
                </span>
                <button
                  onClick={logout}
                  className={`px-3 py-1.5 rounded-full text-xs transition-colors ${isScrolled ? 'bg-secondary/10 hover:bg-secondary/20 text-secondary' : 'bg-white/20 hover:bg-white/30 text-white'}`}
                >
                  Logout
                </button>
              </div>
            ) : null}

            {/* Mobile Menu Button */}
            <button 
              className={`md:hidden p-1 ${isScrolled ? 'text-primary-dark' : 'text-white'}`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div 
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="md:hidden bg-white border-t border-gray-100 shadow-md"
        >
          <div className="container mx-auto py-4 px-4">
            <nav className="flex flex-col gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-primary-dark py-2 border-b border-gray-100 font-medium"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </motion.div>
      )}
    </header>
  );
};

export default Header;
