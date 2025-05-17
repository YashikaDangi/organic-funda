"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useCart } from "@/hooks/useCart";
import { UserIcon, ShoppingCartIcon } from "@heroicons/react/24/solid";

const Header = () => {
  const { user, login, logout } = useAuth();
  const { cart, totalItems: cartItemCount } = useCart();

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [scrolled]);

  return (
    <header
      className={`fixed top-0 w-full z-50 px-6 py-4 flex justify-between items-center transition-all duration-300 ${
        scrolled
          ? "bg-stone-800/90 backdrop-blur-md shadow-lg"
          : "bg-transparent"
      }`}
    >
      {/* Logo */}
      <Link
        href="/"
        className="flex items-center gap-2 text-2xl md:text-3xl transition-all hover:opacity-80"
      >
        <span role="img" aria-label="mushroom" className="text-xl md:text-2xl">
          🍄
        </span>
        <span className="text-green-200 font-pacifico">OrganicFunda</span>
      </Link>

      {/* Navigation */}
      <nav className="hidden md:flex items-center space-x-8">
        <Link
          href="/shop"
          className="text-stone-200 hover:text-green-200 font-medium transition-colors"
        >
          Shop
        </Link>
        <Link
          href="/about"
          className="text-stone-200 hover:text-green-200 font-medium transition-colors"
        >
          About
        </Link>
        <Link
          href="/blog"
          className="text-stone-200 hover:text-green-200 font-medium transition-colors"
        >
          Blog
        </Link>
        <Link
          href="/contact"
          className="text-stone-200 hover:text-green-200 font-medium transition-colors"
        >
          Contact
        </Link>
      </nav>

      {/* Auth Section */}
      <div className="flex items-center gap-6">
        {/* Cart Icon */}
        <div className="relative" id="cart-icon">
          <Link
            href="/cart"
            className="text-stone-200 hover:text-green-200 transition-colors"
          >
            <ShoppingCartIcon className="w-6 h-6" />
          </Link>
          {cartItemCount > 0 && (
            <span className="absolute -top-2 -right-3 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
              {cartItemCount}
            </span>
          )}
        </div>

        {/* Login/Logout */}
        {!user ? (
          <button
            onClick={login}
            className="bg-green-700 hover:bg-green-600 text-white px-5 py-2 rounded-full font-medium transition text-sm"
          >
            Login
          </button>
        ) : (
          <div className="flex items-center gap-3 text-white">
            <div className="bg-green-800 rounded-full p-1">
              <UserIcon className="w-5 h-5 text-green-100" />
            </div>
            <span className="text-sm hidden md:inline">{user.displayName}</span>
            <button
              onClick={logout}
              className="bg-stone-700 hover:bg-stone-600 text-xs md:text-sm px-3 py-1.5 rounded-full transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
