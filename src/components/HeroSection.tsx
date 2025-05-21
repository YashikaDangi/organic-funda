"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { ShoppingCartIcon, UserIcon } from "@heroicons/react/24/solid";
import { FaLeaf } from "react-icons/fa";
import { GiHerbsBundle } from "react-icons/gi";
import { GiMushroomGills } from "react-icons/gi";

const Hero = () => {
  const { user, login, logout, cart } = useAuth();
  const cartItemCount =
    cart?.reduce((acc, item) => acc + item.quantity, 0) || 0;

  return (
    <section className="w-full h-full bg-[#F2EFEA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">
        {/* Top Navigation */}
        <div className="flex justify-between items-center text-sm text-[#344230] mb-10">
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
            <Link href="#shop" className="hover:text-green-600">
              Shop
            </Link>
            <Link href="/about" className="hover:text-green-600">
              About
            </Link>
            <Link href="#recipes" className="hover:text-green-600">
              Recipes
            </Link>
            <Link href="/contact" className="hover:text-green-600">
              Contact
            </Link>
          </nav>

          {/* Right Icons */}
          <div className="flex items-center gap-4">
            {/* Cart */}
            <div className="relative">
              <Link
                href="/cart"
                className="text-[#183E2D] hover:text-green-700 transition"
              >
                <ShoppingCartIcon className="w-6 h-6" />
              </Link>
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-green-600 text-white text-xs px-2 py-0.5 rounded-full">
                  {cartItemCount}
                </span>
              )}
            </div>

            {/* Auth */}
            {!user ? (
              <button
                onClick={login}
                className="bg-green-700 hover:bg-green-600 text-white px-4 py-2 rounded-full font-medium text-sm"
              >
                Login
              </button>
            ) : (
              <div className="flex items-center gap-3 text-[#183E2D]">
                <div className="bg-green-800 rounded-full p-1">
                  <UserIcon className="w-5 h-5 text-green-100" />
                </div>
                <span className="hidden md:inline text-sm font-medium">
                  {user.displayName}
                </span>
                <button
                  onClick={logout}
                  className="bg-stone-700 hover:bg-stone-600 text-white px-3 py-1.5 rounded-full text-xs"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Main Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          {/* Text Content */}
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-[#183E2D] leading-snug">
            From Our Farm{" "}
              <span className="relative inline-block">
                <span className="z-10 relative">  to Your Plate </span>
                <svg
                  className="absolute left-0 bottom-0 w-full h-3 z-0"
                  viewBox="0 0 200 20"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M0 10 Q50 20 100 10 T200 10"
                    fill="none"
                    stroke="#C9E265"
                    strokeWidth="6"
                  />
                </svg>
              </span>{" "}
              — Sustainably Grown, Rich in Flavor.
            </h1>
          </div>

          {/* Image */}
          <div className="flex justify-center">
            <Image
              src="/mushroom4.jpg"
              alt="Mushroom supplement product"
              width={300}
              height={500}
              className="rounded-2xl shadow-lg"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
