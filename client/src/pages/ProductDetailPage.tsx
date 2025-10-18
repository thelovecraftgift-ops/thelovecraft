import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axiosInstance from "@/utils/axiosConfig";
import {
  Heart,
  ChevronRight,
  X,
  ZoomIn,
  Check,
  ShoppingCart,
  Crown,
  Star,
  Plus,
  Minus,
  Gem,
  Sparkles,
  Award,
  Shield
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useCart  } from "@/components/CartContext";
import { useWishlist } from "@/components/WishlistContext";
import { useAuth } from "@/components/AuthContext";
import { toast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

interface Product {
  _id: string;
  Product_name: string;
  Product_discription: string;
  Product_price: number;
  Product_image: string[];
  Product_category: {
    category: string;
    slug: string;
  };
  Product_available?: boolean;
}

const ProductDetailPage = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"description" | "specifications">("description");
  const [showImageModal, setShowImageModal] = useState(false);

  const { addToCart  } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { user } = useAuth();

  // Pink/Rose/Burgundy color scheme only
  const getColorClass = (index: number) => {
    const colors = ["rose", "pink", "red", "fuchsia"];
    return colors[index % colors.length];
  };

  // Transform for cart & wishlist
  const transformForCart = (prod: Product, qty = 1) => ({
    id: parseInt(prod._id.slice(-8), 16),
    _id: prod._id,
    name: prod.Product_name,
    Product_name: prod.Product_name,
    price: `₹${prod.Product_price}`,
    Product_price: prod.Product_price,
    originalPrice: `₹${Math.round(prod.Product_price * 1.3)}`,
    image: prod.Product_image[0],
    Product_image: prod.Product_image,
    isNew: false,
    quantity: qty,
    Product_available: prod.Product_available,
  });

  const transformForWishlist = (prod: Product) => ({
    _id: prod._id,
    Product_name: prod.Product_name,
    Product_price: prod.Product_price,
    Product_image: prod.Product_image,
    Product_available: prod.Product_available,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axiosInstance.get(`/api/getproductbyid?id=${productId?.trim()}`);
        if (res.data?.product) {
          setProduct(res.data.product);
          setSelectedImage(res.data.product.Product_image[0]);

          try {
            const relRes = await axiosInstance.get(
              `/api/getproducts?category=${res.data.product.Product_category.slug}&limit=6`
            );
            const relProducts = relRes.data.products?.filter(
              (item: Product) => item._id !== res.data.product._id
            ) || [];
            setRelatedProducts(relProducts);
          } catch {
            setRelatedProducts([]);
          }
        } else {
          setProduct(null);
        }
      } catch {
        setProduct(null);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [productId]);

  useEffect(() => {
    window.scrollTo({top:0, behavior:"smooth"});
  }, [productId]);

  if (loading) 
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="w-16 h-16 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 rounded-full flex items-center justify-center mx-auto mb-6">
            <Crown className="w-8 h-8 text-white animate-pulse" />
          </div>
          <p className="text-rose-600 font-medium">Loading exquisite piece...</p>
        </motion.div>
      </div>
    );

  if (!product) 
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-pink-50 via-white to-rose-50 p-6">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-black text-rose-800 mb-4">Treasure Not Found</h2>
          <p className="text-rose-600 mb-6">This beautiful piece seems to have wandered off!</p>
          <Button 
            onClick={() => navigate("/")} 
            className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-white px-8 py-3 rounded-2xl font-bold shadow-lg"
          >
            Discover More Treasures
          </Button>
        </motion.div>
      </div>
    );

  const discount = product ? Math.round(((product.Product_price * 1.3 - product.Product_price) / (product.Product_price * 1.3)) * 100) : 0;

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    if (user) {
      toggleWishlist(isInWishlist(product._id) ? null : transformForWishlist(product));
      toast({
        title: isInWishlist(product._id) ? "Removed from wishlist" : "Added to wishlist",
        description: product.Product_name,
        duration: 2000,
      });
    } else {
      navigate("/login");
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(transformForCart(product, quantity));
    toast({title: "Added to cart", description: `${quantity} x ${product.Product_name}`, duration:2000});
    navigate("/cart");
  };

  // Enhanced Related Card - No Fake Rating
  const RelatedCard: React.FC<{product: Product; index: number}> = ({product: p, index}) => {
    const color = getColorClass(index);

    return (
      <motion.div 
        className="group cursor-pointer"
        whileHover={{ y: -4 }}
        transition={{ duration: 0.3 }}
        onClick={() => navigate(`/product/${p._id}`)}
      >
        <Card className="overflow-hidden border-2 border-rose-200 hover:border-rose-400 hover:shadow-2xl hover:shadow-rose-200/50 transition-all duration-500 bg-white">
          {/* Image Section */}
          <div className="relative aspect-square overflow-hidden">
            <img 
              src={p.Product_image[0] || "/fallback.jpg"} 
              alt={p.Product_name} 
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            
            {/* Quick Add Button */}
            <Button
              size="sm"
              className="absolute bottom-4 right-4 bg-white/90 text-rose-700 hover:bg-white hover:text-rose-800 rounded-full px-4 py-2 font-bold shadow-lg opacity-0 group-hover:opacity-100 transition-all duration-300 border-2 border-rose-200"
              onClick={e => {
                e.stopPropagation();
                if(user) {
                  addToCart(transformForCart(p));
                  toast({title:"Added to cart",duration:1500});
                } else navigate("/login");
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          
          {/* Content Section - Removed Rating */}
          <div className="p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 group-hover:text-rose-700 transition-colors">
              {p.Product_name}
            </h3>
            <div className="flex items-center justify-between">
              <span className="text-xl font-black text-rose-600">₹{p.Product_price.toLocaleString()}</span>
              <div className="text-rose-400 text-sm font-medium">
                Premium Quality
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-pink-50 via-white to-rose-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Enhanced Breadcrumb */}
        <motion.nav 
          className="flex items-center text-sm text-rose-600 space-x-3 mb-8 p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-rose-200/50"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Link to="/" className="hover:text-rose-800 font-semibold flex items-center">
            <Crown className="w-4 h-4 mr-1" />
            Home
          </Link>
          <ChevronRight size={16} />
          <Link to={`/category/${product.Product_category.slug}`} className="hover:text-rose-800 font-semibold">
            {product.Product_category.category}
          </Link>
          <ChevronRight size={16} />
          <span className="text-rose-900 font-bold truncate">{product.Product_name}</span>
        </motion.nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Left: Enhanced Images Section */}
          <motion.div 
            className="space-y-6"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Main Image */}
            <div className="relative group">
              <div className="aspect-square rounded-3xl overflow-hidden border-4 border-rose-200 shadow-2xl">
                <img 
                  src={selectedImage || "/fallback.jpg"} 
                  alt={product.Product_name} 
                  className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-700" 
                  onClick={() => setShowImageModal(true)} 
                  onError={e => e.currentTarget.src="/fallback.jpg"} 
                />
                
                {/* Zoom Indicator */}
                <div className="absolute top-6 right-6 w-12 h-12 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <ZoomIn className="w-5 h-5 text-rose-700" />
                </div>
              </div>
              
              {/* Premium Badge */}
              <div className="absolute top-6 left-6 bg-gradient-to-r from-rose-600 to-pink-600 text-white px-4 py-2 rounded-full flex items-center space-x-2 shadow-lg">
                <Gem className="w-4 h-4" />
                <span className="text-sm font-bold">Premium</span>
              </div>
            </div>

            {/* Thumbnail Gallery */}
            <div className="flex gap-4 overflow-x-auto pb-2">
              {product.Product_image.map((img, idx) => (
                <button 
                  key={idx} 
                  className={`flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden border-3 transition-all duration-300 ${
                    selectedImage === img 
                      ? 'border-rose-600 shadow-lg shadow-rose-300/50 scale-105' 
                      : 'border-rose-200 hover:border-rose-400'
                  }`}
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt={`View ${idx+1}`} className="w-full h-full object-cover" onError={e => e.currentTarget.src="/fallback.jpg"} />
                </button>
              ))}
            </div>
          </motion.div>

          {/* Right: Enhanced Product Info */}
          <motion.div 
            className="space-y-8"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            
            {/* Main Product Card */}
            <Card className="p-8 border-2 border-rose-200 shadow-xl bg-white/80 backdrop-blur-sm">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1">
                  <Badge className="bg-gradient-to-r from-rose-100 to-pink-100 text-rose-700 px-4 py-2 rounded-full mb-4 font-bold border border-rose-200">
                    <Crown className="w-4 h-4 mr-2" />
                    {product.Product_category.category}
                  </Badge>
                  <h1 className="text-3xl lg:text-4xl font-black text-gray-900 leading-tight">
                    {product.Product_name}
                  </h1>
                </div>
                
                {/* Enhanced Wishlist Button */}
                <motion.button 
                  onClick={handleWishlistToggle} 
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    product && isInWishlist(product._id) 
                      ? 'bg-gradient-to-r from-pink-600 to-rose-600 text-white border-rose-400 shadow-lg' 
                      : 'border-rose-300 text-rose-600 hover:bg-rose-50 hover:border-rose-400'
                  }`}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle Wishlist"
                >
                  <Heart size={24} fill={product && isInWishlist(product._id) ? "currentColor" : "none"} />
                </motion.button>
              </div>

              {/* Enhanced Pricing - Removed Rating */}
              <div className="mb-8">
                <div className="flex items-baseline space-x-4 mb-4">
                  <span className="text-4xl lg:text-5xl font-black text-gray-900">
                    ₹{product.Product_price.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <>
                      <span className="text-xl text-rose-500 line-through">
                        ₹{Math.round(product.Product_price*1.3).toLocaleString()}
                      </span>
                      <Badge className="bg-gradient-to-r from-rose-600 to-red-600 text-white rounded-full px-3 py-1 font-bold">
                        {discount}% OFF
                      </Badge>
                    </>
                  )}
                </div>
                
                {/* Premium Quality Indicator */}
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1">
                    <Gem className="w-5 h-5 text-rose-500" />
                    <span className="text-rose-600 font-semibold">Premium Handcrafted Quality</span>
                  </div>
                </div>
              </div>

              {/* Enhanced Quantity Selector */}
              <div className="mb-8">
                <label className="font-bold text-rose-800 mb-3 block flex items-center">
                  <Gem className="w-4 h-4 mr-2" />
                  Quantity
                </label>
                <div className="flex items-center border-2 border-rose-200 rounded-2xl overflow-hidden max-w-xs bg-white">
                  <button 
                    onClick={() => setQuantity(q => Math.max(1, q - 1))} 
                    disabled={quantity <= 1}
                    className="px-6 py-4 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                    aria-label="Decrease quantity"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="px-8 py-4 text-rose-900 font-black text-lg border-x-2 border-rose-200 min-w-[80px] text-center">
                    {quantity}
                  </span>
                  <button 
                    onClick={() => setQuantity(q => Math.min(10, q + 1))}
                    disabled={quantity >= 10}
                    className="px-6 py-4 bg-rose-50 text-rose-700 hover:bg-rose-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-bold"
                    aria-label="Increase quantity"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>

              {/* Enhanced Buy Button */}
              <Button 
                onClick={handleBuyNow} 
                disabled={!product.Product_available} 
                className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-white py-6 text-lg font-black rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 disabled:opacity-50"
                size="lg"
              >
                <ShoppingCart className="w-6 h-6 mr-3" />
                {product.Product_available 
                  ? `Buy Now - ₹${(product.Product_price * quantity).toLocaleString()}` 
                  : "Out of Stock"}
              </Button>

              {/* Trust Indicators */}
              <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t-2 border-rose-100">
                {[
                  { icon: Shield, text: "Lifetime Warranty" },
                  { icon: Award, text: "Certified Quality" },
                  { icon: Crown, text: "Handcrafted" }
                ].map((item, index) => (
                  <div key={index} className="text-center">
                    <item.icon className="w-6 h-6 text-rose-600 mx-auto mb-2" />
                    <span className="text-sm font-semibold text-rose-700">{item.text}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Enhanced Tabs Section */}
            <Card className="p-6 border-2 border-rose-200 bg-white/80 backdrop-blur-sm">
              <nav className="flex gap-2 bg-rose-100 rounded-2xl p-2 mb-6">
                <button
                  className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                    activeTab === "description" 
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg" 
                      : "text-rose-700 hover:bg-rose-200"
                  }`}
                  onClick={() => setActiveTab("description")}
                >
                  <Sparkles className="w-4 h-4 inline mr-2" />
                  Description
                </button>
                <button
                  className={`flex-1 py-3 px-6 rounded-xl font-bold transition-all ${
                    activeTab === "specifications" 
                      ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg" 
                      : "text-rose-700 hover:bg-rose-200"
                  }`}
                  onClick={() => setActiveTab("specifications")}
                >
                  <Gem className="w-4 h-4 inline mr-2" />
                  Details
                </button>
              </nav>
              
              <div className="min-h-[120px]">
                {activeTab === "description" ? (
                  <p className="text-gray-700 leading-relaxed text-lg whitespace-pre-wrap">
                    {product.Product_discription}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "Category", value: product.Product_category.category },
                      { label: "Price", value: `₹${product.Product_price.toLocaleString()}` },
                      { label: "Availability", value: product.Product_available ? "In Stock" : "Out of Stock" },
                      { label: "Quality", value: "Premium Handcrafted" },
                      { label: "Material", value: "High Quality Components" },
                      { label: "Warranty", value: "free shipping order above 499" }
                    ].map((spec, index) => (
                      <div key={index} className="flex justify-between py-2 border-b border-rose-100 last:border-b-0">
                        <span className="font-semibold text-rose-800">{spec.label}:</span>
                        <span className="text-gray-700">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        </div>

        {/* Enhanced Related Products Section */}
        {relatedProducts.length > 0 && (
          <motion.section 
            className="mt-20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="flex justify-between items-center mb-12">
              <div>
                <h2 className="text-3xl lg:text-4xl font-black text-gray-900 mb-2">More From This Collection</h2>
                <p className="text-rose-600 text-lg">Discover similar handcrafted treasures</p>
              </div>
              <Button 
                onClick={() => navigate(`/category/${product.Product_category.slug}`)}
                variant="outline"
                className="border-2 border-rose-300 text-rose-700 hover:bg-rose-50 font-bold px-6 py-3 rounded-2xl"
              >
                View All
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {relatedProducts.map((p, i) => (
                <RelatedCard key={p._id} product={p} index={i} />
              ))}
            </div>
          </motion.section>
        )}
      </div>

      {/* Enhanced Image Modal */}
      <AnimatePresence>
        {showImageModal && (
          <motion.div 
            className="fixed inset-0 bg-black/95 flex justify-center items-center z-50 p-4"
            initial={{opacity:0}} 
            animate={{opacity:1}} 
            exit={{opacity:0}}
            onClick={() => setShowImageModal(false)}
          >
            <motion.div 
              className="relative max-w-6xl max-h-full"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={e => e.stopPropagation()}
            >
              <button 
                className="absolute -top-4 -right-4 w-12 h-12 text-white bg-gradient-to-r from-rose-600 to-pink-600 rounded-full hover:from-rose-700 hover:to-pink-700 transition-all flex items-center justify-center shadow-xl"
                onClick={() => setShowImageModal(false)}
                aria-label="Close image modal"
              >
                <X size={24} />
              </button>
              <img 
                src={selectedImage || "/fallback.jpg"} 
                alt="Zoomed product view" 
                className="max-h-[85vh] max-w-full object-contain rounded-3xl shadow-2xl"
                onError={e => { e.currentTarget.src = "/fallback.jpg"; }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProductDetailPage;
