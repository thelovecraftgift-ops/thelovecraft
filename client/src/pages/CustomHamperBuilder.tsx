import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/AuthContext";
import { useToast } from "../components/ui/use-toast";
import axiosInstance from "../utils/axiosConfig";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardContent } from "../components/ui/card";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import PhoneVerificationModal from "../components/PhoneVerificationModal";

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../components/ui/tabs";
import { Badge } from "../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Minus,
  X,
  ShoppingCart,
  Package,
  Gift,
  Filter,
  Search,
  RefreshCw,
  AlertCircle,
  Trash2,
  Eye,
  ShoppingBag,
  Truck,
  Grid3X3,
  List,
  ChevronUp,
  ChevronDown,
  Heart,
  Phone,
  Shield,
  Clock,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  RotateCcw,
  ArrowLeft,
  Lock,
  History,
  Crown,
  Gem,
  Star,
  Sparkles,
} from "lucide-react";

// Enhanced TypeScript declaration
interface CashfreeInstance {
  checkout: (options: {
    paymentSessionId: string;
    redirectTarget?: string;
  }) => Promise<{
    error?: { message: string };
    redirect?: boolean;
    paymentDetails?: any;
  }>;
}

declare global {
  interface Window {
    Cashfree: (config: { mode: string }) => CashfreeInstance;
  }
}

// Interface for past hamper orders
interface PastHamperOrder {
  _id: string;
  createdAt: string;
  status: string;
  paymentStatus: string;
  totalAmount: number;
  items: any[];
  paymentMethod: string;
}

export {};

