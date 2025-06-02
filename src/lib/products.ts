export type Product = {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  description?: string;
  inStock?: boolean;
  rating?: number;
  discount?: number;
  category?: string;
  tags?: string[];
  benefits?: string;
  createdAt?: string;
};

export const products: Product[] = [
  {
    id: "1",
    name: "White Oyster Mushroom",
    price: 1.0,
    originalPrice: 120.0,
    image: "/white-oyester.jpg",
    description:
      "Dried White Oyster Mushrooms – 100% pure, grown naturally with high biocompounds.",
    inStock: true,
    rating: 4.9,
    discount: 20,
    category: "Dried Mushroom",
  },
  {
    id: "2",
    name: "Pink Oyster Mushroom",
    price: 1.0,
    originalPrice: 120.0,
    image: "/pink-oyester.jpg",
    description:
      "Exotic Pink Oysters – flavor-packed and full of nutrients, harvested fresh.",
    inStock: false,
    rating: 4.8,
    discount: 20,
    category: "Dried Mushroom",
  },
  {
    id: "3",
    name: "Grey Oyster Mushroom",
    price: 1.0,
    originalPrice: 120.0,
    image: "/mushroom2.jpg",
    description:
      "Delicate Grey Oysters – organically cultivated, sun-dried with care.",
    inStock: true,
    rating: 4.9,
    discount: 20,
    category: "Dried Mushroom",
  },
];