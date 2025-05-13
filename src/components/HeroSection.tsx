"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

const Hero = () => {
  const [activeTab, setActiveTab] = useState('fresh');

  return (
    <section
      className="relative w-full h-[90vh] overflow-hidden bg-stone-700 text-white"
    >
      {/* Soil-like background at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-[30%] bg-stone-950 z-0"></div>
      
      <div className="container mx-auto px-2 py-4 flex flex-col h-full relative z-10">
        {/* Hero Text Content */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-20 md:pt-20">
          <div className="w-full md:w-1/2 z-20">
            <h1 className="text-4xl md:text-2xl lg:text-6xl font-semibold leading-tight text-stone-100">
              Grown with<br/> care,<br/> packed with<br/> nutrients. 
            </h1>
            <h2 className="text-2xl md:text-3xl font-semibold mt-20 text-green-200">
              Discover the taste of pure,<br/> chemical-free mushrooms.
            </h2>
          </div>
          
          {/* Mushroom Images Section */}
          <div className="w-full md:w-1/2 flex flex-col md:flex-row gap-4 mt-8 md:mt-0">
            <div 
              className="relative rounded-lg overflow-hidden w-full md:w-1/2 h-[350px] cursor-pointer border-4 border-stone-300"
              onClick={() => setActiveTab('dried')}
            >
              <img 
                src="/white-oyester.jpeg" 
                alt="Dried Mushrooms"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
             
            </div>
            
            <div 
              className="relative rounded-lg overflow-hidden w-full md:w-1/2 h-[350px] cursor-pointer border-4 border-stone-300"
              onClick={() => setActiveTab('fresh')}
            >
              <img 
                src="/pink-oyester.jpeg" 
                alt="Fresh Mushrooms"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/20"></div>
              
            </div>
          </div>
        </div>
        
      </div>
    </section>
  );
};

export default Hero;