const CustomHamperBuilder = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const justAddedItem = useRef(false);

  // Core hamper state
  const [hamperItems, setHamperItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Products state
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter and search state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("name");

  // UI state - UPDATED: Changed from "explore" | "hamper" to include "orders"
  const [activeTab, setActiveTab] = useState<"explore" | "hamper">("explore");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const { checkoutLoading, processPayment } = usePaymentProcessing();
  const phoneVerification = usePhoneVerification();

  // Checkout form
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
  });

  // Constants - TheLoveCraft branding
  const MINIMUM_HAMPER_AMOUNT = 200;
  const DELIVERY_CHARGE = totalAmount >= 500 ? 0 : 80;
  const minimumAmountGap = Math.max(0, MINIMUM_HAMPER_AMOUNT - totalAmount);
  const freeDeliveryGap = Math.max(0, 500 - totalAmount);

  // Detect mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-switch to hamper tab when items are added (mobile only)
  useEffect(() => {
    if (
      isMobile &&
      hamperItems.length > 0 &&
      activeTab === "explore" &&
      justAddedItem.current
    ) {
      setTimeout(() => {
        setActiveTab("hamper");
        justAddedItem.current = false;
      }, 800);
    }
  }, [hamperItems.length, isMobile, activeTab]);

  // Fetch hamper-eligible products using backend filtering
  const fetchHamperProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🎁 Fetching hamper-eligible products from backend...");

      const response = await axiosInstance.get(
        "api/getproducts?type=hamper&limit=100"
      );

      console.log("📦 Hamper products response:", response.data);

      if (response.data && response.data.product) {
        const hamperProducts = response.data.product;
        setProducts(hamperProducts);
        setFilteredProducts(hamperProducts);

        const uniqueCategories = [
          ...new Set(
            hamperProducts
              .map(
                (p) =>
                  p.Product_category_name ||
                  p.Product_category?.category ||
                  "Uncategorized"
              )
              .filter(Boolean)
          ),
        ];
        setCategories(uniqueCategories);

        console.log(
          `✅ Loaded ${hamperProducts.length} hamper-eligible products`
        );

        if (hamperProducts.length === 0) {
          toast({
            title: "💎 No Hamper Treasures",
            description:
              "No treasures are currently available for custom hampers.",
            variant: "default",
          });
        }
      } else {
        setProducts([]);
        setFilteredProducts([]);
        setCategories([]);
      }
    } catch (error) {
      console.error("❌ Error fetching hamper products:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to load hamper treasures";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Fetch user's hamper from database
  const fetchUserHamper = useCallback(async () => {
    if (!user) return;

    try {
      const response = await axiosInstance.get("/hamper");
      const data = response.data;

      if (data.hamper && data.hamper.length > 0) {
        setHamperItems(data.hamper);
        setTotalAmount(data.totalAmount || 0);
        setTotalItems(data.totalItems || 0);
        console.log("✨ Hamper loaded from database:", data);
      } else {
        setHamperItems([]);
        setTotalAmount(0);
        setTotalItems(0);
      }
    } catch (error) {
      console.error("Error fetching hamper from database:", error);
      setHamperItems([]);
      setTotalAmount(0);
      setTotalItems(0);
    }
  }, [user]);

  // Initialize component
  useEffect(() => {
    fetchHamperProducts();
    fetchUserHamper();
  }, [fetchHamperProducts, fetchUserHamper]);

  // Add this effect after your existing useEffect hooks
  useEffect(() => {
    if (phoneVerification.phoneVerified) {
      setShippingAddress(prev => ({
        ...prev,
        phone: phoneVerification.phoneNumber
      }));
      setIsCheckingOut(true);
    }
  }, [phoneVerification.phoneVerified, phoneVerification.phoneNumber]);

  // Filter and search logic
  useEffect(() => {
    let filtered = [...products];

    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.Product_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedCategory !== "all") {
      filtered = filtered.filter(
        (product) =>
          (product.Product_category_name || product.Product_category) ===
          selectedCategory
      );
    }

    if (priceRange.min) {
      filtered = filtered.filter(
        (product) =>
          (product.Hamper_price || product.Product_price) >=
          parseFloat(priceRange.min)
      );
    }

    if (priceRange.max) {
      filtered = filtered.filter(
        (product) =>
          (product.Hamper_price || product.Product_price) <=
          parseFloat(priceRange.max)
      );
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return (
            (a.Hamper_price || a.Product_price) -
            (b.Hamper_price || b.Product_price)
          );
        case "price-high":
          return (
            (b.Hamper_price || b.Product_price) -
            (a.Hamper_price || a.Product_price)
          );
        case "name":
        default:
          return a.Product_name.localeCompare(b.Product_name);
      }
    });

    setFilteredProducts(filtered);
  }, [products, searchQuery, selectedCategory, priceRange, sortBy]);

  // Hamper validation
  const hamperValidation = useMemo(() => {
    if (totalAmount < MINIMUM_HAMPER_AMOUNT) {
      return {
        isValid: false,
        message: `Add ₹${minimumAmountGap} more to reach minimum hamper value of ₹${MINIMUM_HAMPER_AMOUNT}`,
      };
    }
    return { isValid: true, message: "Hamper treasure is ready for checkout! ✨" };
  }, [totalAmount, minimumAmountGap]);

  // Add item to hamper
  const addItemToHamper = async (product) => {
    try {
      setIsProcessing(true);
      justAddedItem.current = true;
      console.log("🎁 Adding treasure to hamper:", product.Product_name);

      const response = await axiosInstance.post("/hamper/add", {
        productId: product._id,
        quantity: 1,
      });

      if (response.data) {
        setHamperItems(response.data.hamper);
        setTotalAmount(response.data.totalAmount);
        setTotalItems(response.data.totalItems);

        toast({
          title: "💎 Added to Hamper",
          description: `${product.Product_name} added to your treasure hamper`,
        });
      }
    } catch (error) {
      console.error("Error adding to hamper:", error);
      toast({
        title: "✨ Error",
        description:
          error.response?.data?.message || "Failed to add treasure to hamper",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Update item quantity in hamper
  const updateItemQuantity = async (productId, newQuantity) => {
    if (newQuantity <= 0) {
      return removeItemFromHamper(productId);
    }

    try {
      setIsProcessing(true);
      const response = await axiosInstance.put(`/hamper/update/${productId}`, {
        quantity: newQuantity,
      });

      if (response.data) {
        setHamperItems(response.data.hamper);
        setTotalAmount(response.data.totalAmount);
        setTotalItems(response.data.totalItems);
      }
    } catch (error) {
      console.error("Error updating hamper quantity:", error);
      toast({
        title: "💎 Error",
        description: "Failed to update treasure quantity",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Remove item from hamper
  const removeItemFromHamper = async (productId) => {
    try {
      setIsProcessing(true);
      const response = await axiosInstance.delete(
        `/hamper/remove/${productId}`
      );

      if (response.data) {
        setHamperItems(response.data.hamper);
        setTotalAmount(response.data.totalAmount);
        setTotalItems(response.data.totalItems);

        toast({
          title: "💔 Treasure Removed",
          description: "Treasure removed from hamper",
          duration: 2000,
        });
      }
    } catch (error) {
      console.error("Error removing from hamper:", error);
      toast({
        title: "✨ Error",
        description: "Failed to remove treasure",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Clear entire hamper
  const clearHamper = async () => {
    try {
      setIsProcessing(true);
      await axiosInstance.delete("/hamper/clear");

      setHamperItems([]);
      setTotalAmount(0);
      setTotalItems(0);

      toast({
        title: "🗑️ Hamper Cleared",
        description: "All treasures removed from hamper",
        duration: 2000,
      });
    } catch (error) {
      console.error("Error clearing hamper:", error);
      toast({
        title: "✨ Error",
        description: "Failed to clear hamper",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle tab change
  const handleTabChange = (newTab) => {
    if (newTab === "explore") justAddedItem.current = false;
    setActiveTab(newTab);
  };

  // Handle checkout form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Start checkout process - MODIFIED TO USE PHONE VERIFICATION
  const startCheckout = () => {
    if (!user) {
      toast({
        title: "✨ Please join us",
        description: "You need to be part of our family to checkout",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    if (!hamperValidation.isValid) {
      toast({
        title: "💎 Cannot Proceed",
        description: hamperValidation.message,
        variant: "destructive",
      });
      return;
    }
    
    // ✅ Use hook method instead of inline state
    phoneVerification.setShowPhoneVerification(true);
  };

  // ✅ Replace handlePaymentSelection with this
  const handlePaymentSelection = async (paymentMethod: "cod" | "online") => {
    try {
      // ✅ Add phone verification check
      if (!phoneVerification.phoneVerified) {
        toast({
          title: "📱 Phone Not Verified",
          description: "Please verify your phone number first",
          variant: "destructive",
        });
        return;
      }

      // Form validation
      const requiredFields = ["fullName", "address", "city", "state", "pinCode", "phone"];
      const missingFields = requiredFields.filter(
        (field) => !shippingAddress[field].trim()
      );

      if (missingFields.length > 0) {
        toast({
          title: "💫 Missing Information",
          description: "Please fill in all shipping address fields",
          variant: "destructive",
        });
        return;
      }

      // Prepare items for payment processing
      const orderItems = hamperItems.map((item) => ({
        productId: item.productId._id,
        quantity: item.quantity,
        price: item.productId.Hamper_price || item.productId.Product_price,
        name: item.productId.Product_name,
        image: item.productId.Product_image?.[0] || null,
      }));

      // Calculate totals
      const itemsTotal = hamperItems.reduce((total, item) => {
        return total + (item.productId.Hamper_price || item.productId.Product_price) * item.quantity;
      }, 0);

      const totals = {
        itemsTotal: itemsTotal,
        deliveryCharge: DELIVERY_CHARGE,
        totalAmount: itemsTotal + DELIVERY_CHARGE,
      };

      // ✅ Use the standardized payment processing with cartType: "hamper"
      const success = await processPayment(
        orderItems,
        shippingAddress,
        paymentMethod,
        totals,
        "hamper" // ✅ This is crucial for hamper orders
      );

      if (success) {
        // Reset local state since payment processing handles cart clearing
        setHamperItems([]);
        setTotalAmount(0);
        setTotalItems(0);
        setIsCheckingOut(false);
        phoneVerification.resetPhoneVerification(); // ✅ Use hook method
      }

    } catch (error: any) {
      console.error("❌ Hamper payment error:", error);
      toast({
        title: "💎 Payment Error",
        description: error.message || "Failed to process hamper payment",
        variant: "destructive",
      });
    }
  };

  // Helper functions
  const getItemTotal = (item) => {
    const price = item.productId.Hamper_price || item.productId.Product_price;
    return price * item.quantity;
  };

  const getItemUnitPrice = (item) => {
    return item.productId.Hamper_price || item.productId.Product_price;
  };

  const isProductInHamper = (productId) => {
    return hamperItems.some((item) => item.productId._id === productId);
  };

  const getProductQuantityInHamper = (productId) => {
    const item = hamperItems.find((item) => item.productId._id === productId);
    return item ? item.quantity : 0;
  };

  // Format date for past orders
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Get status color and icon
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: "bg-amber-500", icon: Clock, label: "Pending" },
      processing: { color: "bg-blue-500", icon: Package, label: "Processing" },
      shipped: { color: "bg-purple-500", icon: Truck, label: "Shipped" },
      delivered: {
        color: "bg-green-500",
        icon: CheckCircle,
        label: "Delivered",
      },
      cancelled: { color: "bg-red-500", icon: X, label: "Cancelled" },
      failed: { color: "bg-red-500", icon: X, label: "Failed" },
    };
    return configs[status] || configs.pending;
  };

  // Compact Mobile Filters Component - TheLoveCraft theme
  const MobileFilters = () => (
    <motion.div
      initial={false}
      animate={{ height: showFilters ? "auto" : 0 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden bg-white border-b border-rose-200"
    >
      <div className="p-2 sm:p-3 space-y-2 sm:space-y-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 sm:h-4 sm:w-4 text-rose-400" />
          <Input
            type="text"
            placeholder="Search treasures..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 sm:pl-10 h-7 sm:h-9 text-[11px] xs:text-xs sm:text-sm border-rose-200 focus:border-rose-500 focus:ring-rose-500"
          />
        </div>

        {/* Category and Sort in a row */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="h-7 sm:h-9 text-[10px] xs:text-xs sm:text-sm px-1.5 sm:px-3 border-rose-200 focus:border-rose-500">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-[10px] xs:text-xs">
                All Collections
              </SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category}
                  value={category}
                  className="text-[10px] xs:text-xs"
                >
                  {category.length > 15
                    ? category.substring(0, 15) + "..."
                    : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="h-7 sm:h-9 text-[10px] xs:text-xs sm:text-sm px-1.5 sm:px-3 border-rose-200 focus:border-rose-500">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name" className="text-[10px] xs:text-xs">
                Name A-Z
              </SelectItem>
              <SelectItem value="price-low" className="text-[10px] xs:text-xs">
                Price ↑
              </SelectItem>
              <SelectItem value="price-high" className="text-[10px] xs:text-xs">
                Price ↓
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Price Range */}
        <div className="grid grid-cols-2 gap-1.5 sm:gap-2">
          <Input
            type="number"
            placeholder="Min ₹"
            value={priceRange.min}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, min: e.target.value }))
            }
            className="h-7 sm:h-9 text-[10px] xs:text-xs sm:text-sm px-1.5 sm:px-3 border-rose-200 focus:border-rose-500"
          />
          <Input
            type="number"
            placeholder="Max ₹"
            value={priceRange.max}
            onChange={(e) =>
              setPriceRange((prev) => ({ ...prev, max: e.target.value }))
            }
            className="h-7 sm:h-9 text-[10px] xs:text-xs sm:text-sm px-1.5 sm:px-3 border-rose-200 focus:border-rose-500"
          />
        </div>
      </div>
    </motion.div>
  );

  // Enhanced Product Card Component - TheLoveCraft theme
  const ProductCard = ({ product }) => {
    const hamperPrice = product.Hamper_price || product.Product_price;
    const regularPrice = product.Product_price;
    const discount =
      regularPrice > hamperPrice
        ? ((regularPrice - hamperPrice) / regularPrice) * 100
        : 0;

    const inHamper = isProductInHamper(product._id);
    const hamperQuantity = getProductQuantityInHamper(product._id);

    // Compact Quantity Control
    const QuantityControl = () => (
      <div className="flex items-center border border-rose-300 rounded-md bg-rose-50 overflow-hidden">
        <button
          className="w-5 h-5 xs:w-6 xs:h-6 flex items-center justify-center hover:bg-rose-100 active:bg-rose-200 transition-colors disabled:opacity-50"
          onClick={() => updateItemQuantity(product._id, hamperQuantity - 1)}
          disabled={isProcessing}
          aria-label="Decrease quantity"
        >
          <Minus className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-rose-600" />
        </button>
        <span className="w-5 xs:w-6 text-center text-[10px] xs:text-xs font-semibold bg-white leading-5 xs:leading-6">
          {hamperQuantity}
        </span>
        <button
          className="w-5 h-5 xs:w-6 xs:h-6 flex items-center justify-center hover:bg-rose-100 active:bg-rose-200 transition-colors disabled:opacity-50"
          onClick={() => updateItemQuantity(product._id, hamperQuantity + 1)}
          disabled={isProcessing}
          aria-label="Increase quantity"
        >
          <Plus className="w-2 h-2 xs:w-2.5 xs:h-2.5 text-rose-600" />
        </button>
      </div>
    );

    return (
      <Card className="group hover:shadow-lg transition-all duration-300 border-0 shadow-sm bg-white/90 backdrop-blur-sm overflow-hidden h-full border-rose-200 hover:border-rose-300">
        <CardContent className="p-0 flex flex-col h-full">
          {/* Image Container - TheLoveCraft optimized */}
          <div className="relative overflow-hidden aspect-square">
            <img
              src={product.Product_image?.[0] || "/placeholder-product.jpg"}
              alt={product.Product_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                e.currentTarget.src = "/placeholder-product.jpg";
              }}
            />

            {/* Enhanced Badges - TheLoveCraft theme */}
            <div className="absolute top-1 left-1 right-1 flex justify-between items-start gap-1">
              {discount > 0 && (
                <Badge className="bg-gradient-to-r from-rose-500 to-pink-600 text-white text-[8px] xs:text-[10px] px-1 py-0.5 leading-tight shadow-sm">
                  {discount.toFixed(0)}% OFF
                </Badge>
              )}
              {inHamper && (
                <Badge className="bg-gradient-to-r from-pink-500 to-rose-600 text-white text-[8px] xs:text-[10px] px-1 py-0.5 leading-tight shadow-sm">
                  <Crown className="w-2 h-2 xs:w-2.5 xs:h-2.5 mr-0.5" />
                  <span className="hidden xs:inline">In Hamper</span>
                  <span className="xs:hidden">✓</span>
                </Badge>
              )}
            </div>

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
          </div>

          {/* Content - TheLoveCraft styling */}
          <div className="p-1.5 xs:p-2 sm:p-3 space-y-1.5 flex-1 flex flex-col">
            {/* Product Name */}
            <h3 className="font-semibold text-[10px] xs:text-xs sm:text-sm line-clamp-2 min-h-[2rem] xs:min-h-[2.5rem] leading-tight text-gray-900">
              {product.Product_name}
            </h3>

            {/* Price Section */}
            <div className="space-y-1 flex-1">
              <div className="flex items-start justify-between gap-1">
                <div className="flex flex-col min-w-0">
                  <span className="text-xs xs:text-sm sm:text-base font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 via-pink-600 to-red-700">
                    ₹{hamperPrice.toLocaleString()}
                  </span>
                  {discount > 0 && (
                    <span className="text-[8px] xs:text-xs text-gray-500 line-through">
                      ₹{regularPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Add/Quantity Controls */}
                <div className="flex-shrink-0">
                  {inHamper ? (
                    <QuantityControl />
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => addItemToHamper(product)}
                      className="hover:bg-rose-50 hover:border-rose-500 hover:text-rose-600 text-[8px] xs:text-xs px-1.5 py-0.5 h-6 xs:h-7 border-rose-200 transition-all duration-200 group/btn"
                      disabled={isProcessing}
                    >
                      <Plus className="h-2 w-2 xs:h-2.5 xs:w-2.5 mr-0.5 transition-transform group-hover/btn:scale-110" />
                      <span className="xs:inline">Add</span>
                      <span className="hidden xs:hidden">+</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* Category Badge - TheLoveCraft styling */}
            <Badge
              variant="secondary"
              className="text-[8px] xs:text-xs w-full justify-center truncate mt-auto bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100 transition-colors"
            >
              {product.Product_category_name ||
                product.Product_category ||
                "Handcrafted"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Loading state - TheLoveCraft theme
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 px-2 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-200">
            <RefreshCw className="h-8 w-8 animate-spin text-rose-600" />
          </div>
          <p className="text-lg font-medium text-gray-900 mb-2">Loading hamper treasures...</p>
          <p className="text-sm text-rose-600">✨ Handpicking the finest pieces for you</p>
        </motion.div>
      </div>
    );
  }

  // Error state - TheLoveCraft theme
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 px-2 pt-16 pb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-red-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-200">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-xl font-semibold mb-2 text-gray-900">
            Unable to Load Treasures
          </h2>
          <p className="text-rose-600 mb-4">{error}</p>
          <Button 
            onClick={fetchHamperProducts}
            className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </motion.div>
      </div>
    );
  }

  // Main render - TheLoveCraft theme
  return (
    <>
      <style>{`
        body, html {
          overflow-x: hidden !important;
          max-width: 100vw !important;
        }
        * {
          box-sizing: border-box;
        }
        
        /* Enhanced 320px support */
        @media (max-width: 320px) {
          .container {
            padding-left: 2px;
            padding-right: 2px;
          }
          .hamper-card {
            padding: 6px !important;
          }
          .hamper-item-image {
            width: 48px !important;
            height: 48px !important;
          }
          .quantity-control-btn {
            width: 20px !important;
            height: 20px !important;
          }
          .quantity-display {
            width: 28px !important;
            font-size: 10px !important;
          }
          /* Product cards ultra-compact */
          .product-card-content {
            padding: 4px !important;
          }
          .product-card-image {
            min-height: 120px !important;
          }
        }
        
        /* Add xs breakpoint support */
        @media (min-width: 360px) {
          .xs\\:text-xs { font-size: 0.75rem; line-height: 1rem; }
          .xs\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .xs\\:p-2 { padding: 0.5rem; }
          .xs\\:px-2 { padding-left: 0.5rem; padding-right: 0.5rem; }
          .xs\\:gap-2 { gap: 0.5rem; }
          .xs\\:w-12 { width: 3rem; }
          .xs\\:h-12 { height: 3rem; }
          .xs\\:leading-6 { line-height: 1.5rem; }
        }
        
        .xs\\:hidden {
          @media (max-width: 359px) {
            display: none;
          }
        }
        
        /* Line clamp utilities */
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Custom gradient card styling */
        .gradient-card {
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(252, 231, 243, 0.8) 100%);
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-16 pb-6 px-1 overflow-x-hidden">
        <div className="container mx-auto max-w-6xl px-1">
          {/* Enhanced Header - TheLoveCraft theme */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-2 sm:mb-4 px-1"
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-6 py-3 rounded-full text-sm font-bold mb-4 shadow-lg border border-rose-200">
              <Crown className="w-4 h-4" />
              Custom Treasure Hamper
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-base sm:text-lg md:text-2xl lg:text-3xl font-black text-gray-900 mb-1 leading-tight">
              Custom <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">Hamper Builder</span>
            </h1>
            <p className="text-[10px] xs:text-xs sm:text-sm text-rose-600 leading-tight px-2 font-medium">
              Create your perfect gift hamper with handcrafted treasures • Min ₹{MINIMUM_HAMPER_AMOUNT} ✨
            </p>
          </motion.div>

          {/* Enhanced Hamper Status Banner - TheLoveCraft theme */}
          {totalItems > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white rounded-md sm:rounded-lg p-1.5 sm:p-3 mb-2 sm:mb-4 mx-1 shadow-lg"
            >
              <div className="flex items-center justify-between text-[10px] xs:text-xs sm:text-sm">
                <div className="flex items-center gap-1 min-w-0">
                  <Gift className="w-3 h-3 flex-shrink-0" />
                  <span className="font-semibold truncate">
                    Treasure Hamper: {totalItems} items • ₹{totalAmount.toLocaleString()}
                  </span>
                </div>
                <Badge className="bg-white/20 text-white text-[9px] xs:text-xs px-1 py-0.5 ml-1 flex-shrink-0">
                  {hamperValidation.isValid ? "Ready! ✨" : `₹${minimumAmountGap} more`}
                </Badge>
              </div>
            </motion.div>
          )}

          {/* Enhanced Tab Interface - TheLoveCraft theme */}
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="w-full mx-1"
          >
            {/* Tab Navigation */}
            <div className="bg-white rounded-t-md sm:rounded-t-xl shadow-lg border border-b-0 border-rose-100">
              <TabsList className="w-full h-10 sm:h-12 bg-transparent p-0.5 sm:p-1">
                <TabsTrigger
                  value="explore"
                  className="flex-1 h-9 sm:h-10 text-[10px] xs:text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:via-rose-600 data-[state=active]:to-red-700 data-[state=active]:text-white px-1 sm:px-2"
                >
                  <Grid3X3 className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 xs:mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden xs:inline">Explore</span>
                  <span className="xs:hidden">Shop</span>
                  <Badge className="ml-0.5 xs:ml-1 sm:ml-2 text-[8px] xs:text-xs bg-rose-100 text-rose-700 px-1 py-0">
                    {filteredProducts.length}
                  </Badge>
                </TabsTrigger>

                <TabsTrigger
                  value="hamper"
                  className="flex-1 h-9 sm:h-10 text-[10px] xs:text-xs sm:text-sm font-medium data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-600 data-[state=active]:via-rose-600 data-[state=active]:to-red-700 data-[state=active]:text-white px-1 sm:px-2"
                >
                  <ShoppingBag className="w-2.5 h-2.5 xs:w-3 xs:h-3 sm:w-4 sm:h-4 mr-0.5 xs:mr-1 sm:mr-2 flex-shrink-0" />
                  <span className="hidden xs:inline">Hamper</span>
                  <span className="xs:hidden">Cart</span>
                  {totalItems > 0 && (
                    <Badge className="ml-0.5 xs:ml-1 sm:ml-2 text-[8px] xs:text-xs bg-orange-500 text-white px-1 py-0">
                      {totalItems}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Mobile Filter Toggle */}
              {activeTab === "explore" && isMobile && (
                <div className="border-t border-rose-200">
                  <Button
                    variant="ghost"
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full h-8 sm:h-10 justify-between text-[11px] xs:text-xs sm:text-sm text-rose-600 hover:bg-rose-50 px-2"
                  >
                    <div className="flex items-center gap-1 sm:gap-2">
                      <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span className="hidden xs:inline">Filters & Search</span>
                      <span className="xs:hidden">Filters</span>
                    </div>
                    {showFilters ? (
                      <ChevronUp className="w-3 h-3 sm:w-4 sm:h-4" />
                    ) : (
                      <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
                    )}
                  </Button>
                </div>
              )}

              {/* Mobile Filters */}
              {activeTab === "explore" && isMobile && <MobileFilters />}
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-b-md sm:rounded-b-xl shadow-lg border border-t-0 border-rose-100 min-h-[60vh]">
              {/* Explore Products Tab */}
              <TabsContent value="explore" className="m-0 p-0 w-full">
                {/* Enhanced Explore Tab - TheLoveCraft theme */}
                <div className="bg-gradient-to-br from-pink-50 to-white p-1 sm:p-3 overflow-x-hidden min-h-[60vh]">
                  <div className="container mx-auto max-w-6xl">
                    {/* Enhanced Desktop Filters - TheLoveCraft theme */}
                    {!isMobile && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-rose-100"
                      >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          {/* Search */}
                          <div className="relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-rose-400 group-focus-within:text-rose-500 transition-colors" />
                            <Input
                              type="text"
                              placeholder="Search treasures..."
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 h-10 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-lg"
                            />
                          </div>

                          {/* Category */}
                          <Select
                            value={selectedCategory}
                            onValueChange={setSelectedCategory}
                          >
                            <SelectTrigger className="h-10 border-rose-200 focus:border-rose-500 rounded-lg">
                              <SelectValue placeholder="All Collections" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">
                                All Collections
                              </SelectItem>
                              {categories.map((category) => (
                                <SelectItem key={category} value={category}>
                                  {category}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>

                          {/* Sort */}
                          <Select value={sortBy} onValueChange={setSortBy}>
                            <SelectTrigger className="h-10 border-rose-200 focus:border-rose-500 rounded-lg">
                              <SelectValue placeholder="Sort by" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="name">Name A-Z</SelectItem>
                              <SelectItem value="price-low">
                                Price: Low to High
                              </SelectItem>
                              <SelectItem value="price-high">
                                Price: High to Low
                              </SelectItem>
                            </SelectContent>
                          </Select>

                          {/* Price Range */}
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              placeholder="Min ₹"
                              value={priceRange.min}
                              onChange={(e) =>
                                setPriceRange((prev) => ({
                                  ...prev,
                                  min: e.target.value,
                                }))
                              }
                              className="h-10 border-rose-200 focus:border-rose-500 rounded-lg"
                            />
                            <Input
                              type="number"
                              placeholder="Max ₹"
                              value={priceRange.max}
                              onChange={(e) =>
                                setPriceRange((prev) => ({
                                  ...prev,
                                  max: e.target.value,
                                }))
                              }
                              className="h-10 border-rose-200 focus:border-rose-500 rounded-lg"
                            />
                          </div>
                        </div>

                        {/* Active Filters Display */}
                        {(searchQuery ||
                          selectedCategory !== "all" ||
                          priceRange.min ||
                          priceRange.max ||
                          sortBy !== "name") && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="text-xs font-medium text-rose-600">
                              Active filters:
                            </span>
                            {searchQuery && (
                              <Badge variant="secondary" className="text-xs">
                                Search: {searchQuery}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() => setSearchQuery("")}
                                />
                              </Badge>
                            )}
                            {selectedCategory !== "all" && (
                              <Badge variant="secondary" className="text-xs">
                                {selectedCategory}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() => setSelectedCategory("all")}
                                />
                              </Badge>
                            )}
                            {(priceRange.min || priceRange.max) && (
                              <Badge variant="secondary" className="text-xs">
                                ₹{priceRange.min || "0"} - ₹
                                {priceRange.max || "∞"}
                                <X
                                  className="w-3 h-3 ml-1 cursor-pointer"
                                  onClick={() =>
                                    setPriceRange({ min: "", max: "" })
                                  }
                                />
                              </Badge>
                            )}
                          </div>
                        )}
                      </motion.div>
                    )}

                    {/* Results Header */}
                    <div className="flex items-center justify-between mb-3 px-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                          <Gem className="w-4 h-4 text-rose-600" />
                          {filteredProducts.length} Treasure
                          {filteredProducts.length !== 1 ? "s" : ""}
                        </h3>
                        {searchQuery && (
                          <span className="text-xs text-rose-500">
                            for "{searchQuery}"
                          </span>
                        )}
                      </div>

                      {/* Quick Sort on Mobile */}
                      {isMobile && (
                        <Select value={sortBy} onValueChange={setSortBy}>
                          <SelectTrigger className="w-24 h-8 text-xs border-rose-200">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="name" className="text-xs">
                              A-Z
                            </SelectItem>
                            <SelectItem value="price-low" className="text-xs">
                              ₹ ↑
                            </SelectItem>
                            <SelectItem value="price-high" className="text-xs">
                              ₹ ↓
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>

                    {/* Enhanced Products Grid - 320px Optimized */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-1.5 sm:gap-2 lg:gap-3">
                      {filteredProducts.map((product, index) => (
                        <motion.div
                          key={product._id}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.05, duration: 0.3 }}
                        >
                          <ProductCard product={product} />
                        </motion.div>
                      ))}
                    </div>

                    {/* Enhanced Empty State - TheLoveCraft theme */}
                    {filteredProducts.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-8 sm:py-12 px-2"
                      >
                        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-rose-100 max-w-md mx-auto">
                          <Package className="h-12 w-12 sm:h-16 sm:w-16 text-rose-400 mx-auto mb-4" />
                          <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
                            No Treasures Found
                          </h3>
                          <p className="text-sm text-rose-600 mb-4">
                            {searchQuery
                              ? `No treasures match "${searchQuery}"`
                              : "Try adjusting your filters to discover more treasures"}
                          </p>

                          {/* Quick Reset Filters */}
                          {(searchQuery ||
                            selectedCategory !== "all" ||
                            priceRange.min ||
                            priceRange.max) && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSearchQuery("");
                                setSelectedCategory("all");
                                setPriceRange({ min: "", max: "" });
                                setSortBy("name");
                              }}
                              className="border-rose-200 text-rose-600 hover:bg-rose-50"
                            >
                              <RotateCcw className="w-4 h-4 mr-2" />
                              Clear All Filters
                            </Button>
                          )}
                        </div>
                      </motion.div>
                    )}

                    {/* Load More Button (if you have pagination) */}
                    {filteredProducts.length > 0 &&
                      filteredProducts.length % 20 === 0 && (
                        <div className="text-center mt-6">
                          <Button
                            variant="outline"
                            className="border-rose-200 text-rose-600 hover:bg-rose-50"
                          >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Load More Treasures
                          </Button>
                        </div>
                      )}
                  </div>
                </div>
              </TabsContent>

              {/* Hamper Tab - TheLoveCraft theme */}
              <TabsContent
                value="hamper"
                className="m-0 p-1 xs:p-2 sm:p-4 w-full"
              >
                {/* Identical global style block to CartPage */}
                <style>{`
                  body, html { overflow-x: hidden !important; max-width: 100vw !important; }
                  * { box-sizing: border-box; }
                  @media (max-width: 375px) {
                    .container { padding-left: 8px; padding-right: 8px; }
                  }
                `}</style>

                <div className="bg-gradient-to-br from-pink-50 to-white p-1 xs:p-2 sm:p-4 overflow-x-hidden min-h-[60vh]">
                  <div className="container mx-auto max-w-6xl">
                    {/* Empty hamper state - TheLoveCraft theme */}
                    {hamperItems.length === 0 ? (
                      <div className="text-center py-8 sm:py-12 px-2">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-200">
                          <ShoppingBag className="h-8 w-8 sm:h-10 sm:w-10 text-rose-600" />
                        </div>
                        <h3 className="text-lg sm:text-xl font-black text-gray-900 mb-2">
                          Your treasure hamper is empty
                        </h3>
                        <p className="text-sm sm:text-base text-rose-600 mb-6 font-medium">
                          Start building your custom hamper by adding handcrafted treasures ✨
                        </p>
                        <Button
                          onClick={() => setActiveTab("explore")}
                          className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800"
                        >
                          <Crown className="w-4 h-4 mr-2" />
                          Explore Treasures
                        </Button>
                      </div>
                    ) : (
                      <>
                        {/* Free delivery banner - TheLoveCraft theme */}
                        {freeDeliveryGap > 0 && freeDeliveryGap <= 300 && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-lg sm:rounded-xl p-2 sm:p-3 mb-3 sm:mb-4"
                          >
                            <div className="flex items-center justify-center gap-1 sm:gap-2 text-orange-700 text-xs sm:text-sm">
                              <Truck className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                              <span className="font-semibold text-center">
                                Add ₹{freeDeliveryGap} more for{" "}
                                <span className="text-orange-800 font-bold">
                                  FREE DELIVERY
                                </span>
                                ✨
                              </span>
                            </div>
                          </motion.div>
                        )}

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
                          {/* LEFT PANE – item list - TheLoveCraft theme */}
                          <div className="lg:col-span-2">
                            <div className="bg-white rounded-lg sm:rounded-xl shadow-xl border border-rose-100 p-2 sm:p-3 md:p-4">
                              <div className="flex items-center gap-3 mb-4">
                                <div className="w-8 h-8 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center border border-rose-200">
                                  <Gem className="w-4 h-4 text-rose-600" />
                                </div>
                                <h2 className="text-lg font-black text-gray-900">Hamper Treasures</h2>
                              </div>

                              <div className="space-y-2 sm:space-y-3">
                                {hamperItems.map((item, index) => (
                                  <motion.div
                                    key={`${item.productId._id}-${index}`}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border border-rose-100 rounded-lg hover:shadow-sm transition-all duration-200"
                                  >
                                    {/* image */}
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0">
                                      <img
                                        src={
                                          item.productId.Product_image?.[0] ||
                                          "/placeholder-product.jpg"
                                        }
                                        alt={item.productId.Product_name}
                                        className="w-full h-full object-cover rounded-md border border-rose-200"
                                        onError={(e) => {
                                          (e.target as HTMLImageElement).src =
                                            "/placeholder-product.jpg";
                                        }}
                                      />
                                    </div>

                                    {/* info */}
                                    <div className="flex-grow min-w-0">
                                      <div className="space-y-1 sm:space-y-2">
                                        {/* name */}
                                        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-2 leading-tight">
                                          {item.productId.Product_name}
                                        </h3>

                                        {/* price / qty / total */}
                                        <div className="space-y-1">
                                          {/* unit price */}
                                          <div className="flex items-center gap-2">
                                            <Gem className="w-3 h-3 text-rose-400" />
                                            <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                              Unit Price:
                                            </span>
                                            <span className="text-xs sm:text-sm font-medium text-rose-600">
                                              ₹
                                              {getItemUnitPrice(
                                                item
                                              ).toLocaleString()}
                                            </span>
                                          </div>

                                          {/* qty controls + line total */}
                                          <div className="flex items-center justify-between gap-2">
                                            {/* qty controls */}
                                            <div className="flex items-center gap-2">
                                              <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                                Qty:
                                              </span>
                                              <div className="flex items-center border-2 border-rose-200 rounded-md bg-rose-50">
                                                <button
                                                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-l-md hover:bg-rose-200 transition-colors"
                                                  onClick={() =>
                                                    updateItemQuantity(
                                                      item.productId._id,
                                                      item.quantity - 1
                                                    )
                                                  }
                                                  disabled={isProcessing}
                                                >
                                                  <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-rose-600" />
                                                </button>
                                                <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-gray-900">
                                                  {item.quantity}
                                                </span>
                                                <button
                                                  className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-r-md hover:bg-rose-200 transition-colors"
                                                  onClick={() =>
                                                    updateItemQuantity(
                                                      item.productId._id,
                                                      item.quantity + 1
                                                    )
                                                  }
                                                  disabled={isProcessing}
                                                >
                                                  <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-rose-600" />
                                                </button>
                                              </div>
                                            </div>

                                            {/* line total */}
                                            <div className="flex flex-col items-end">
                                              <div className="flex items-center gap-1">
                                                <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                                <span className="text-[10px] sm:text-xs text-gray-500 font-medium">
                                                  Total:
                                                </span>
                                              </div>
                                              <span className="text-sm sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                                                ₹
                                                {getItemTotal(
                                                  item
                                                ).toLocaleString()}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        {/* remove */}
                                        <div className="flex justify-end pt-1">
                                          <button
                                            className="flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-200 hover:border-red-300"
                                            onClick={() =>
                                              removeItemFromHamper(
                                                item.productId._id
                                              )
                                            }
                                            disabled={isProcessing}
                                          >
                                            <Trash2 className="w-3 h-3" />
                                            <span className="hidden sm:inline">
                                              Remove
                                            </span>
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </motion.div>
                                ))}
                              </div>

                              {/* bottom buttons */}
                              <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t-2 border-rose-200 space-y-2">
                                <Button
                                  variant="outline"
                                  className="w-full rounded-full px-3 py-2 border-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 font-bold text-xs sm:text-sm"
                                  onClick={() => setActiveTab("explore")}
                                >
                                  <Heart className="w-4 h-4 mr-2" />
                                  Continue Adding Treasures
                                </Button>

                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    variant="destructive"
                                    className="flex-1 rounded-full px-3 py-2 text-xs sm:text-sm bg-red-500 hover:bg-red-600"
                                    onClick={clearHamper}
                                    disabled={isProcessing}
                                  >
                                    Clear Hamper
                                  </Button>
                                  <Button
                                    className={`flex-1 rounded-full px-3 py-2 text-xs sm:text-sm font-semibold ${
                                      hamperValidation.isValid
                                        ? "bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 shadow-xl hover:shadow-2xl"
                                        : "bg-gray-400 cursor-not-allowed"
                                    }`}
                                    onClick={startCheckout}
                                    disabled={
                                      !hamperValidation.isValid || isProcessing
                                    }
                                  >
                                    <Crown className="w-4 h-4 mr-2" />
                                    {hamperValidation.isValid
                                      ? "Checkout"
                                      : `Add ₹${minimumAmountGap} More`}
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* RIGHT PANE – hamper summary - TheLoveCraft theme */}
                          <div className="lg:col-span-1">
                            <div className="gradient-card rounded-lg sm:rounded-xl shadow-xl border-2 border-rose-200/50 p-3 sm:p-4 sticky top-20 backdrop-blur-sm">
                              <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center border border-rose-200">
                                  <Gift className="w-3 h-3 text-rose-600" />
                                </div>
                                Hamper Summary
                              </h2>

                              {/* item list */}
                              <div className="space-y-1.5 mb-4 max-h-32 sm:max-h-40 overflow-y-auto bg-white rounded-2xl p-3 border border-rose-200">
                                <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                                  <Gem className="w-4 h-4 text-rose-500" />
                                  Treasures ({hamperItems.length})
                                </h4>
                                {hamperItems.map((item, index) => (
                                  <div
                                    key={`summary-${item.productId._id}-${index}`}
                                    className="flex justify-between items-start text-xs sm:text-sm py-1 border-b border-rose-100 last:border-b-0"
                                  >
                                    <div className="flex-1 min-w-0 mr-2">
                                      <div className="font-medium text-gray-700 truncate leading-tight">
                                        {item.productId.Product_name}
                                      </div>
                                      <div className="text-[10px] sm:text-xs text-rose-500 mt-0.5 flex items-center gap-1">
                                        <Star className="w-2 h-2 fill-current" />
                                        ₹
                                        {getItemUnitPrice(
                                          item
                                        ).toLocaleString()}{" "}
                                        × {item.quantity}
                                      </div>
                                    </div>
                                    <div className="font-semibold text-rose-600 flex-shrink-0">
                                      ₹{getItemTotal(item).toLocaleString()}
                                    </div>
                                  </div>
                                ))}
                              </div>

                              {/* calculations */}
                              <div className="border-t-2 border-rose-200 pt-3 space-y-2">
                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 font-medium flex items-center gap-2">
                                    <ShoppingBag className="w-4 h-4" />
                                    Subtotal ({totalItems} treasures)
                                  </span>
                                  <span className="font-semibold">
                                    ₹{totalAmount.toLocaleString()}
                                  </span>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                  <span className="text-gray-600 font-medium flex items-center gap-2">
                                    <Truck className="w-4 h-4" />
                                    Delivery Charge
                                  </span>
                                  <span
                                    className={`font-semibold ${
                                      DELIVERY_CHARGE > 0
                                        ? "text-orange-600"
                                        : "text-green-600"
                                    }`}
                                  >
                                    {DELIVERY_CHARGE > 0
                                      ? `₹${DELIVERY_CHARGE}`
                                      : "FREE"}
                                  </span>
                                </div>

                                {/* free-delivery progress */}
                                {DELIVERY_CHARGE > 0 && (
                                  <div className="p-4 bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl border-2 border-orange-200">
                                    <div className="flex items-center justify-between text-xs text-orange-700 mb-2">
                                      <span className="font-bold flex items-center gap-1">
                                        <Gift className="w-4 h-4" />
                                        Free Delivery Progress
                                      </span>
                                      <span className="font-black">
                                        ₹{freeDeliveryGap} more
                                      </span>
                                    </div>
                                    <div className="bg-orange-200 h-3 rounded-full relative overflow-hidden">
                                      <div
                                        className="bg-gradient-to-r from-orange-400 to-yellow-500 h-full rounded-full transition-all duration-700 relative"
                                        style={{
                                          width: `${Math.min(
                                            (totalAmount / 500) * 100,
                                            100
                                          )}%`,
                                        }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
                                      </div>
                                    </div>
                                    <div className="text-xs text-orange-600 mt-2 text-center font-medium">
                                      {Math.round((totalAmount / 500) * 100)}%
                                      towards free delivery ✨
                                    </div>
                                  </div>
                                )}

                                {/* minimum-amount progress */}
                                {!hamperValidation.isValid && (
                                  <div className="p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-2xl border-2 border-red-200">
                                    <div className="flex items-center justify-between text-xs text-red-700 mb-2">
                                      <span className="font-bold flex items-center gap-1">
                                        <AlertCircle className="w-4 h-4" />
                                        Minimum Amount Progress
                                      </span>
                                      <span className="font-black">
                                        ₹{minimumAmountGap} more
                                      </span>
                                    </div>
                                    <div className="bg-red-200 h-3 rounded-full relative overflow-hidden">
                                      <div
                                        className="bg-gradient-to-r from-red-400 to-pink-500 h-full rounded-full transition-all duration-700"
                                        style={{
                                          width: `${Math.min(
                                            (totalAmount /
                                              MINIMUM_HAMPER_AMOUNT) *
                                              100,
                                            100
                                          )}%`,
                                        }}
                                      />
                                    </div>
                                    <div className="text-xs text-red-600 mt-2 text-center font-medium">
                                      {Math.round(
                                        (totalAmount / MINIMUM_HAMPER_AMOUNT) *
                                          100
                                      )}
                                      % towards minimum
                                    </div>
                                  </div>
                                )}

                                {/* grand total */}
                                <div className="flex justify-between items-center text-base sm:text-lg font-black pt-2 border-t-2 border-rose-200 bg-gradient-to-r from-pink-50 to-rose-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 rounded-b-2xl">
                                  <span className="text-gray-900 flex items-center gap-2">
                                    <Crown className="w-5 h-5 text-yellow-600" />
                                    Total Amount
                                  </span>
                                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">
                                    ₹
                                    {(
                                      totalAmount + DELIVERY_CHARGE
                                    ).toLocaleString()}
                                  </span>
                                </div>
                              </div>

                              {/* checkout button */}
                              <Button
                                className={`w-full mt-4 rounded-2xl py-3 text-xs sm:text-sm font-bold shadow-2xl transition-all duration-300 ${
                                  hamperValidation.isValid
                                    ? "bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 hover:shadow-green-200"
                                    : "bg-gray-400 cursor-not-allowed"
                                }`}
                                onClick={startCheckout}
                                disabled={
                                  !hamperValidation.isValid || isProcessing
                                }
                              >
                                <Sparkles className="w-4 h-4 mr-2" />
                                {hamperValidation.isValid
                                  ? "Proceed to Checkout"
                                  : `Add ₹${minimumAmountGap} More`}
                              </Button>

                              {/* validation message */}
                              <div className="mt-3 text-center">
                                <div
                                  className={`text-xs px-3 py-2 rounded-xl font-medium ${
                                    hamperValidation.isValid
                                      ? "bg-green-100 text-green-800 border border-green-200"
                                      : "bg-red-100 text-red-800 border border-red-200"
                                  }`}
                                >
                                  {hamperValidation.message}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        {/* Enhanced Checkout Modal - TheLoveCraft theme */}
        <AnimatePresence>
          {isCheckingOut && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center overflow-hidden p-3"
              onClick={() => !checkoutLoading && setIsCheckingOut(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: "100%", scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: "100%", scale: 0.9 }}
                transition={{ type: "spring", damping: 30, stiffness: 500 }}
                className="bg-white w-full max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl border-t-2 border-rose-200 sm:border-2 max-h-[95vh] flex flex-col overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Luxury Header */}
                <div className="relative flex-shrink-0 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white px-6 py-5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                        <Crown className="w-5 h-5 text-yellow-300" strokeWidth={2} />
                      </div>
                      <div>
                        <h2 className="text-xl font-black">Checkout Treasure Hamper</h2>
                        <p className="text-sm text-pink-100 mt-1">
                          Total: ₹
                          {(totalAmount + DELIVERY_CHARGE).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full hover:bg-white/20 text-white flex-shrink-0"
                      onClick={() =>
                        !checkoutLoading && setIsCheckingOut(false)
                      }
                    >
                      <X className="h-5 w-5" strokeWidth={2} />
                    </Button>
                  </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-6">
                  {/* Enhanced Hamper Summary */}
                  <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 mb-6 border-2 border-rose-200">
                    <h3 className="font-black text-gray-900 mb-4 text-base flex items-center gap-2">
                      <Gift className="w-4 h-4 text-rose-600" />
                      Custom Treasure Hamper ({totalItems} treasures)
                    </h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between items-center font-medium border-b-2 border-rose-200 pb-2">
                        <span className="flex items-center gap-2">
                          <Gem className="w-3 h-3 text-rose-500" />
                          Hamper Total
                        </span>
                        <span>₹{totalAmount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between items-center text-orange-600">
                        <span className="flex items-center gap-2">
                          <Truck className="w-3 h-3" />
                          Delivery
                        </span>
                        <span className="font-medium">{DELIVERY_CHARGE > 0 ? `₹${DELIVERY_CHARGE}` : "FREE"}</span>
                      </div>
                      <div className="flex justify-between items-center font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 pt-2">
                        <span className="text-gray-900 flex items-center gap-2">
                          <Crown className="w-4 h-4 text-yellow-600" />
                          Total Amount
                        </span>
                        <span>₹{(totalAmount + DELIVERY_CHARGE).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Form */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label
                        htmlFor="fullName"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <span>👤</span>
                        Full Name *
                      </Label>
                      <Input
                        id="fullName"
                        name="fullName"
                        placeholder="Enter your full name"
                        value={shippingAddress.fullName}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="phone"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <span>📱</span>
                        Phone Number *
                      </Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        placeholder="Enter your phone number"
                        value={shippingAddress.phone}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="address"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <span>🏠</span>
                        Address *
                      </Label>
                      <Input
                        id="address"
                        name="address"
                        placeholder="Enter your address"
                        value={shippingAddress.address}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label
                          htmlFor="city"
                          className="text-sm font-bold text-gray-700"
                        >
                          City *
                        </Label>
                        <Input
                          id="city"
                          name="city"
                          placeholder="City"
                          value={shippingAddress.city}
                          onChange={handleInputChange}
                          required
                          className="h-12 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label
                          htmlFor="state"
                          className="text-sm font-bold text-gray-700"
                        >
                          State *
                        </Label>
                        <Input
                          id="state"
                          name="state"
                          placeholder="State"
                          value={shippingAddress.state}
                          onChange={handleInputChange}
                          required
                          className="h-12 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="pinCode"
                        className="text-sm font-bold text-gray-700 flex items-center gap-2"
                      >
                        <span>📮</span>
                        PIN Code *
                      </Label>
                      <Input
                        id="pinCode"
                        name="pinCode"
                        placeholder="PIN Code"
                        value={shippingAddress.pinCode}
                        onChange={handleInputChange}
                        required
                        className="h-12 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                {/* Luxury payment buttons */}
                <div className="flex-shrink-0 bg-white border-t-2 border-rose-200 p-6 space-y-3">
                  {/* Pay Online Button */}
                  <Button
                    onClick={() => handlePaymentSelection("online")}
                    disabled={checkoutLoading}
                    className="w-full h-12 text-sm rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 font-bold text-white shadow-2xl hover:shadow-blue-200 transition-all duration-300"
                  >
                    {checkoutLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Lock className="w-4 h-4" />
                        Pay Online - ₹
                        {(totalAmount + DELIVERY_CHARGE).toLocaleString()}
                        {DELIVERY_CHARGE === 0 && totalAmount >= 500 && (
                          <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full">FREE DELIVERY</span>
                        )}
                      </div>
                    )}
                  </Button>

                  {/* Cash on Delivery Button */}
                  <Button
                    onClick={() => handlePaymentSelection("cod")}
                    disabled={checkoutLoading}
                    variant="outline"
                    className="w-full h-12 text-sm rounded-2xl border-2 border-green-500 text-green-700 hover:bg-green-500 hover:text-white font-bold shadow-2xl hover:shadow-green-200 transition-all duration-300"
                  >
                    {checkoutLoading ? (
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        Processing...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <Truck className="w-4 h-4" />
                        Cash on Delivery - ₹
                        {(totalAmount + DELIVERY_CHARGE).toLocaleString()}
                        <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">+₹80 DELIVERY</span>
                      </div>
                    )}
                  </Button>

                  <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-1 pt-2">
                    <Lock className="w-3 h-3" />
                    <span>Free Delivery on Online Payments ₹500+ • COD: ₹80 Charge ✨</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Phone Verification Modal */}
        <PhoneVerificationModal
          showPhoneVerification={phoneVerification.showPhoneVerification}
          phoneNumber={phoneVerification.phoneNumber}
          setPhoneNumber={phoneVerification.setPhoneNumber}
          otp={phoneVerification.otp}
          setOtp={phoneVerification.setOtp}
          otpInputRefs={phoneVerification.otpInputRefs}
          otpTimer={phoneVerification.otpTimer}
          showOTPInput={phoneVerification.showOTPInput}
          setShowOTPInput={phoneVerification.setShowOTPInput}
          isVerifyingPhone={phoneVerification.isVerifyingPhone}
          isVerifyingOTP={phoneVerification.isVerifyingOTP}
          handlePhoneVerification={phoneVerification.handlePhoneVerification}
          handleOTPVerification={phoneVerification.handleOTPVerification}
          handleResendOTP={phoneVerification.handleResendOTP}
          resetPhoneVerification={phoneVerification.resetPhoneVerification}
        />
      </div>
    </>
  );
};

export default CustomHamperBuilder;
