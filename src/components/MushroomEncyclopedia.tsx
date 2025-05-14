"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const mushrooms = [
  {
    name: "White Oyester Mushroom",
    image: "/mushroom5.jpg",
    description:
      "Revered for its adaptogenic properties, Reishi helps reduce stress, support immunity, and promote better sleep.",
  },
  {
    name: "Pink Oyester Muhsroom",
    image: "/pink-oyester.jpg",
    description:
      "Known for enhancing cognitive function, Lion’s Mane supports memory, focus, and brain health.",
  },
  {
    name: "Grey Oyester Mushroom",
    image: "/mushroom2.jpg",
    description:
      "Cordyceps boosts energy and stamina naturally — a favorite among athletes and wellness enthusiasts.",
  },
];

const MushroomSlider = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3500,
    arrows: false,
  };

  return (
    <section className="bg-[#EFEAE6] py-8 md:py-16">
      <div className="max-w-6xl mx-auto px-4">
        <Slider {...settings}>
          {mushrooms.map((mushroom, index) => (
            <div key={index}>
              <div className="flex flex-col md:flex-row items-center gap-8 md:gap-16">
                {/* Image */}
                <div className="w-full md:w-1/2 aspect-square relative rounded-2xl overflow-hidden shadow-md">
                  <Image
                    src={mushroom.image}
                    alt={mushroom.name}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>

                {/* Text */}
                <div className="w-full md:w-1/2 text-center md:text-left">
                  <h2 className="text-3xl md:text-4xl font-bold text-[#0E1C4C] font-serif mb-4">
                    {mushroom.name}
                  </h2>
                  <p className="text-[#4B423A] text-lg leading-relaxed md:pr-8">
                    {mushroom.description}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default MushroomSlider;
