"use client";

import React from "react";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="w-full h-full bg-[#F2EFEA] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-6xl">

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
