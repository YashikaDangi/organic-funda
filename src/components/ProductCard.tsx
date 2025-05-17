'use client';

import React from 'react';
import { useCart } from '@/hooks/useCart';
import { Product } from '@/redux/slices/cartSlice';

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    price: number;
    description: string;
    image?: string;
  };
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    const cartItem: Product = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1,
      image: product.image
    };
    addToCart(cartItem);
  };

  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      {product.image && (
        <div className="h-48 overflow-hidden">
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
        </div>
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-[#0E1C4C] mb-1">{product.name}</h3>
        <p className="text-[#4B423A] text-sm mb-3 line-clamp-2">{product.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-[#7B1113] font-bold">${product.price.toFixed(2)}</span>
          <button
            onClick={handleAddToCart}
            className="bg-[#0E1C4C] hover:bg-[#1A2F6D] text-white px-3 py-1 rounded-md text-sm font-medium transition-colors duration-300"
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
