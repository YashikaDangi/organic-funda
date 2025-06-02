"use client";

import { useAuth } from "@/context/AuthContext";
import { Product, products } from "@/lib/products";
import React, { useState, useEffect, useRef } from "react";
import { FiShoppingCart, FiInfo, FiStar, FiFilter, FiSearch } from "react-icons/fi";
import { GiWeightScale, GiMushroomGills } from "react-icons/gi";
import { TbTruckDelivery, TbLeaf } from "react-icons/tb";
import { MdOutlineLocalOffer, MdOutlineHealthAndSafety } from "react-icons/md";
import { useDispatch, useSelector } from "react-redux";
import { addToCart, removeFromCart } from "@/redux/slices/cartSlice";
import { RootState } from "@/redux/store";
import Image from "next/image";
import Link from "next/link";

// Import from our client-side framer-motion wrapper
import { 
  motion, 
  AnimatePresence, 
  useSafeInView,
  fadeIn,
  scaleUp,
  staggerContainer,
} from "./framer-motion";

// Create motion components
const MotionDiv = motion.div;
const MotionButton = motion.button;
const MotionH2 = motion.h2;
const MotionP = motion.p;

const Dashboard: React.FC = () => {
  // Redux cart state instead of AuthContext
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const dispatch = useDispatch();
  const { user, login } = useAuth();
  
  // State management
  const [productQuantities, setProductQuantities] = useState<Record<string, number>>({});
  const [isClient, setIsClient] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);
  const [sortOption, setSortOption] = useState<string>("featured");
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Refs for animations
  const shopRef = useRef<HTMLDivElement>(null);
  const isInView = useSafeInView(shopRef, { once: false, amount: 0.1 });

  // Enhanced categories with icons
  const categories = [
    { id: "all", name: "All Mushrooms", icon: <GiMushroomGills /> },
    // { id: "oyster", name: "Oyster", icon: <TbLeaf /> },
    // { id: "medicinal", name: "Medicinal", icon: <MdOutlineHealthAndSafety /> },
    // { id: "gourmet", name: "Gourmet", icon: <FiStar /> },
  ];

  // Filter options
  // const filterOptions = [
  //   { id: "organic", name: "Organic Certified" },
  //   { id: "bestseller", name: "Bestsellers" },
  //   { id: "sale", name: "On Sale" },
  //   { id: "instock", name: "In Stock" },
  // ];

  // Sort options
  // const sortOptions = [
  //   { id: "featured", name: "Featured" },
  //   { id: "price-low", name: "Price: Low to High" },
  //   { id: "price-high", name: "Price: High to Low" },
  //   { id: "newest", name: "Newest Arrivals" },
  // ];

  // Client-side rendering effect
  useEffect(() => {
    setIsClient(true);
    if (cartItems && cartItems.length > 0) {
      const quantities: Record<string, number> = {};
      cartItems.forEach((item) => {
        quantities[item.id] = item.quantity;
      });
      setProductQuantities(quantities);
    }
  }, [cartItems]);

  const handleAddToCart = (product: Product) => {
    if (!user) {
      alert("Please login to add items to your cart!");
      login();
      return;
    }

    dispatch({
      type: 'cart/addItem',
      payload: { ...product, quantity: 1 }
    });
    setProductQuantities((prev) => ({ ...prev, [product.id]: 1 }));
  };

  const handleIncreaseQuantity = (productId: string) => {
    const newQuantity = (productQuantities[productId] || 0) + 1;
    dispatch({
      type: 'cart/updateQuantity',
      payload: { id: productId, quantity: newQuantity }
    });
    setProductQuantities((prev) => ({ ...prev, [productId]: newQuantity }));
  };

  const handleDecreaseQuantity = (productId: string) => {
    const currentQuantity = productQuantities[productId] || 0;
    if (currentQuantity <= 1) {
      dispatch({
        type: 'cart/removeItem',
        payload: productId
      });
      setProductQuantities((prev) => {
        const updated = { ...prev };
        delete updated[productId];
        return updated;
      });
    } else {
      const newQuantity = currentQuantity - 1;
      dispatch({
        type: 'cart/updateQuantity',
        payload: { id: productId, quantity: newQuantity }
      });
      setProductQuantities((prev) => ({ ...prev, [productId]: newQuantity }));
    }
  };

  const isProductInCart = (productId: string) => productId in productQuantities;
  
  const filteredProducts = selectedCategory === "all" 
    ? products 
    : products.filter(product => product.category === selectedCategory);

  return (
    <section 
      id="shop" 
      ref={shopRef}
      className="py-16 md:py-24 bg-gradient-to-b from-background to-primary/5 relative overflow-hidden"
    >
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent z-10"></div>
      <div className="absolute -top-24 -left-24 w-64 h-64 rounded-full bg-primary/10 blur-3xl"></div>
      <div className="absolute -bottom-32 -right-32 w-80 h-80 rounded-full bg-secondary/10 blur-3xl"></div>
      
      <div className="container relative z-20">
        {/* Section Header */}
        <MotionDiv 
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="text-center mb-16 max-w-4xl mx-auto px-4"
        >
         
          
          <MotionH2 
            variants={fadeIn} 
            custom={1}
            className="text-4xl md:text-5xl font-heading font-bold text-primary-dark mb-6 leading-tight"
          >
            Discover Our <span className="text-primary">Organic Mushrooms</span>
          </MotionH2>
          
          <MotionP 
            variants={fadeIn} 
            custom={2}
            className="text-lg text-foreground/80 mb-10 max-w-3xl mx-auto"
          >
            Handpicked and organically grown with care to ensure exceptional quality, flavor, and nutritional benefits for your health and culinary adventures.
          </MotionP>
          
          {/* Search and Filter Bar */}
          {/* <MotionDiv 
            variants={fadeIn} 
            custom={3}
            className="flex flex-col md:flex-row gap-4 items-center justify-center mb-12"
          >
            <div className="relative w-full md:w-auto md:flex-1 max-w-md">
              <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-primary/60" />
              <input
                type="text"
                placeholder="Search mushrooms..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-primary/20 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all bg-white/80 backdrop-blur-sm"
              />
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-3 rounded-full bg-white shadow-sm border border-primary/20 hover:border-primary/40 transition-all"
              >
                <FiFilter className={showFilters ? "text-primary" : "text-primary/60"} />
                <span>Filters</span>
                <span className="bg-primary/10 text-primary text-xs px-2 py-0.5 rounded-full">
                  {activeFilters.length}
                </span>
              </button>
              
              <select
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                className="px-4 py-3 rounded-full bg-white shadow-sm border border-primary/20 hover:border-primary/40 transition-all appearance-none pr-10 cursor-pointer"
                style={{ backgroundImage: "url('data:image/svg+xml;charset=US-ASCII,<svg width=\"20\" height=\"20\" viewBox=\"0 0 20 20\" fill=\"none\" xmlns=\"http://www.w3.org/2000/svg\"><path d=\"M5 7.5L10 12.5L15 7.5\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/></svg>')", backgroundRepeat: "no-repeat", backgroundPosition: "right 1rem center" }}
              >
                {sortOptions.map(option => (
                  <option key={option.id} value={option.id}>{option.name}</option>
                ))}
              </select>
            </div>
          </MotionDiv> */}
          
          {/* Filter Options Panel */}
          {/* <AnimatePresence>
            {showFilters && (
              <MotionDiv 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mb-8 overflow-hidden"
              >
                <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-primary/10">
                  <div className="flex flex-wrap gap-3 justify-center">
                    {filterOptions.map(filter => (
                      <button
                        key={filter.id}
                        onClick={() => {
                          if (activeFilters.includes(filter.id)) {
                            setActiveFilters(activeFilters.filter(f => f !== filter.id));
                          } else {
                            setActiveFilters([...activeFilters, filter.id]);
                          }
                        }}
                        className={`px-4 py-2 rounded-full text-sm transition-all ${activeFilters.includes(filter.id) 
                          ? 'bg-primary text-white' 
                          : 'bg-primary/10 text-primary-dark hover:bg-primary/20'}`}
                      >
                        {filter.name}
                      </button>
                    ))}
                  </div>
                </div>
              </MotionDiv>
            )}
          </AnimatePresence> */}
          
          {/* Category Filters */}
          {/* <MotionDiv 
            variants={fadeIn} 
            custom={4}
            className="flex flex-wrap justify-center gap-3 mb-2"
          >
            {categories.map((category, index) => (
              <MotionButton
                key={category.id}
                variants={scaleUp}
                custom={index}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all ${selectedCategory === category.id 
                  ? 'bg-primary text-white shadow-md' 
                  : 'bg-white/80 backdrop-blur-sm text-primary-dark hover:bg-primary/10 border border-primary/20'}`}
              >
                <span className={selectedCategory === category.id ? 'text-white' : 'text-primary'}>
                  {category.icon}
                </span>
                <span>{category.name}</span>
              </MotionButton>
            ))}
          </MotionDiv> */}
        </MotionDiv>

        {/* Product Grid */}
        <MotionDiv 
          initial="hidden"
          animate="visible"
          variants={staggerContainer}
          className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-16"
        >
          {filteredProducts
            .filter(product => searchQuery ? 
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
              product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.category?.toLowerCase().includes(searchQuery.toLowerCase())
              : true)
            .filter(product => {
              if (activeFilters.length === 0) return true;
              if (activeFilters.includes('instock') && !product.inStock) return false;
              if (activeFilters.includes('sale') && product.originalPrice <= product.price) return false;
              if (activeFilters.includes('organic') && !product.tags?.includes('organic')) return false;
              if (activeFilters.includes('bestseller') && !product.tags?.includes('bestseller')) return false;
              return true;
            })
            .sort((a, b) => {
              switch(sortOption) {
                case 'price-low': return a.price - b.price;
                case 'price-high': return b.price - a.price;
                case 'newest': return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
                default: return 0; // featured - use default order
              }
            })
            .map((product, index) => (
            <MotionDiv
              key={product.id}
              variants={fadeIn}
              custom={index % 4}
              whileHover={{ y: -5 }}
              onMouseEnter={() => setHoveredProduct(product.id)}
              onMouseLeave={() => setHoveredProduct(null)}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden flex flex-col h-full border border-primary/5 relative group"
            >
              {/* Status Badges */}
              <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
                {product.originalPrice > product.price && (
                  <div className="bg-secondary text-white text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                    <MdOutlineLocalOffer className="text-white" />
                    <span>
                      {Math.round(
                        ((product.originalPrice - product.price) / product.originalPrice) * 100
                      )}% OFF
                    </span>
                  </div>
                )}
                
                {product.tags?.includes('bestseller') && (
                  <div className="bg-accent text-primary-dark text-xs font-bold px-2.5 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                    <FiStar className="text-primary-dark" />
                    <span>Bestseller</span>
                  </div>
                )}
                
                {!product.inStock && (
                  <div className="bg-foreground/70 text-white text-xs font-bold px-2.5 py-1.5 rounded-full shadow-md">
                    Out of Stock
                  </div>
                )}
              </div>
              
              {/* Image Container */}
              <div className="relative overflow-hidden aspect-square">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                ) : (
                  <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                    <GiMushroomGills className="text-5xl text-primary/30" />
                  </div>
                )}
                
                {/* Quick Info Overlay */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-t from-primary-dark/90 via-primary-dark/60 to-transparent flex flex-col justify-end p-5 transition-all duration-300 ${hoveredProduct === product.id ? 'opacity-100' : 'opacity-0'}`}
                >
                  <div className="text-white space-y-3">
                    <h4 className="font-bold text-lg">{product.name}</h4>
                    
                    <div className="flex items-center gap-2">
                      <GiWeightScale className="text-accent" />
                      <span className="text-sm">Available in 250g, 500g, 1kg</span>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <TbTruckDelivery className="text-accent" />
                      <span className="text-sm">Free delivery over ₹500</span>
                    </div>
                    
                    {product.benefits && (
                      <div className="pt-2">
                        <h5 className="text-sm font-bold mb-1 text-accent">Health Benefits:</h5>
                        <p className="text-xs text-white/90">{product.benefits}</p>
                      </div>
                    )}
                    
                    <Link 
                      href={`/product/${product.id}`}
                      className="inline-block mt-2 text-sm text-accent hover:text-white transition-colors"
                    >
                      View Details →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Product Info */}
              <div className="p-5 flex-grow flex flex-col">
                <div className="mb-2 flex justify-between items-center">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-full font-medium">
                    {product.category || 'Mushroom'}
                  </span>
                  
                  {product.tags?.includes('organic') && (
                    <span className="text-xs bg-accent/10 text-primary-dark px-2 py-1 rounded-full font-medium flex items-center gap-1">
                      <TbLeaf className="text-accent" />
                      Organic
                    </span>
                  )}
                </div>
                
                <h3 className="text-lg font-bold text-primary-dark mb-2">{product.name}</h3>
                
                <p className="text-sm text-foreground/70 mb-4 line-clamp-2">
                  {product.description || 'Fresh organic mushrooms grown with care and delivered to your doorstep.'}
                </p>
                
                <div className="flex items-center mt-auto mb-4">
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
                {isClient && isProductInCart(product.id) ? (
                  <div className="flex items-center justify-between border border-primary/20 rounded-full overflow-hidden bg-white shadow-sm">
                    <MotionButton
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDecreaseQuantity(product.id)}
                      className="py-2 px-5 bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                    >
                      -
                    </MotionButton>
                    <span className="font-medium text-primary-dark">
                      {productQuantities[product.id]}
                    </span>
                    <MotionButton
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleIncreaseQuantity(product.id)}
                      className="py-2 px-5 bg-primary text-white font-medium hover:bg-primary-dark transition-colors"
                    >
                      +
                    </MotionButton>
                  </div>
                ) : (
                  <MotionButton
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      if (!product.inStock) {
                        alert("This product is currently out of stock.");
                        return;
                      }
                      handleAddToCart(product);
                    }}
                    className={`w-full py-3 rounded-full font-medium text-white transition-all flex items-center justify-center gap-2 shadow-sm ${product.inStock
                      ? "bg-primary hover:bg-primary-dark"
                      : "bg-gray-400 cursor-not-allowed"
                    }`}
                    disabled={!product.inStock}
                  >
                    <FiShoppingCart />
                    {product.inStock ? "Add to Cart" : "Out of Stock"}
                  </MotionButton>
                )}
              </div>
            </MotionDiv>
          ))}
        </MotionDiv>
        
        {/* Features Banner */}
        {/* <MotionDiv 
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={staggerContainer}
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
        >
          <MotionDiv 
            variants={fadeIn}
            custom={0}
            className="bg-white rounded-2xl p-8 shadow-sm border border-primary/5 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary text-2xl">
              <TbLeaf className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-primary-dark mb-3">100% Organic</h3>
            <p className="text-foreground/70">Our mushrooms are grown using organic substrates without any chemicals or pesticides, ensuring you get the purest flavor and nutrition.</p>
          </MotionDiv>
          
          <MotionDiv 
            variants={fadeIn}
            custom={1}
            className="bg-white rounded-2xl p-8 shadow-sm border border-primary/5 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary text-2xl">
              <TbTruckDelivery className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-primary-dark mb-3">Fast Delivery</h3>
            <p className="text-foreground/70">We ensure quick delivery to maintain the freshness and quality of our products, with free shipping on orders over ₹500.</p>
          </MotionDiv>
          
          <MotionDiv 
            variants={fadeIn}
            custom={2}
            className="bg-white rounded-2xl p-8 shadow-sm border border-primary/5 hover:shadow-md transition-all duration-300 flex flex-col items-center text-center"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-5 text-primary text-2xl">
              <MdOutlineHealthAndSafety className="text-3xl" />
            </div>
            <h3 className="text-xl font-bold text-primary-dark mb-3">Health Benefits</h3>
            <p className="text-foreground/70">Our mushrooms are packed with nutrients, antioxidants, and immune-boosting compounds for your overall wellbeing.</p>
          </MotionDiv>
        </MotionDiv> */}
        
        {/* Pagination */}
        {/* <MotionDiv 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex justify-center items-center gap-2 mb-16"
        >
          {[1, 2, 3, 4, 5].map((page) => (
            <button 
              key={page}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${page === 1 
                ? 'bg-primary text-white shadow-md' 
                : 'bg-white border border-primary/20 text-primary-dark hover:bg-primary/10'}`}
            >
              {page}
            </button>
          ))}
          <button className="w-10 h-10 rounded-full flex items-center justify-center bg-white border border-primary/20 text-primary-dark hover:bg-primary/10 transition-all">
            <span>→</span>
          </button>
        </MotionDiv> */}
      </div>
    </section>
  );
};

export default Dashboard;
