"use client";

import { useAuth } from "@/context/AuthContext";
import { Product, products } from "@/lib/products";
import React from "react";


const Dashboard: React.FC = () => {
  const { user, login, addToCart, cart } = useAuth();

  const handleAddToCart = (product: Product) => {
    if (!user) {
      alert("Please login to add items to your cart!");
      login();
      return;
    }

    addToCart({ ...product, quantity: 1 });
  };

  return (
    <div id="shop" className="min-h-screen bg-[#F7F7F7] px-4 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-black flex justify-center py-8 text-3xl">Our Mushrooms</h1>
        
        
        <div className="grid gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {products.map((product) => (
            <div key={product.id} className="bg-white rounded-xl shadow-sm overflow-hidden max-w-xs mx-auto w-full">
              {/* Product Image with Discount Badge */}
              <div className="relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-80 object-cover"
                />
                
              </div>
              
              {/* Product Info */}
              <div className="p-6">
                
                {/* Name */}
                <h2 className="text-2xl font-medium text-gray-800 mb-2 mt-2">
                  {product.name}
                </h2>
                
                
                {/* Price */}
                <div className="flex items-center mt-2 mb-4">
                  <span className="text-2xl font-bold">₹{product.price.toFixed(2)}</span>
                  <span className="text-gray-400 line-through ml-2 text-lg">
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                </div>
                
                {/* Button */}
                <button
                  onClick={() => {
                    if (!product.inStock) {
                      alert("This product is currently out of stock.");
                      return;
                    }
                    handleAddToCart(product);
                  }}
                  className={`w-full py-3 rounded-lg font-medium text-white mt-6 ${
                    product.inStock
                      ? "bg-[#0B5B37] hover:bg-[#074226]"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  {product.inStock ? "Add to Cart" : "Out of Stock"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;