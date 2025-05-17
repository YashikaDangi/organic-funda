'use client';

import React from 'react';
import ProductCard from '@/components/ProductCard';

// Sample product data
const products = [
  {
    id: '1',
    name: 'Organic Shiitake Mushrooms',
    price: 12.99,
    description: 'Fresh organic shiitake mushrooms grown in controlled environments. Rich in flavor and nutrients.',
    image: '/images/shiitake.jpg'
  },
  {
    id: '2',
    name: 'Organic Oyster Mushrooms',
    price: 9.99,
    description: 'Delicate and flavorful oyster mushrooms. Perfect for stir-fries and soups.',
    image: '/images/oyster.jpg'
  },
  {
    id: '3',
    name: 'Organic Button Mushrooms',
    price: 7.99,
    description: 'Classic button mushrooms grown organically. Versatile for any dish.',
    image: '/images/button.jpg'
  },
  {
    id: '4',
    name: 'Organic Portobello Mushrooms',
    price: 10.99,
    description: 'Large, meaty portobello mushrooms. Great for grilling or as a meat substitute.',
    image: '/images/portobello.jpg'
  },
  {
    id: '5',
    name: 'Organic Enoki Mushrooms',
    price: 8.99,
    description: 'Long, thin enoki mushrooms with a mild flavor. Commonly used in East Asian cuisine.',
    image: '/images/enoki.jpg'
  },
  {
    id: '6',
    name: 'Organic Chanterelle Mushrooms',
    price: 15.99,
    description: 'Gourmet chanterelle mushrooms with a distinctive fruity aroma and peppery flavor.',
    image: '/images/chanterelle.jpg'
  },
];

const ProductsPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#EFEAE6] py-16 px-4">
      <div className="container mx-auto">
        <h1 className="text-4xl font-bold text-[#0E1C4C] mb-8 text-center">Our Products</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
