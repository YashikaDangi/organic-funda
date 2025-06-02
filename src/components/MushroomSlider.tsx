"use client";

import React, { useState, useEffect } from "react";
import Slider from "react-slick";
import { motion } from "framer-motion";
import { FiInfo } from "react-icons/fi";
import { GiMushroomGills } from "react-icons/gi";
import { MdOutlineHealthAndSafety } from "react-icons/md";
import { BiDish } from "react-icons/bi";

const mushrooms = [
  {
    id: 1,
    name: "White Mushroom",
    image: "/white-oyester.jpg",
    description: "Delicate and mild with a subtle seafood flavor. Great for stir-fries and soups.",
    category: "Gourmet",
    benefits: ["Rich in protein", "High in antioxidants", "Supports immune health"],
    cookingTips: "Quick-cook to preserve texture. Excellent in pasta dishes and risottos."
  },
  {
    id: 2,
    name: "Grey Mushroom",
    image: "/mushroom2.jpg",
    description: "Rich, earthy flavor with a meaty texture. Perfect for Asian dishes.",
    category: "Medicinal",
    benefits: ["Boosts immunity", "Rich in vitamin D", "Supports heart health"],
    cookingTips: "Remove stems before cooking. Excellent in stir-fries and soups."
  },
  {
    id: 3,
    name: "Pink Mushroom",
    image: "/pink-oyester.jpg",
    description: "Mild flavor that intensifies when cooked. Versatile for almost any dish.",
    category: "Everyday",
    benefits: ["Low in calories", "Good source of selenium", "Contains B vitamins"],
    cookingTips: "Versatile in almost any dish. Great raw in salads or cooked in sauces."
  }
];

const MushroomSlider = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeSlide, setActiveSlide] = useState(0);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    pauseOnHover: true,
    beforeChange: (current: number, next: number) => setActiveSlide(next),
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 640,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
    customPaging: (i: number) => (
      <div className={`w-3 h-3 mx-1 rounded-full transition-all duration-300 ${activeSlide === i ? 'bg-primary scale-125' : 'bg-primary/30'}`} />
    ),
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center mb-3">
            <span className="h-px w-8 bg-primary/30"></span>
            <span className="mx-3 text-primary font-medium text-sm uppercase tracking-wider">Our Selection</span>
            <span className="h-px w-8 bg-primary/30"></span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold text-primary-dark mb-4">
            Discover Our Mushroom Varieties
          </h2>
          
          <p className="text-foreground/70 max-w-2xl mx-auto">
            We cultivate a diverse range of premium organic mushrooms, each with unique
            flavors, textures, and health benefits. Explore our carefully grown selection.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isLoaded ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Slider {...settings} className="mushroom-slider -mx-4">
            {mushrooms.map((mushroom, index) => (
              <div key={mushroom.id} className="px-4 py-2">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.1 * index }}
                  className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col group"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={mushroom.image}
                      alt={mushroom.name}
                      className="w-full h-64 object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-primary-dark">
                      {mushroom.category}
                    </div>
                  </div>
                  
                  <div className="p-6 flex-grow flex flex-col">
                    <h3 className="text-xl font-bold text-primary-dark mb-2 flex items-center">
                      <GiMushroomGills className="mr-2 text-primary" />
                      {mushroom.name}
                    </h3>
                    
                    <p className="text-foreground/70 mb-4">
                      {mushroom.description}
                    </p>
                    
                    <div className="mt-auto space-y-4">
                      <div className="flex items-start">
                        <MdOutlineHealthAndSafety className="text-accent mt-1 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-primary-dark mb-1">Health Benefits</h4>
                          <ul className="text-xs text-foreground/70 space-y-1">
                            {mushroom.benefits.map((benefit, i) => (
                              <li key={i} className="flex items-center">
                                <span className="w-1.5 h-1.5 rounded-full bg-accent/50 mr-1.5"></span>
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      
                      <div className="flex items-start">
                        <BiDish className="text-secondary mt-1 mr-2 flex-shrink-0" />
                        <div>
                          <h4 className="text-sm font-semibold text-primary-dark mb-1">Cooking Tip</h4>
                          <p className="text-xs text-foreground/70">{mushroom.cookingTips}</p>
                        </div>
                      </div>
                    </div>
                    
                    <button className="mt-6 text-sm font-medium text-primary flex items-center hover:text-primary-dark transition-colors">
                      <FiInfo className="mr-1" /> Learn more
                    </button>
                  </div>
                </motion.div>
              </div>
            ))}
          </Slider>
        </motion.div>
      </div>
    </section>
  );
};

export default MushroomSlider;
