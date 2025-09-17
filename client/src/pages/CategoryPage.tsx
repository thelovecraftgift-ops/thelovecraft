import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "@/utils/axiosConfig";
import { Sparkles, Search, SortAsc, Heart, ShoppingCart, Eye, Crown, Gem, Star, Gift, ArrowRight, Filter, MousePointer } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import AnnouncementBar from "@/components/AnnouncementBar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { useAuth } from "@/components/AuthContext";
import { toast } from "@/hooks/use-toast";

// ✅ UPDATED Interface with all required fields
interface Product {
  _id: string;
  Product_name: string;
  Product_price: number;
  Product_discription: string;
  Product_category: string;
  Product_image: string[];
  isNew?: boolean;
  Product_available?: boolean;
  Product_rating?: number;
}

const CategoryPage = () => {
  const { categoryName } = useParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high'>('name');
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const navigate = useNavigate();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Fixed: Static color classes for Tailwind
  const getColorClass = (index: number) => {
    const colorClasses = [
      {
        gradient: "from-rose-500 to-rose-600",
        bg: "bg-rose-500",
        border: "border-rose-200"
      },
      {
        gradient: "from-pink-500 to-pink-600", 
        bg: "bg-pink-500",
        border: "border-pink-200"
      },
      {
        gradient: "from-red-500 to-red-600",
        bg: "bg-red-500", 
        border: "border-red-200"
      },
      {
        gradient: "from-fuchsia-500 to-fuchsia-600",
        bg: "bg-fuchsia-500",
        border: "border-fuchsia-200"
      },
    ];
    return colorClasses[index % colorClasses.length];
  };

  useEffect(() => {
    const fetchProducts = async () => {
      if (!categoryName) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        console.log('🔍 Fetching products for category:', categoryName);
        
        const res = await axiosInstance.get(
          `/api/getproductsbycategory?category=${categoryName}`
        );
        
        console.log('📦 Category products response:', res.data);
        
        const productsData = res.data.product || res.data.products || [];
        setProducts(productsData);
        
        if (productsData.length === 0) {
          console.warn('⚠️ No products found for category:', categoryName);
        }
        
      } catch (error: any) {
        console.error("❌ Failed to load products for category:", categoryName, error);
        
        const errorMessage = error.response?.status === 404 
          ? `No treasures found in ${categoryName} collection`
          : `Failed to load ${categoryName} treasures. Please try again.`;
          
        toast({
          title: "✨ Error loading treasures",
          description: errorMessage,
          duration: 3000,
        });
        
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryName, toast]);

  // Sort products based on selected criteria
  const sortedProducts = [...products].sort((a, b) => {
    switch (sortBy) {
      case 'price-low':
        return a.Product_price - b.Product_price;
      case 'price-high':
        return b.Product_price - a.Product_price;
      case 'name':
      default:
        return a.Product_name.localeCompare(b.Product_name);
    }
  });

  // Calculate discount percentage
  const calculateDiscount = (price: number, originalPrice: number): number => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  // Handle wishlist toggle
  const handleWishlistToggle = (e: React.MouseEvent, product: Product): void => {
    e.stopPropagation();
    if (user) {
      const wishlistProduct = {
        _id: product._id,
        Product_name: product.Product_name,
        Product_price: product.Product_price,
        Product_image: product.Product_image,
        isNew: product.isNew,
        category: product.Product_category,
        description: product.Product_discription
      };
      
      const wasInWishlist = isInWishlist(product._id);
      toggleWishlist(wishlistProduct);
      
      toast({ 
        title: wasInWishlist ? "💔 Removed from wishlist" : "💖 Added to wishlist",
        description: wasInWishlist 
          ? `${product.Product_name} removed from your treasure collection` 
          : `${product.Product_name} added to your treasure collection`,
        duration: 2000 
      });
    } else {
      navigate("/login");
    }
  };

  // ✅ UPDATED handleAddToCart with all required fields
  const handleAddToCart = (product: Product): void => {
    if (user) {
      try {
        const cartProduct = {
          id: parseInt(product._id.slice(-8), 16),
          _id: product._id,
          name: product.Product_name,
          price: `₹${product.Product_price}`,
          originalPrice: `₹${Math.round(product.Product_price * 1.2)}`,
          image: product.Product_image[0] || '',
          rating: product.Product_rating || 4.5,
          isNew: product.isNew || false,
          quantity: 1,
          Product_name: product.Product_name,
          Product_price: product.Product_price,
          Product_image: product.Product_image,
          Product_available: product.Product_available
        };
        
        addToCart(cartProduct);
        toast({ 
          title: "✨ Added to cart", 
          description: `${product.Product_name} has been added to your treasure collection`,
          duration: 3000 
        });
      } catch (error) {
        console.error('❌ Error adding to cart:', error);
        toast({
          title: "💎 Error",
          description: "Failed to add treasure to cart. Please try again.",
          duration: 2000,
        });
      }
    } else {
      navigate("/login");
    }
  };

  // Handle product click
  const handleProductClick = (productId: string): void => {
    navigate(`/product/${productId}`);
  };

  // Fixed: Static classes for skeleton loading
  const LoadingSkeleton = ({ index }: { index: number }) => {
    return (
      <div className="flex-shrink-0 w-full">
        <div className="w-full h-full bg-gradient-to-br from-rose-100 to-pink-100 backdrop-blur-xl rounded-2xl p-3 sm:p-4 border border-rose-200">
          <div className="aspect-square bg-rose-200 rounded-xl mb-3 animate-pulse" />
          <div className="space-y-2">
            <div className="h-3 bg-rose-300 rounded animate-pulse" />
            <div className="h-4 bg-pink-300 rounded w-4/5 animate-pulse" />
            <div className="h-8 bg-rose-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <AnnouncementBar />
      <Header />
      
      {/* ✨ Enhanced Luxury Hero Section */}
      <div className="pt-20 sm:pt-24 pb-8 sm:pb-12 bg-gradient-to-br from-pink-100/40 via-white to-rose-100/40 relative overflow-hidden">
        {/* Elegant background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-pink-200/20 to-rose-200/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-gradient-to-br from-rose-200/15 to-red-200/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-pink-100/10 to-rose-100/5 rounded-full blur-2xl" />
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-5xl mx-auto">
            {/* Premium Badge */}
            <motion.div 
              className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-6 py-3 rounded-full text-sm font-bold mb-8 shadow-lg border border-rose-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <Crown className="w-4 h-4" />
              Handcrafted Collection
              <Sparkles className="w-4 h-4" />
            </motion.div>
            
            {/* Luxury Title */}
            <motion.h1 
              className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 mb-6 leading-tight capitalize"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">
                {categoryName}
              </span>
              <br />
              <span className="text-gray-800">Collection</span>
            </motion.h1>
            
            {/* Elegant Subtitle */}
            <motion.p 
              className="text-lg sm:text-xl md:text-2xl text-rose-600 mb-8 leading-relaxed font-medium max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Discover our exquisite range of <span className="font-bold text-rose-700">{categoryName}</span> treasures,
              <br />
              each piece crafted with love and precision ✨
            </motion.p>
            
            {/* Enhanced stats */}
            {!loading && products.length > 0 && (
              <motion.div 
                className="inline-flex items-center gap-6 bg-white/80 backdrop-blur-sm border-2 border-rose-200 rounded-full px-8 py-4 text-sm shadow-xl"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.6 }}
              >
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-rose-600" />
                  <span className="text-rose-700 font-bold">
                    {products.length} Treasures Found
                  </span>
                </div>
                <div className="w-2 h-2 bg-rose-400 rounded-full"></div>
                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4 text-yellow-600" />
                  <span className="text-gray-700 font-medium">Premium Quality</span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ✨ Enhanced Controls Section */}
      {!loading && products.length > 0 && (
        <div className="bg-gradient-to-r from-white via-pink-50/30 to-white backdrop-blur-md border-y-2 border-rose-200/50 sticky top-0 z-30 shadow-lg">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Product count with premium styling */}
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center border border-rose-200">
                  <Gem className="w-4 h-4 text-rose-600" />
                </div>
                <span className="text-sm font-bold text-gray-800">
                  {products.length} Premium Treasures
                </span>
              </div>

              {/* Enhanced sort dropdown */}
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center border border-rose-200">
                  <SortAsc className="w-4 h-4 text-rose-600" />
                </div>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-white border-2 border-rose-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-800 focus:outline-none focus:ring-2 focus:ring-rose-400 focus:border-rose-400 transition-all duration-300 shadow-lg hover:shadow-xl w-full sm:min-w-[180px]"
                >
                  <option value="name">Sort by Name</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ✨ Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <LoadingSkeleton key={index} index={index} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-16 sm:py-24">
            <div className="bg-white rounded-3xl p-12 max-w-lg mx-auto shadow-2xl border-2 border-rose-200">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-6 border-2 border-rose-200">
                <Search className="w-12 h-12 text-rose-600" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-black text-gray-900 mb-4">
                No Treasures Found
              </h3>
              <p className="text-base text-rose-600 mb-8 leading-relaxed">
                We couldn't find any treasures in the <span className="font-bold">{categoryName}</span> collection at the moment.
                <br />
                Check back soon for new arrivals! ✨
              </p>
              <Button
                className="rounded-full px-8 py-4 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-white font-bold shadow-xl hover:shadow-2xl transition-all duration-300"
                onClick={() => window.history.back()}
              >
                <ArrowRight className="w-4 h-4 mr-2 rotate-180" />
                Explore Other Collections
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* ✨ Enhanced Products Grid - Using FeaturedProducts Card Design */}
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              <AnimatePresence mode="popLayout">
                {sortedProducts.map((product, index) => {
                  const colors = getColorClass(index);
                  const originalPrice = Math.round(product.Product_price * 1.2);
                  const discount = calculateDiscount(product.Product_price, originalPrice);
                  const inWishlist = isInWishlist(product._id);
                  
                  return (
                    <motion.div
                      key={product._id}
                      layout
                      initial={{ opacity: 0, y: 40, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -40, scale: 0.95 }}
                      transition={{ 
                        delay: index * 0.05, 
                        duration: 0.4, 
                        type: "spring", 
                        stiffness: 250,
                        damping: 20
                      }}
                      className="group/card relative"
                      onMouseEnter={() => setHoveredProduct(product._id)}
                      onMouseLeave={() => setHoveredProduct(null)}
                    >
                      <motion.button
                        onClick={() => handleProductClick(product._id)}
                        className="relative w-full focus:outline-none text-left"
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                      >
                        {/* Card Design - Matching FeaturedProducts */}
                        <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl border border-rose-200 overflow-hidden transition-all duration-500">
                          
                          {/* Image Section */}
                          <div className="relative aspect-square overflow-hidden">
                            <motion.img
                              src={product.Product_image?.[0] || "/fallback.jpg"}
                              alt={product.Product_name}
                              className="w-full h-full object-cover"
                              whileHover={{ scale: 1.05 }}
                              transition={{ duration: 0.6 }}
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = "/fallback.jpg";
                              }}
                            />
                            
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-rose-600/20 via-transparent to-transparent" />
                            
                            {/* Category Badge */}
                            <div className="absolute top-3 left-3">
                              <div className={`bg-gradient-to-r ${colors.gradient} text-white px-2 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm`}>
                                <Gem className="w-2 h-2 inline mr-1" />
                                Premium
                              </div>
                            </div>

                            {/* New Badge */}
                            {product.isNew && (
                              <div className="absolute top-3 right-3">
                                <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg backdrop-blur-sm">
                                  ✨ New
                                </div>
                              </div>
                            )}

                            {/* Hover Action */}
                            <motion.div
                              className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/card:opacity-100"
                              whileHover={{ scale: 1.1 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Eye className="w-4 h-4 text-rose-700" />
                            </motion.div>
                          </div>

                          {/* Content Section */}
                          <div className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <h3 className="text-sm sm:text-base font-bold text-gray-900 mb-2 line-clamp-1">
                                  {product.Product_name}
                                </h3>
                                
                                <p className="text-rose-500 text-xs sm:text-sm font-medium mb-3">
                                  Available now
                                </p>
                              </div>
                              
                              {/* Arrow */}
                              <motion.div
                                className="ml-2 text-rose-400 group-hover/card:text-rose-600"
                                whileHover={{ x: 2 }}
                                transition={{ duration: 0.3 }}
                              >
                                <ArrowRight className="w-4 h-4" />
                              </motion.div>
                            </div>

                            {/* Price Section */}
                            <div className="flex items-center gap-2 mb-3">
                              <span className="text-lg sm:text-xl font-bold text-gray-900">
                                ₹{product.Product_price.toLocaleString()}
                              </span>
                              {discount > 0 && (
                                <span className="text-xs text-rose-500 line-through">
                                  ₹{originalPrice.toLocaleString()}
                                </span>
                              )}
                              {discount > 0 && (
                                <span className="text-xs text-white bg-rose-500 px-1 py-0.5 rounded-full font-bold">
                                  {discount}% OFF
                                </span>
                              )}
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="flex-1 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white hover:from-pink-700 hover:via-rose-700 hover:to-red-800 rounded-xl py-2 text-xs font-medium shadow-lg hover:shadow-rose-300/50 transition-all duration-300"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddToCart(product);
                                }}
                              >
                                <ShoppingCart className="w-3 h-3 mr-1" />
                                Add
                              </Button>
                              
                              <Button
                                variant="outline"
                                size="sm"
                                className={`w-8 h-8 rounded-xl transition-all duration-300 ${
                                  inWishlist
                                    ? "bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white border-rose-400 shadow-lg"
                                    : "border-rose-200 text-rose-600 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 hover:text-rose-700 hover:border-rose-300"
                                }`}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleWishlistToggle(e, product);
                                }}
                              >
                                <Heart
                                  className="w-3 h-3"
                                  fill={inWishlist ? "currentColor" : "none"}
                                />
                              </Button>
                            </div>
                          </div>

                          {/* Bottom Color Accent */}
                          <div className={`h-1 bg-gradient-to-r ${colors.gradient}`} />
                        </div>
                      </motion.button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>

            {/* Enhanced Results Summary */}
            <motion.div 
              className="text-center mt-16 pt-8 border-t-2 border-rose-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.6 }}
            >
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-2xl p-8 border-2 border-rose-200 shadow-lg max-w-2xl mx-auto">
                <Crown className="w-8 h-8 text-rose-600 mx-auto mb-4" />
                <div className="inline-flex items-center gap-3 text-rose-700 text-lg font-bold">
                  <Sparkles className="w-5 h-5" />
                  Showing all {products.length} exquisite treasures in {categoryName}
                  <Gem className="w-5 h-5" />
                </div>
                <p className="text-rose-600 mt-2 text-sm">
                  Each piece handcrafted with love and precision ✨
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CategoryPage;
