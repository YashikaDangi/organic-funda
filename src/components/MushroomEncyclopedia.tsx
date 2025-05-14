"use client";

import React from "react";
import Slider from "react-slick";
import Image from "next/image";

const mushrooms = [
  {
    name: "Reishi Mushroom",
    image: "/mushroom5.jpg",
    description:
      "Revered for its adaptogenic properties, Reishi helps reduce stress, support immunity, and promote better sleep.",
  },
  {
    name: "Lion’s Mane",
    image: "/mushroom1.jpg",
    description:
      "Known for enhancing cognitive function, Lion’s Mane supports memory, focus, and brain health.",
  },
  {
    name: "Cordyceps",
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
    autoplaySpeed: 2000,
    arrows: false,
  };

  return (
    <section className="bg-[#EFEAE6] px-0">
      <Slider {...settings}>
        {mushrooms.map((mushroom, index) => (
          <div key={index}>
            <div className="grid md:grid-cols-2 h-[500px] md:h-[600px] w-full">
              {/* Left - Full height, no margin */}
              <div className="relative w-full h-full">
                <Image
                  src={mushroom.image}
                  alt={mushroom.name}
                  fill
                  className="object-cover"
                  priority
                />
              </div>

              {/* Right - Text content */}
              <div className="flex flex-col justify-center px-6 py-10 md:py-0 bg-[#EFEAE6]">
                <h2 className="text-3xl md:text-4xl font-bold text-[#0E1C4C] mb-4">
                  {mushroom.name}
                </h2>
                <p className="text-[#4B423A] text-lg leading-relaxed">
                  {mushroom.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </section>
  );
};

export default MushroomSlider;