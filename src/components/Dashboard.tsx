"use client";

import { useAuth } from "@/context/AuthContext";
import { Product, products } from "@/lib/products";
import React, { useState, useEffect } from "react";
import Heading from "./Heading";

const Dashboard: React.FC = () => {
  const { user, login, addToCart, cart, updateQuantity, removeFromCart } =
    useAuth();
  const [productQuantities, setProductQuantities] = useState<
    Record<string, number>
  >({});

  // Initialize product quantities from cart
  useEffect(() => {
    if (cart && cart.length > 0) {
      const quantities: Record<string, number> = {};
      cart.forEach((item) => {
        quantities[item.id] = item.quantity;
      });
      setProductQuantities(quantities);
    }
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      alert("Please login to add items to your cart!");
      login();
      return;
    }

    addToCart({ ...product, quantity: 1 });
    setProductQuantities((prev) => ({
      ...prev,
      [product.id]: 1,
    }));
  };

  const handleIncreaseQuantity = (productId: string) => {
    const currentQuantity = productQuantities[productId] || 0;
    const newQuantity = currentQuantity + 1;
    updateQuantity(productId, newQuantity);
    setProductQuantities((prev) => ({
      ...prev,
      [productId]: newQuantity,
    }));
  };

  const handleDecreaseQuantity = (productId: string) => {
    const currentQuantity = productQuantities[productId] || 0;
    if (currentQuantity <= 1) {
      removeFromCart(productId);
      setProductQuantities((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } else {
      const newQuantity = currentQuantity - 1;
      updateQuantity(productId, newQuantity);
      setProductQuantities((prev) => ({
        ...prev,
        [productId]: newQuantity,
      }));
    }
  };

  const isProductInCart = (productId: string): boolean => {
    return productId in productQuantities;
  };

  return (
    <div id="shop" className="min-h-screen bg-[#F7F7F7] px-4 py-10">
      <div className="max-w-6xl mx-auto px-4">
        <Heading>Our Mushrooms</Heading>

        <div className="grid gap-12 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 max-w-4xl mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="bg-white rounded-xl shadow-sm overflow-hidden max-w-xs mx-auto w-full"
            >
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
                  <span className="text-2xl font-bold text-[#0E1C4C]">
                    ₹{product.price.toFixed(2)}
                  </span>
                  <span className="text-gray-400 line-through ml-2 text-lg">
                    ₹{product.originalPrice.toFixed(2)}
                  </span>
                </div>

                {/* Button */}
                {isProductInCart(product.id) ? (
                  <div className="w-full flex items-center justify-between border border-[#0B5B37] rounded-lg mt-6 overflow-hidden">
                    <button
                      onClick={() => handleDecreaseQuantity(product.id)}
                      className="py-3 px-4 bg-[#0B5B37] text-white font-bold hover:bg-[#074226] transition-colors"
                    >
                      -
                    </button>
                    <span className="font-medium text-[#0E1C4C]">
                      {productQuantities[product.id]}
                    </span>
                    <button
                      onClick={() => handleIncreaseQuantity(product.id)}
                      className="py-3 px-4 bg-[#0B5B37] text-white font-bold hover:bg-[#074226] transition-colors"
                    >
                      +
                    </button>
                  </div>
                ) : (
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
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
