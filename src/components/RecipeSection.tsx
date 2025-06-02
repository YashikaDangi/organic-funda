"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FiClock, FiChevronRight } from "react-icons/fi";
import { GiCook, GiMushroomGills } from "react-icons/gi";
import { MdOutlineFoodBank } from "react-icons/md";
import Link from "next/link";

const recipes = [
  {
    id: 1,
    title: "Creamy Mushroom Risotto",
    image: "/recipe1.jpg",
    description: "A luxurious Italian classic featuring our organic oyster mushrooms.",
    difficulty: "Medium",
    time: "45 mins",
    servings: 4,
    ingredients: ["Arborio rice", "Oyster mushrooms", "Vegetable broth", "White wine", "Parmesan"],
    featured: true
  },
  {
    id: 2,
    title: "Mushroom & Spinach Quiche",
    image: "/recipe2.jpg",
    description: "A savory breakfast or brunch option with shiitake mushrooms and fresh spinach.",
    difficulty: "Easy",
    time: "60 mins",
    servings: 6,
    ingredients: ["Shiitake mushrooms", "Fresh spinach", "Eggs", "Cream", "Pie crust"],
    featured: false
  },
  {
    id: 3,
    title: "Stuffed Portobello Caps",
    image: "/recipe3.jpg",
    description: "Hearty portobello mushrooms stuffed with herbs, cheese, and breadcrumbs.",
    difficulty: "Easy",
    time: "30 mins",
    servings: 4,
    ingredients: ["Portobello mushrooms", "Garlic", "Herbs", "Breadcrumbs", "Cheese"],
    featured: true
  },
  {
    id: 4,
    title: "Wild Mushroom Soup",
    image: "/recipe4.jpg",
    description: "A comforting, creamy soup featuring a medley of our organic mushrooms.",
    difficulty: "Easy",
    time: "40 mins",
    servings: 6,
    ingredients: ["Mixed mushrooms", "Onion", "Garlic", "Cream", "Thyme"],
    featured: false
  },
  {
    id: 5,
    title: "Mushroom Wellington",
    image: "/recipe5.jpg",
    description: "An impressive vegetarian main course perfect for special occasions.",
    difficulty: "Hard",
    time: "90 mins",
    servings: 6,
    ingredients: ["Portobello mushrooms", "Puff pastry", "Spinach", "Walnuts", "Herbs"],
    featured: true
  },
  {
    id: 6,
    title: "Mushroom Pasta with Truffle Oil",
    image: "/recipe6.jpg",
    description: "A quick and elegant pasta dish with earthy mushrooms and aromatic truffle oil.",
    difficulty: "Easy",
    time: "25 mins",
    servings: 4,
    ingredients: ["Pasta", "Mixed mushrooms", "Garlic", "Parmesan", "Truffle oil"],
    featured: false
  },
];

const RecipeSection = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hoveredRecipe, setHoveredRecipe] = useState<number | null>(null);
  
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const featuredRecipes = recipes.filter(recipe => recipe.featured);
  const regularRecipes = recipes.filter(recipe => !recipe.featured);

  return (
    <section className="py-16 bg-gradient-to-b from-primary-dark to-primary-darker text-white">
      <div className="container mx-auto px-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center mb-3">
            <span className="h-px w-8 bg-accent/50"></span>
            <span className="mx-3 text-accent font-medium text-sm uppercase tracking-wider">Culinary Inspiration</span>
            <span className="h-px w-8 bg-accent/50"></span>
          </div>
          
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Delicious Mushroom Recipes
          </h2>
          
          <p className="text-white/80 max-w-2xl mx-auto">
            Get inspired with these delicious recipes featuring our organic
            mushrooms. From quick weeknight dinners to impressive dinner party
            dishes, discover the versatility of gourmet mushrooms.
          </p>
        </motion.div>

        {/* Featured Recipes - Larger Cards */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mb-12"
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <MdOutlineFoodBank className="mr-2 text-accent" />
            Featured Recipes
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + (index * 0.1) }}
                className="relative group"
                onMouseEnter={() => setHoveredRecipe(recipe.id)}
                onMouseLeave={() => setHoveredRecipe(null)}
              >
                <div className="relative h-80 rounded-2xl overflow-hidden">
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                  
                  {/* Image */}
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  {/* Content */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <div className="flex items-center space-x-3 mb-3">
                      <span className="bg-accent/90 text-white text-xs px-3 py-1 rounded-full">
                        {recipe.difficulty}
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full flex items-center">
                        <FiClock className="mr-1" /> {recipe.time}
                      </span>
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2 group-hover:text-accent transition-colors">
                      {recipe.title}
                    </h3>
                    
                    <p className="text-white/80 mb-4 line-clamp-2">
                      {recipe.description}
                    </p>
                    
                    <Link href={`/recipes/${recipe.id}`}>
                      <button className="flex items-center text-accent hover:text-white transition-colors">
                        View Recipe <FiChevronRight className="ml-1" />
                      </button>
                    </Link>
                  </div>
                </div>
                
                {/* Hover Info Card */}
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ 
                    opacity: hoveredRecipe === recipe.id ? 1 : 0,
                    y: hoveredRecipe === recipe.id ? 0 : 10 
                  }}
                  transition={{ duration: 0.2 }}
                  className="absolute -right-4 -top-4 bg-white text-primary-dark rounded-lg shadow-lg p-4 z-30 w-48"
                >
                  <div className="flex items-start mb-2">
                    <GiCook className="text-accent mt-1 mr-2" />
                    <div>
                      <h4 className="text-xs font-semibold">INGREDIENTS</h4>
                      <ul className="text-xs text-primary-dark/70 mt-1">
                        {recipe.ingredients.map((ingredient, i) => (
                          <li key={i} className="flex items-center">
                            <GiMushroomGills className="text-accent/70 mr-1 text-[10px]" />
                            {ingredient}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="text-xs text-primary-dark/70 flex justify-between">
                    <span>Serves: {recipe.servings}</span>
                    <span className="font-medium text-accent">{recipe.time}</span>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Regular Recipes - Smaller Cards */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold mb-6 flex items-center">
            <GiCook className="mr-2 text-accent" />
            More Recipes to Try
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularRecipes.map((recipe, index) => (
              <motion.div
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={isLoaded ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + (index * 0.1) }}
                className="bg-white/10 backdrop-blur-sm rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 group"
              >
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={recipe.image}
                    alt={recipe.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-primary-dark flex items-center">
                    <FiClock className="mr-1" /> {recipe.time}
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-medium text-accent">{recipe.difficulty}</span>
                    <span className="text-xs text-white/70">Serves: {recipe.servings}</span>
                  </div>
                  
                  <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors">
                    {recipe.title}
                  </h3>
                  
                  <p className="text-white/70 text-sm mb-4 line-clamp-2">
                    {recipe.description}
                  </p>
                  
                  <Link href={`/recipes/${recipe.id}`}>
                    <button className="text-sm text-accent hover:text-white transition-colors flex items-center">
                      View Recipe <FiChevronRight className="ml-1" />
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div> */}

        {/* <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={isLoaded ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center mt-12"
        >
          <Link href="/recipes">
            <button className="bg-accent hover:bg-accent/80 text-white px-6 py-3 rounded-lg font-semibold transition-colors duration-300 flex items-center mx-auto">
              View All Recipes
              <FiChevronRight className="ml-2" />
            </button>
          </Link>
        </motion.div> */}
      </div>
    </section>
  );
};

export default RecipeSection;
