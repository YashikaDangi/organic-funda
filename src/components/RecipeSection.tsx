"use client";

import React from "react";
import Image from "next/image";

const recipes = [
  {
    title: "Seared Vegan Oyester Mushroom",
    image: "/recipe1.jpg",
    description:
      "A soothing tea brewed with Reishi, chamomile, and lavender to wind down your evening naturally.",
  },
  {
    title: "Garlic Butter Oyester Mushroom",
    image: "/recipe2.jpg",
    description:
      "Creamy garlic pasta infused with sautéed Lion’s Mane mushrooms for brain-boosting benefits.",
  },
  {
    title: "Cheese Toast With Muhsrooms",
    image: "/recipe4.jpg",
    description:
      "A vibrant smoothie packed with Cordyceps, banana, cacao, and almond butter for clean energy.",
  },
];

const RecipeSection = () => {
  return (
    <section id="recipes" className="bg-[#F7F7F7] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <h2 className="text-4xl font-serif text-[#0E1C4C] mb-12 text-center">
        Mushroom Recipes
        </h2>
        <div className="grid md:grid-cols-3 gap-10">
          {recipes.map((recipe, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-xl overflow-hidden hover:scale-[1.02] transition"
            >
              <div className="relative h-56 w-full">
                <Image
                  src={recipe.image}
                  alt={recipe.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-2xl font-serif text-[#0E1C4C] mb-3">
                  {recipe.title}
                </h3>
                <p className="text-[#4B423A] leading-relaxed text-base">
                  {recipe.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecipeSection;
