"use client";

import { useAuth } from "@/context/AuthContext";
import React, { useRef } from "react";

type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  description?: string;
  inStock?: boolean;
};

const products: Product[] = [
  {
    id: "1",
    name: "White Oyster Mushroom",
    price: 120.0,
    image: "/white-oyester.jpeg",
    description:
      "100% Pure Cordyceps Militaris | Dried Food Body | High Biocompounds (Box of 50 g/50 servings)",
    inStock: true,
  },
  {
    id: "2",
    name: "Pink Oyster Mushroom",
    price: 120.0,
    image: "/pink-oyester.jpeg",
    description:
      "100% Pure Cordyceps Militaris | Dried Food Body | High Biocompounds (Box of 50 g/50 servings)",
    inStock: false,
  },
  {
    id: "3",
    name: "Grey Oyster Mushroom",
    price: 120.0,
    image: "/grey-oyester.jpeg",
    description:
      "100% Pure Cordyceps Militaris | Dried Food Body | High Biocompounds (Box of 50 g/50 servings)",
    inStock: true,
  },
];

const Dashboard: React.FC = () => {
  const { user, login, addToCart, cart, updateQuantity, removeFromCart } =
    useAuth();

  const handleAddToCart = (
    product: Product,
    imgRef: React.RefObject<HTMLImageElement>
  ) => {
    if (!user) {
      alert("Please login to add items to your cart!");
      login();
      return;
    }

    if (imgRef.current) {
      animateToCart(imgRef.current);
    }

    addToCart({ ...product, quantity: 1 });
  };

  const animateToCart = (img: HTMLImageElement) => {
    const cartIcon = document.getElementById("cart-icon");
    if (!cartIcon) return;

    const imgRect = img.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    const clone = img.cloneNode(true) as HTMLImageElement;
    clone.style.position = "fixed";
    clone.style.left = imgRect.left + "px";
    clone.style.top = imgRect.top + "px";
    clone.style.width = imgRect.width + "px";
    clone.style.height = imgRect.height + "px";
    clone.style.transition = "all 0.8s ease-in-out";
    clone.style.zIndex = "1000";

    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.left = cartRect.left + "px";
      clone.style.top = cartRect.top + "px";
      clone.style.width = "30px";
      clone.style.height = "30px";
      clone.style.opacity = "0.5";
    });

    setTimeout(() => {
      clone.remove();
    }, 1000);
  };

  const handleIncrease = (id: string) => {
    const item = cart.find((item) => item.id === id);
    if (item) updateQuantity(id, item.quantity + 1);
  };

  const handleDecrease = (id: string) => {
    const item = cart.find((item) => item.id === id);
    if (item) {
      item.quantity > 1
        ? updateQuantity(id, item.quantity - 1)
        : removeFromCart(id);
    }
  };

  return (
    <div className="min-h-screen bg-white p-8">
      <h1 className="text-4xl font-extrabold text-orange-800 text-center mb-12">
        🍄 Oyster Mushrooms
      </h1>
      <div className="grid gap-10 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 justify-items-center">
        {products.map((product) => {
          const inCart = cart.find((item) => item.id === product.id);
          const imgRef = useRef<HTMLImageElement>(null);

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl shadow-xl p-6 text-left w-full max-w-sm border border-gray-200"
            >
              <img
                ref={imgRef}
                src={product.image}
                alt={product.name}
                className="w-full h-60 object-cover rounded-lg mb-4"
              />
              <h2 className="text-3xl font-bold text-orange-700 mb-2">
                {product.name}
              </h2>
              <p className="text-black text-lg mb-3">{product.description}</p>
              <p className="text-2xl font-bold text-black mb-1">
                Rs. {product.price.toFixed(2)}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                <span className="underline">Shipping</span> calculated at
                checkout.
              </p>

              {!inCart ? (
                <button
                  onClick={() => {
                    if (!product.inStock) {
                      alert("This product is currently out of stock.");
                      return;
                    }
                    //@ts-ignore
                    handleAddToCart(product, imgRef);
                  }}
                  className={`w-full ${
                    product.inStock
                      ? "bg-orange-700 hover:bg-orange-800"
                      : "bg-gray-400 cursor-not-allowed"
                  } text-white py-3 rounded-lg font-semibold transition`}
                >
                  {product.inStock ? "Buy Now" : "Add to Cart (Out of Stock)"}
                </button>
              ) : (
                <div className="flex items-center justify-center gap-4 mt-4">
                  <button
                    onClick={() => handleDecrease(product.id)}
                    className="bg-red-400 hover:bg-red-500 text-white px-3 py-1 rounded-full text-lg"
                  >
                    –
                  </button>
                  <span className="text-lg font-medium text-gray-800">
                    {inCart.quantity}
                  </span>
                  <button
                    onClick={() => handleIncrease(product.id)}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-full text-lg"
                  >
                    +
                  </button>
                </div>
              )}

              <div className="mt-4 text-sm text-orange-700 font-medium cursor-pointer hover:underline">
                View full details →
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Dashboard;
