"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCartIcon, UserIcon } from "@heroicons/react/24/solid";
import { GiMushroomGills } from "react-icons/gi";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";
import { useAuth } from "@/context/AuthContext";

const Header = () => {
  const { user, login, logout } = useAuth();
  const cart = useSelector((state: RootState) => state.cart.items);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  
  // Calculate cart item count
  const cartItemCount = cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;
  
  // Handle scroll effect
  useEffect(() => {
    setIsClient(true);
    
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header 
      className={`w-full fixed top-0 left-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? "bg-white shadow-md py-2" 
          : "bg-[#F2EFEA] py-4"
      }`}
    >
      <div className="w-full max-w-6xl mx-auto px-4 py-6">
        <div className="flex justify-between items-center text-sm text-[#344230]">
          {/* Logo */}
          <Link
            href="/"
            className="text-3xl font-bold text-[#0E1C4C] flex items-center gap-2"
          >
            <GiMushroomGills className="text-[#4B423A]" />
            <span className="font-pacifico text-[#4B423A]">OrganicFunda</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6 text-[#344230] font-medium">
            <Link href="/#shop" className="hover:text-green-600 transition-colors">
              Shop
            </Link>
            <Link href="/about" className="hover:text-green-600 transition-colors">
              About
            </Link>
            <Link href="/#recipes" className="hover:text-green-600 transition-colors">
              Recipes
            </Link>
            <Link href="/contact" className="hover:text-green-600 transition-colors">
              Contact
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Cart with badge */}
            <div className="relative">
              <Link
                href="/cart"
                className="text-[#183E2D] hover:text-green-700 transition"
              >
                <ShoppingCartIcon className="w-6 h-6" />
              </Link>
              {isClient && cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </div>

            {/* Auth */}
            {isClient && !user ? (
              <button
                onClick={login}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium text-sm transition-colors"
              >
                Login
              </button>
            ) : isClient && user ? (
              <div className="flex items-center gap-3 text-[#183E2D]">
                <div className="bg-green-800 rounded-full p-1">
                  <UserIcon className="w-5 h-5 text-green-100" />
                </div>
                <span className="hidden md:inline text-sm font-medium truncate max-w-[100px]">
                  {user.displayName}
                </span>
                <button
                  onClick={logout}
                  className="bg-stone-700 hover:bg-stone-600 text-white px-3 py-1.5 rounded-full text-xs transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
