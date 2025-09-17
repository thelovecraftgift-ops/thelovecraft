import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Eye, Sparkles, MousePointer, ArrowRight, Gem } from "lucide-react";
import { useWishlist } from "./WishlistContext";
import { useCart } from "./CartContext";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";
import axios, { AxiosResponse } from "axios";
import { motion, AnimatePresence } from "framer-motion";

const API_URL: string = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface ApiProduct {
  _id: string;
  Product_name: string;
  Product_price: number;
  Product_image: string[];
  Product_rating?: number;
  isNew?: boolean;
  category?: string;
  description?: string;
  Product_category?: any;
  Product_discription?: string;
  Product_available?: boolean;
}

interface CartProduct {
  id: number;
  _id: string;
  name: string;
  price: string;
  originalPrice: string;
  image: string;
  rating: number;
  isNew: boolean;
  quantity?: number;
  Product_name?: string;
  Product_price?: number;
  Product_image?: string[];
}

interface ProductsApiResponse {
  products: ApiProduct[];
  totalProducts?: number;
  hasMore?: boolean;
}

interface FeaturedProductsProps {
  className?: string;
  initialLimit?: number;
  loadMoreCount?: number;
}

// Fixed: Product_image array access [5][7]
const transformProductForCart = (apiProduct: ApiProduct): CartProduct => {
  const originalPrice = Math.round(apiProduct.Product_price * 1.2);
  return {
    id: parseInt(apiProduct._id.slice(-8), 16),
    _id: apiProduct._id,
    name: apiProduct.Product_name,
    price: `₹${apiProduct.Product_price}`,
    originalPrice: `₹${originalPrice}`,
    image: apiProduct.Product_image?.[0] || '', // Fixed: Safe array access
    rating: apiProduct.Product_rating || 4.5,
    isNew: apiProduct.isNew || false,
    quantity: 1,
    Product_name: apiProduct.Product_name,
    Product_price: apiProduct.Product_price,
    Product_image: apiProduct.Product_image
  };
};

