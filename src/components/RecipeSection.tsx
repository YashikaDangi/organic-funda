"use client";

import React from "react";
import Image from "next/image";
import { recipes } from "@/lib/recipes";
import Heading from "./Heading";



const RecipeSection = () => {
  return (
    <section id="recipes" className="bg-[#F7F7F7] py-16">
      <div className="max-w-7xl mx-auto px-4">
        <Heading>
        Mushroom Recipes
        </Heading>
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
