'use client';

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Product } from "@/lib/products";
import { useAuth } from "@/context/AuthContext";
import { FiShoppingCart, FiInfo } from "react-icons/fi";
import { GiWeightScale } from "react-icons/gi";
import { TbTruckDelivery } from "react-icons/tb";
import { MdOutlineLocalOffer } from "react-icons/md";
import { useSelector } from "react-redux";
import { RootState } from "@/redux/store";

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onIncreaseQuantity?: (productId: string) => void;
  onDecreaseQuantity?: (productId: string) => void;
  quantity?: number;
  inCart?: boolean;
  index?: number;
}

const ProductCard: React.FC<ProductCardProps> = ({ 
  product, 
  onAddToCart, 
  onIncreaseQuantity, 
  onDecreaseQuantity, 
  quantity = 0, 
  inCart = false,
  index = 0
}) => {
  const { user, login } = useAuth();
  const [isHovered, setIsHovered] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const cart = useSelector((state: RootState) => state.cart.items);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddToCart = () => {
    if (!user) {
      alert("Please login to add items to your cart!");
      login();
      return;
    }

    onAddToCart(product);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 * (index % 4) }}
      viewport={{ once: true }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="card group relative flex flex-col h-full"
    >
      {/* Image Container */}
      <div className="relative overflow-hidden aspect-square ">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        
        {/* Discount Badge */}
        {product.originalPrice > product.price && (
          <div className="absolute top-3 left-3 bg-secondary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md">
            <MdOutlineLocalOffer className="text-white" />
            <span>
              {Math.round(
                ((product.originalPrice - product.price) / product.originalPrice) * 100
              )}% OFF
            </span>
          </div>
        )}
        
        {/* Quick Info Overlay */}
        <div 
          className={`absolute inset-0 bg-gradient-to-t from-primary-dark/80 via-primary-dark/50 to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        >
          <div className="text-white space-y-2">
            <div className="flex items-center gap-2">
              <GiWeightScale className="text-accent" />
              <span className="text-sm">Available in 250g, 500g, 1kg</span>
            </div>
            <div className="flex items-center gap-2">
              <TbTruckDelivery className="text-accent" />
              <span className="text-sm">Free delivery over ₹500</span>
            </div>
          </div>
        </div>
      </div>

      {/* Product Info */}
      <div className="p-4 flex-grow flex flex-col">
        <div className="mb-2">
          <span className="text-xs text-primary-dark/70 font-medium uppercase tracking-wider">
            {product.category || 'Mushroom'}
          </span>
        </div>
        
        <h3 className="text-lg font-bold text-primary-dark mb-1">{product.name}</h3>
        
        <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{product.description || 'Fresh organic mushrooms grown with care and delivered to your doorstep.'}</p>
        
        <div className="flex items-center mt-auto mb-3">
          <span className="text-xl font-bold text-primary">
            ₹{product.price.toFixed(2)}
          </span>
          {product.originalPrice > product.price && (
            <span className="text-foreground/40 line-through ml-2 text-sm">
              ₹{product.originalPrice.toFixed(2)}
            </span>
          )}
        </div>

        {/* Cart Buttons */}
        {isClient && inCart ? (
          <div className="flex items-center justify-between border border-primary rounded-full mt-2 overflow-hidden">
            <button
              onClick={() => onDecreaseQuantity && onDecreaseQuantity(product.id)}
              className="py-1.5 px-4 bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
            >
              -
            </button>
            <span className="font-medium text-primary-dark">
              {quantity}
            </span>
            <button
              onClick={() => onIncreaseQuantity && onIncreaseQuantity(product.id)}
              className="py-1.5 px-4 bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
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
              handleAddToCart();
            }}
            className={`w-full mt-2 py-2 rounded-full font-medium text-white transition-colors flex items-center justify-center gap-2 ${product.inStock
              ? "bg-primary hover:bg-primary-dark"
              : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <FiShoppingCart />
            {product.inStock ? "Add to Cart" : "Out of Stock"}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ProductCard;
