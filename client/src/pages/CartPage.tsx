import React, { useState, useEffect } from "react";
import { useCart } from "../components/CartContext";
import { Button } from "../components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/components/AuthContext";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/utils/axiosConfig";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Minus,
  Plus,
  Trash2,
  ShoppingBag,
  Truck,
  Lock,
  Crown,
  Gem,
  Star,
  Sparkles,
  Shield,
} from "lucide-react";

// Phone verification + payment hooks
import { usePhoneVerification } from "@/hooks/usePhoneVerification";
import { usePaymentProcessing } from "@/hooks/usePaymentProcessing";
import PhoneVerificationModal from "@/components/PhoneVerificationModal";

const CartPage = () => {
  const { cart, removeCart, clearCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const phoneVerification = usePhoneVerification();
  const { checkoutLoading, processPayment } = usePaymentProcessing();

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"cod" | "online" | null>(null);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: "",
    address: "",
    city: "",
    state: "",
    pinCode: "",
    phone: "",
  });

  const getProductId = (item: any) => item._id || item.id;
  const totalPrice = getCartTotal();

  // Dynamic delivery charge with rule: Online => free if >= 500; COD => always 80
  const getDeliveryCharge = (paymentMethod: "cod" | "online" | null = selectedPaymentMethod) => {
    if (paymentMethod === "online") {
      return totalPrice >= 500 ? 0 : 80;
    } else {
      return 80;
    }
  };

  const DELIVERY_CHARGE = getDeliveryCharge();
  const freeDeliveryGap =
    selectedPaymentMethod === "online" ? Math.max(0, 500 - totalPrice) : null;

  // Phone verification success
  useEffect(() => {
    if (phoneVerification.phoneVerified) {
      setShippingAddress((prev) => ({
        ...prev,
        phone: phoneVerification.phoneNumber,
      }));
      setIsCheckingOut(true);
    }
  }, [phoneVerification.phoneVerified, phoneVerification.phoneNumber]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleQuantityChange = (productId: number | string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeCart(productId);
      toast({
        title: "Removed",
        description: "Item removed from cart",
        variant: "default",
      });
    } else {
      updateQuantity(productId, newQuantity);
    }
  };

  const handleProductClick = (productId: number | string) => {
    const id = typeof productId === "string" ? productId : productId.toString();
    navigate(`/product/${id}`);
  };

  const startCheckout = () => {
    if (!user) {
      toast({
        title: "Please login",
        description: "Login required to proceed with checkout",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (cart.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Add items to your cart before checkout",
        variant: "destructive",
      });
      return;
    }

    phoneVerification.setShowPhoneVerification(true);
  };

  const handlePaymentSelection = async (paymentMethod: "cod" | "online") => {
    const requiredFields = ["fullName", "address", "city", "state", "pinCode", "phone"];
    const missingFields = requiredFields.filter((f) => !shippingAddress[f].trim());

    if (missingFields.length > 0) {
      toast({
        title: "Missing Information",
        description: "Please fill in all shipping address fields",
        variant: "destructive",
      });
      return;
    }

    if (!phoneVerification.phoneVerified) {
      toast({
        title: "Phone Not Verified",
        description: "Please verify your phone number first",
        variant: "destructive",
      });
      return;
    }

    const orderItems = cart.map((item) => ({
      productId: item._id || item.id,
      quantity: item.quantity || 1,
      price: parseFloat(String(item.price).replace(/[^0-9.-]+/g, "")),
      name: item.name || item.Product_name,
      image: item.image || (item.Product_image && item.Product_image[0]),
    }));

    const deliveryCharge = getDeliveryCharge(paymentMethod);

    const success = await processPayment(
      orderItems,
      shippingAddress,
      paymentMethod,
      {
        itemsTotal: totalPrice,
        deliveryCharge,
        totalAmount: totalPrice + deliveryCharge,
      },
      "cart"
    );

    if (success) {
      clearCart();
      setIsCheckingOut(false);
      setSelectedPaymentMethod(null);
      phoneVerification.resetPhoneVerification();
    }
  };

  const handlePaymentMethodSelect = (method: "cod" | "online") => {
    setSelectedPaymentMethod(method);
  };

  const getItemTotal = (item: any) => {
    if (!item || !item.price) return 0;
    const priceString = typeof item.price === "string" ? item.price : String(item.price);
    const priceNumber = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
    if (isNaN(priceNumber)) return 0;
    const quantity = item.quantity || 1;
    return priceNumber * quantity;
  };

  const getItemUnitPrice = (item: any) => {
    if (!item || !item.price) return 0;
    const priceString = typeof item.price === "string" ? item.price : String(item.price);
    const priceNumber = parseFloat(priceString.replace(/[^0-9.-]+/g, ""));
    return isNaN(priceNumber) ? 0 : priceNumber;
  };

  // Empty state
  if (cart.length === 0) {
    return (
      <>
        <style>{`
          body, html { overflow-x: hidden !important; max-width: 100vw !important; }
        `}</style>

        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 px-2 pt-16 pb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center w-full max-w-xs"
          >
            <div className="bg-white p-5 sm:p-6 rounded-2xl shadow-2xl border-2 border-rose-100">
              <div className="mx-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-pink-100 to-rose-100 border border-rose-200 flex items-center justify-center mb-3 sm:mb-4">
                <ShoppingBag className="h-7 w-7 sm:h-8 sm:w-8 text-rose-600" />
              </div>
              <h1 className="text-lg sm:text-xl font-black mb-2 text-gray-900">
                Your Treasure Cart is Empty
              </h1>
              <p className="text-rose-600 mb-4 text-xs sm:text-sm">
                Discover handcrafted treasures and add them to your cart ✨
              </p>
              <Button
                onClick={() => navigate("/")}
                className="w-full rounded-full px-4 py-2 sm:py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-xs sm:text-sm font-bold shadow-lg"
              >
                Explore Collection
              </Button>
            </div>
          </motion.div>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
        body, html { 
          overflow-x: hidden !important; 
          max-width: 100vw !important;
        }
        * { box-sizing: border-box; }
        @media (max-width: 375px) {
          .container { padding-left: 8px; padding-right: 8px; }
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-16 pb-6 px-2 xs:px-3 overflow-x-hidden">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-4 sm:mb-6"
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-4 py-2 rounded-full text-xs font-bold mb-3 border border-rose-200">
              <Crown className="w-4 h-4" />
              Handpicked Treasures
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-lg sm:text-2xl md:text-3xl font-black text-gray-900 mb-1 sm:mb-2">
              Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">Cart</span>
            </h1>
            <p className="text-rose-600 text-xs sm:text-sm font-medium">
              {cart.length} {cart.length === 1 ? "item" : "items"} ready for checkout
            </p>
          </motion.div>

          {/* Dynamic banners */}
          {selectedPaymentMethod === "online" && freeDeliveryGap !== null && freeDeliveryGap > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-orange-50 to-yellow-50 border-2 border-orange-200 rounded-xl p-3 mb-4 shadow-sm"
            >
              <div className="flex items-center justify-center gap-2 text-orange-700 text-xs sm:text-sm">
                <Truck className="w-4 h-4" />
                <span className="font-semibold">
                  Add ₹{freeDeliveryGap} more for FREE DELIVERY (Online Payment)
                </span>
              </div>
              <div className="mt-2 bg-orange-200 h-2 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-yellow-500 transition-all duration-500"
                  style={{ width: `${Math.min((totalPrice / 500) * 100, 100)}%` }}
                />
              </div>
            </motion.div>
          )}

          {selectedPaymentMethod === "cod" && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-3 mb-4 shadow-sm"
            >
              <div className="flex items-center justify-center gap-2 text-blue-700 text-xs sm:text-sm">
                <Truck className="w-4 h-4" />
                <span className="font-semibold">
                  Cash on Delivery selected: ₹80 delivery charge applies
                </span>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-xl border-2 border-rose-100 p-2 sm:p-3 md:p-4">
                <div className="space-y-2 sm:space-y-3">
                  {cart.map((item, index) => (
                    <motion.div
                      key={`${getProductId(item)}-${index}`}
                      initial={{ opacity: 0, y: 18 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 border border-rose-100 rounded-lg hover:shadow-sm transition-all duration-200"
                    >
                      {/* Product Image */}
                      <div className="w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20 flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name || item.Product_name}
                          className="w-full h-full object-cover rounded-md cursor-pointer hover:opacity-90 transition"
                          onClick={() => handleProductClick(getProductId(item))}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = "/placeholder-product.jpg";
                          }}
                        />
                      </div>

                      {/* Product Info */}
                      <div className="flex-grow min-w-0">
                        <div className="space-y-1 sm:space-y-2">
                          {/* Name */}
                          <div className="min-w-0">
                            <h3
                              className="text-xs sm:text-sm md:text-base font-semibold text-gray-900 line-clamp-2 cursor-pointer hover:text-rose-600 transition-colors leading-tight"
                              onClick={() => handleProductClick(getProductId(item))}
                            >
                              {item.name || item.Product_name}
                            </h3>
                          </div>

                          {/* Price, Qty, Total */}
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Gem className="w-3 h-3 text-rose-500" />
                              <span className="text-[10px] sm:text-xs text-gray-500">Unit Price:</span>
                              <span className="text-xs sm:text-sm font-semibold text-rose-700">
                                ₹{getItemUnitPrice(item).toLocaleString()}
                              </span>
                            </div>

                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] sm:text-xs text-gray-500">Qty:</span>
                                <div className="flex items-center border-2 border-rose-200 rounded-md bg-rose-50">
                                  <button
                                    className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-l-md hover:bg-rose-200 transition"
                                    onClick={() =>
                                      handleQuantityChange(
                                        getProductId(item),
                                        (item.quantity || 1) - 1
                                      )
                                    }
                                    aria-label="Decrease quantity"
                                  >
                                    <Minus className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-rose-600" />
                                  </button>
                                  <span className="w-6 sm:w-8 text-center text-xs sm:text-sm font-medium text-gray-900">
                                    {item.quantity || 1}
                                  </span>
                                  <button
                                    className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center rounded-r-md hover:bg-rose-200 transition"
                                    onClick={() =>
                                      handleQuantityChange(
                                        getProductId(item),
                                        (item.quantity || 1) + 1
                                      )
                                    }
                                    aria-label="Increase quantity"
                                  >
                                    <Plus className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-rose-600" />
                                  </button>
                                </div>
                              </div>

                              <div className="flex flex-col items-end">
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                                  <span className="text-[10px] sm:text-xs text-gray-500">Total:</span>
                                </div>
                                <span className="text-sm sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600">
                                  ₹{getItemTotal(item).toLocaleString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Remove */}
                          <div className="flex justify-end pt-1">
                            <button
                              className="flex items-center gap-1 px-2 py-1 text-[10px] sm:text-xs text-red-500 hover:bg-red-50 rounded-md transition-colors border border-red-200 hover:border-red-300"
                              onClick={() => {
                                removeCart(getProductId(item));
                                toast({
                                  title: "Removed",
                                  description: "Item removed from cart",
                                  variant: "default",
                                });
                              }}
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span className="hidden sm:inline">Remove</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                {/* Cart actions */}
                <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t-2 border-rose-100 space-y-2">
                  <Button
                    variant="outline"
                    className="w-full rounded-full px-3 py-2 border-2 border-rose-300 text-rose-700 hover:bg-rose-50 hover:border-rose-400 text-xs sm:text-sm font-bold"
                    onClick={() => navigate("/")}
                  >
                    Continue Shopping
                  </Button>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="destructive"
                      className="flex-1 rounded-full px-3 py-2 text-xs sm:text-sm bg-red-500 hover:bg-red-600"
                      onClick={() => {
                        clearCart();
                        setSelectedPaymentMethod(null);
                        toast({
                          title: "Cart cleared",
                          description: "All treasures removed from your cart",
                          variant: "default",
                        });
                      }}
                    >
                      Clear Cart
                    </Button>
                    <Button
                      className="flex-1 rounded-full px-3 py-2 text-xs sm:text-sm font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 shadow-lg hover:shadow-rose-200"
                      onClick={() => startCheckout()}
                      disabled={cart.length === 0}
                    >
                      Checkout
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-xl border-2 border-rose-100 p-3 sm:p-4 sticky top-20">
                <h2 className="text-base sm:text-lg font-black text-gray-900 mb-3 flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-rose-600" />
                  Order Summary
                </h2>

                {/* Payment method */}
                <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                  <h3 className="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-rose-600" />
                    Select Payment Method
                  </h3>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="online"
                        checked={selectedPaymentMethod === "online"}
                        onChange={() => handlePaymentMethodSelect("online")}
                        className="accent-rose-600"
                      />
                      <span className="text-sm text-gray-800">Online Payment (UPI/Cards/Wallets)</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value="cod"
                        checked={selectedPaymentMethod === "cod"}
                        onChange={() => handlePaymentMethodSelect("cod")}
                        className="accent-rose-600"
                      />
                      <span className="text-sm text-gray-800">Cash on Delivery</span>
                    </label>
                  </div>
                </div>

                {/* Items list */}
                <div className="space-y-1.5 mb-4 max-h-32 sm:max-h-40 overflow-y-auto">
                  {cart.map((item, index) => (
                    <div
                      key={`summary-${getProductId(item)}-${index}`}
                      className="flex justify-between items-start text-xs sm:text-sm py-1"
                    >
                      <div className="flex-1 min-w-0 mr-2">
                        <div className="font-medium text-gray-700 truncate leading-tight">
                          {item.name || item.Product_name}
                        </div>
                        <div className="text-[10px] sm:text-xs text-rose-600 mt-0.5 flex items-center gap-1">
                          <Gem className="w-3 h-3" />
                          ₹{getItemUnitPrice(item).toLocaleString()} × {item.quantity || 1}
                        </div>
                      </div>
                      <div className="font-semibold text-rose-700 flex-shrink-0">
                        ₹{getItemTotal(item).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Calculations */}
                <div className="border-t-2 border-rose-100 pt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">
                      Subtotal ({cart.reduce((sum, i) => sum + (i.quantity || 1), 0)} items)
                    </span>
                    <span className="font-semibold">₹{totalPrice.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-700 font-medium">Delivery Charge</span>
                    <span
                      className={`font-semibold ${
                        DELIVERY_CHARGE > 0
                          ? selectedPaymentMethod === "cod"
                            ? "text-blue-700"
                            : "text-orange-600"
                          : "text-green-600"
                      }`}
                    >
                      {DELIVERY_CHARGE > 0 ? `₹${DELIVERY_CHARGE}` : "FREE"}
                    </span>
                  </div>

                  {selectedPaymentMethod === "online" &&
                    DELIVERY_CHARGE > 0 &&
                    freeDeliveryGap !== null && (
                      <div className="py-2 px-3 bg-orange-50 rounded-lg border border-orange-100">
                        <div className="flex items-center justify-between text-xs text-orange-700 mb-1">
                          <span className="font-medium">Free Delivery Progress</span>
                          <span className="font-bold">₹{freeDeliveryGap} more</span>
                        </div>
                        <div className="bg-orange-200 h-2 rounded-full relative overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-orange-500 h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((totalPrice / 500) * 100, 100)}%`,
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-orange-600 mt-1 text-center">
                          {Math.round((totalPrice / 500) * 100)}% towards free delivery
                        </div>
                      </div>
                    )}

                  {selectedPaymentMethod === "cod" && (
                    <div className="py-2 px-3 bg-blue-50 rounded-lg border border-blue-100">
                      <div className="text-xs text-blue-700 text-center">
                        <span className="font-medium">Cash on Delivery</span>
                        <br />
                        <span className="text-[10px]">₹80 delivery charge applies for COD</span>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center text-base sm:text-lg font-black pt-2 border-t-2 border-rose-100 bg-gradient-to-r from-pink-50 to-rose-50 -mx-3 sm:-mx-4 px-3 sm:px-4 py-2 rounded-b-xl">
                    <span className="text-gray-900 flex items-center gap-2">
                      <Crown className="w-5 h-5 text-yellow-600" />
                      Total Amount
                    </span>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">
                      ₹{(totalPrice + DELIVERY_CHARGE).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Quick Checkout trigger */}
                <Button
                  className="w-full mt-4 rounded-2xl py-3 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600 hover:from-green-700 hover:via-emerald-700 hover:to-teal-700 text-xs sm:text-sm font-bold shadow-xl hover:shadow-green-200"
                  onClick={() => startCheckout()}
                  disabled={cart.length === 0}
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Proceed to Checkout
                </Button>

                <div className="text-center text-[11px] text-gray-500 flex items-center justify-center gap-2 mt-2">
                  <Lock className="w-3 h-3" />
                  <span>Secure • Encrypted • UPI • Cards • Net Banking</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>


      {/* Checkout Modal */}
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
              initial={{ opacity: 0, y: "100%", scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: "100%", scale: 0.95 }}
              transition={{ type: "spring", damping: 28, stiffness: 500 }}
              className="bg-white w-full max-w-lg mx-auto rounded-t-3xl sm:rounded-3xl shadow-2xl border-2 border-rose-200 max-h-[95vh] flex flex-col overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="relative flex-shrink-0 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white px-6 py-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center border border-white/30">
                      <Crown className="w-5 h-5 text-yellow-300" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black">Checkout</h2>
                      <p className="text-sm text-pink-100 mt-1">
                        Total: ₹{(totalPrice + getDeliveryCharge(selectedPaymentMethod)).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-10 w-10 rounded-full hover:bg-white/20 text-white"
                    onClick={() => !checkoutLoading && setIsCheckingOut(false)}
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-2xl p-5 mb-6 border-2 border-rose-200">
                  <h3 className="font-black text-gray-900 mb-4 text-base flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-rose-600" />
                    Order Summary ({cart.length} items)
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between items-center font-medium border-b-2 border-rose-200 pb-2">
                      <span>Subtotal</span>
                      <span>₹{totalPrice.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-rose-700">
                      <span>Delivery</span>
                      <span className="font-medium">
                        {getDeliveryCharge(selectedPaymentMethod) > 0
                          ? `₹${getDeliveryCharge(selectedPaymentMethod)}`
                          : "FREE"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center font-black text-base text-transparent bg-clip-text bg-gradient-to-r from-rose-600 to-pink-600 pt-2">
                      <span className="text-gray-900">Total Amount</span>
                      <span>
                        ₹{(totalPrice + getDeliveryCharge(selectedPaymentMethod)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address form */}
                <form className="grid grid-cols-1 gap-4">
                  <div className="space-y-1">
                    <Label htmlFor="fullName" className="text-xs font-bold text-gray-700">
                      Full Name *
                    </Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      placeholder="Enter your full name"
                      value={shippingAddress.fullName}
                      onChange={handleInputChange}
                      required
                      className="h-11 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="phone" className="text-xs font-bold text-gray-700">
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
                      className="h-11 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="address" className="text-xs font-bold text-gray-700">
                      Address *
                    </Label>
                    <Input
                      id="address"
                      name="address"
                      placeholder="Enter your address"
                      value={shippingAddress.address}
                      onChange={handleInputChange}
                      required
                      className="h-11 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label htmlFor="city" className="text-xs font-bold text-gray-700">
                        City *
                      </Label>
                      <Input
                        id="city"
                        name="city"
                        placeholder="City"
                        value={shippingAddress.city}
                        onChange={handleInputChange}
                        required
                        className="h-11 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="state" className="text-xs font-bold text-gray-700">
                        State *
                      </Label>
                      <Input
                        id="state"
                        name="state"
                        placeholder="State"
                        value={shippingAddress.state}
                        onChange={handleInputChange}
                        required
                        className="h-11 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <Label htmlFor="pinCode" className="text-xs font-bold text-gray-700">
                      PIN Code *
                    </Label>
                    <Input
                      id="pinCode"
                      name="pinCode"
                      placeholder="PIN Code"
                      value={shippingAddress.pinCode}
                      onChange={handleInputChange}
                      required
                      className="h-11 text-sm border-2 border-rose-200 focus:border-rose-500 focus:ring-rose-500 rounded-xl"
                    />
                  </div>
                </form>
              </div>

              {/* Bottom buttons */}
              <div className="flex-shrink-0 bg-white border-t-2 border-rose-200 p-6 space-y-3">
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
                      {(totalPrice + getDeliveryCharge("online")).toLocaleString()}
                      {getDeliveryCharge("online") === 0 && totalPrice >= 500 && (
                        <span className="text-xs bg-green-500 px-2 py-0.5 rounded-full ml-1">FREE DELIVERY</span>
                      )}
                    </div>
                  )}
                </Button>

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
                      {(totalPrice + getDeliveryCharge("cod")).toLocaleString()}
                      <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full ml-1">+₹80 DELIVERY</span>
                    </div>
                  )}
                </Button>

                <div className="text-center text-xs text-gray-500 flex items-center justify-center gap-2">
                  <Lock className="w-3 h-3" />
                  <span>Free Delivery on Online Payments ₹500+ • COD: ₹80 charge</span>
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
    </>
  );
};

export default CartPage;