const FeaturedProducts: React.FC<FeaturedProductsProps> = ({ 
  className = "",
  initialLimit = 10,
  loadMoreCount = 10
}) => {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [totalProducts, setTotalProducts] = useState<number>(0);
  const [currentLimit, setCurrentLimit] = useState<number>(initialLimit);

  const { wishlist, toggleWishlist, isInWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fixed: Static color classes for Tailwind [21][22]
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

  const fetchProducts = async (limit: number, skip: number = 0, append: boolean = false): Promise<void> => {
    try {
      if (append) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      const res: AxiosResponse<ProductsApiResponse> = await axios.get(
        `${API_URL}/api/getproducts?limit=${limit}&skip=${skip}`
      );
      
      const newProducts = res.data.products || [];
      
      if (append) {
        setProducts(prev => {
          const existingIds = new Set(prev.map(p => p._id));
          const uniqueNewProducts = newProducts.filter(product => !existingIds.has(product._id));
          
          const updatedProducts = uniqueNewProducts.length > 0 ? [...prev, ...uniqueNewProducts] : prev;
          
          if (res.data.totalProducts !== undefined) {
            const newTotalProducts = res.data.totalProducts;
            setTotalProducts(newTotalProducts);
            setHasMore(updatedProducts.length < newTotalProducts);
          } else {
            const hasMoreProducts = newProducts.length === limit;
            setHasMore(hasMoreProducts);
            setTotalProducts(hasMoreProducts ? updatedProducts.length + 1 : updatedProducts.length);
          }
          
          return updatedProducts;
        });
      } else {
        setProducts(newProducts);
        
        if (res.data.totalProducts !== undefined) {
          const apiTotalProducts = res.data.totalProducts;
          setTotalProducts(apiTotalProducts);
          setHasMore(newProducts.length < apiTotalProducts);
        } else {
          const hasMoreProducts = newProducts.length === limit;
          setHasMore(hasMoreProducts);
          setTotalProducts(hasMoreProducts ? newProducts.length + 1 : newProducts.length);
        }
      }
      
    } catch (err) {
      console.error("Error loading products:", err);
      toast({
        title: "Failed to load collections",
        description: "Please refresh and try again",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    setCurrentLimit(initialLimit);
    fetchProducts(initialLimit, 0, false);
  }, [initialLimit]);

  const handleLoadMore = (): void => {
    fetchProducts(loadMoreCount, products.length, true);
  };

  const calculateDiscount = (price: number, originalPrice: number): number => {
    return Math.round(((originalPrice - price) / originalPrice) * 100);
  };

  const handleWishlistToggle = (e: React.MouseEvent, product: ApiProduct): void => {
    e.stopPropagation();
    if (user) {
      const wasInWishlist = isInWishlist(product._id);
      
      const wishlistProduct = {
        _id: product._id,
        Product_name: product.Product_name,
        Product_price: product.Product_price,
        Product_image: product.Product_image,
        Product_rating: product.Product_rating,
        isNew: product.isNew,
        category: product.Product_category?.category || product.category,
        description: product.Product_discription || product.description
      };
      
      toggleWishlist(wishlistProduct);
      
      toast({ 
        title: wasInWishlist ? "Removed from wishlist" : "Added to wishlist",
        description: wasInWishlist 
          ? `${product.Product_name} removed from your wishlist` 
          : `${product.Product_name} added to your wishlist`,
        duration: 2000 
      });
    } else {
      navigate("/login");
    }
  };

  const handleAddToCart = (product: ApiProduct): void => {
    if (user) {
      const cartProduct = transformProductForCart(product);
      
      addToCart(cartProduct);
      toast({ 
        title: "Added to cart", 
        description: `${product.Product_name} has been added to your cart`,
        duration: 3000 
      });
    } else {
      navigate("/login");
    }
  };

  const handleProductClick = (productId: string): void => {
    navigate(`/product/${productId}`);
  };

  const remainingProducts = Math.max(0, totalProducts - products.length);
  const productsToLoad = hasMore ? (remainingProducts > 0 ? Math.min(loadMoreCount, remainingProducts) : loadMoreCount) : 0;

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

  // Loading State
  if (loading) {
    return (
      <section className={`py-20 bg-gradient-to-br from-pink-50 via-white to-rose-50 relative overflow-hidden ${className}`}>
        <div className="absolute inset-0">
          <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-red-100 to-rose-100 rounded-full blur-3xl opacity-15" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 px-6">
          <div className="mb-16">
            <div className="h-6 w-32 bg-rose-200 rounded-lg mb-4 animate-pulse" />
            <div className="h-12 w-64 bg-rose-200 rounded-xl mb-2 animate-pulse" />
            <div className="h-4 w-48 bg-pink-200 rounded-lg animate-pulse" />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6">
            {Array.from({ length: 10 }).map((_, i) => (
              <LoadingSkeleton key={i} index={i} />
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Empty State
  if (!products.length) {
    return (
      <section className={`py-20 bg-gradient-to-br from-pink-50 via-white to-rose-50 ${className}`}>
        <div className="max-w-2xl mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="bg-white backdrop-blur-sm border-rose-200 shadow-lg rounded-xl text-center p-12"
          >
            <Sparkles className="mx-auto h-12 w-12 text-rose-300 mb-4" />
            <h3 className="text-lg font-bold text-rose-800 mb-2">No products found</h3>
            <p className="text-rose-600 text-sm">Please check back later for new arrivals</p>
          </motion.div>
        </div>
      </section>
    );
  }

  return (
    <section className={`py-20 bg-gradient-to-br from-pink-50 via-white to-rose-50 relative overflow-hidden ${className}`}>
      {/* Pink Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-rose-100 to-pink-100 rounded-full blur-3xl opacity-20" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-red-100 to-rose-100 rounded-full blur-3xl opacity-15" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-6">
        {/* Header */}
        <motion.div
          className="mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {/* Badge */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <div className="bg-white text-rose-700 border-rose-200 px-3 py-1 text-xs font-medium rounded-lg shadow-sm mb-4 inline-block">
                  Featured
                </div>
              </motion.div>

              {/* Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-4xl sm:text-5xl md:text-6xl font-bold text-gray-900 mb-3 leading-tight"
              >
                Our <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 bg-clip-text text-transparent">Products</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-rose-600 text-lg leading-relaxed"
              >
                Beautiful pieces for every moment
              </motion.p>
            </div>

            {/* Scroll Hint - Desktop */}
            <motion.div
              className="hidden md:flex items-center space-x-3 text-rose-500 text-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
            >
              <MousePointer className="w-4 h-4" />
              <span>Explore our collection</span>
              <motion.div
                className="flex space-x-1"
                animate={{ x: [0, 4, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <div className="w-1 h-1 bg-rose-400 rounded-full" />
                <div className="w-1 h-1 bg-rose-400 rounded-full" />
                <div className="w-1 h-1 bg-rose-400 rounded-full" />
              </motion.div>
            </motion.div>
          </div>
        </motion.div>

        {/* Products Grid */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 sm:gap-6 mb-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 1 }}
        >
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => {
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
                    {/* Card Design */}
                    <div className="relative bg-white rounded-2xl shadow-lg hover:shadow-xl border border-rose-200 overflow-hidden transition-all duration-500">
                      
                      {/* Image Section - FIXED: Safe array access */}
                      <div className="relative aspect-square overflow-hidden">
                        <motion.img
                          src={product.Product_image?.[0] || "/fallback.jpg"} // Fixed: Safe array access
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
                            {product.Product_category?.category || product.category || 'Premium'}
                          </div>
                        </div>

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

        {/* Mobile Hint */}
        <motion.div
          className="md:hidden text-center mt-6 mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 text-rose-500 text-sm bg-white/50 px-4 py-2 rounded-full border border-rose-200/50">
            <Sparkles className="w-4 h-4" />
            <span>Tap any product to explore</span>
          </div>
        </motion.div>

        {/* Load More Button */}
        {hasMore && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
          >
            <Button
              variant="outline"
              size="lg"
              className="rounded-2xl px-8 py-4 border-2 border-rose-300 bg-white/90 backdrop-blur-xl text-rose-700 font-bold hover:bg-gradient-to-r hover:from-pink-600 hover:via-rose-600 hover:to-red-700 hover:text-white hover:border-transparent hover:shadow-2xl hover:shadow-rose-200/60 transition-all duration-500 disabled:opacity-50"
              onClick={handleLoadMore}
              disabled={loadingMore}
            >
              {loadingMore ? (
                <div className="flex items-center space-x-2">
                  <motion.div
                    className="w-4 h-4 border-2 border-rose-300 border-t-rose-600 rounded-full"
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  />
                  <span>Loading more...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Load {productsToLoad} more items</span>
                </div>
              )}
            </Button>
          </motion.div>
        )}

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-rose-500 text-sm">
            Looking for something specific? <span className="text-rose-700 font-medium cursor-pointer hover:underline">Browse all categories</span>
          </p>
        </motion.div>

        {/* Completion Message */}
        {!hasMore && products.length > initialLimit && (
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 bg-white backdrop-blur-sm text-rose-700 px-6 py-3 rounded-2xl font-medium border border-rose-200 shadow-lg">
              <span>You've explored our entire collection!</span>
            </div>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedProducts;
