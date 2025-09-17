import React, { useState, useCallback, useMemo, useRef } from "react";
import { useWishlist } from "@/components/WishlistContext";
import { useCart } from "@/components/CartContext";
import { Button } from "@/components/ui/button";
import {
  Heart,
  Star,
  ShoppingCart,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Loader2,
  Crown,
  Gem,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/hooks/use-toast";

/* ========== Optimized Item ========== */
const OptimizedWishlistItem = React.memo(
  ({
    item,
    onRemove,
    onAddToCart,
    onNavigate,
  }: {
    item: any;
    onRemove: (productId: string) => void;
    onAddToCart: (product: any, quantity: number) => void;
    onNavigate: (productId: string) => void;
  }) => {
    const { updateQuantity } = useWishlist();
    const product = item.product;

    const [localQuantity, setLocalQuantity] = useState(item.quantity);
    const [isUpdating, setIsUpdating] = useState(false);
    const debounceRef = useRef<NodeJS.Timeout>();

    const debouncedUpdate = useCallback(
      (newQuantity: number) => {
        if (debounceRef.current) clearTimeout(debounceRef.current);

        debounceRef.current = setTimeout(async () => {
          setIsUpdating(true);
          try {
            if (newQuantity < 1) {
              onRemove(product._id);
            } else {
              await updateQuantity(product._id, newQuantity);
            }
          } catch (error) {
            setLocalQuantity(item.quantity);
            toast({
              title: "Error",
              description: "Failed to update quantity",
              variant: "destructive",
            });
          } finally {
            setIsUpdating(false);
          }
        }, 500);
      },
      [product._id, updateQuantity, onRemove, item.quantity]
    );

    const handleQuantityChange = useCallback(
      (change: number) => {
        const newQuantity = Math.max(0, localQuantity + change);
        setLocalQuantity(newQuantity);
        debouncedUpdate(newQuantity);
      },
      [localQuantity, debouncedUpdate]
    );

    const { originalPrice, discount } = useMemo(() => {
      const orig = Math.round(product.Product_price * 1.2);
      const disc = Math.round(((orig - product.Product_price) / orig) * 100);
      return { originalPrice: orig, discount: disc };
    }, [product.Product_price]);

    const handleProductClick = useCallback(() => {
      onNavigate(product._id);
    }, [product._id, onNavigate]);

    const handleAddToCartClick = useCallback(() => {
      onAddToCart(product, localQuantity);
    }, [product, localQuantity, onAddToCart]);

    const handleRemoveClick = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onRemove(product._id);
      },
      [product._id, onRemove]
    );

    return (
      <div className="group bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-rose-100 shadow-lg hover:shadow-rose-200/60 transition-all duration-500 overflow-hidden flex flex-col hover:-translate-y-1 pt-5">
        {/* Media */}
        <div
          className="relative aspect-square overflow-hidden cursor-pointer bg-gradient-to-br from-pink-50 via-white to-rose-50"
          onClick={handleProductClick}
        >
          <img
            src={product.Product_image?.[0] || "/placeholder-image.jpg"}
            alt={product.Product_name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* Quantity badge */}
          {localQuantity > 1 && (
            <div className="absolute top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-0.5 rounded-full shadow-lg">
              {localQuantity}
            </div>
          )}

          {/* Remove (heart filled) */}
          <Button
            variant="secondary"
            size="icon"
            type="button"
            className="absolute top-2 right-2 w-8 h-8 rounded-full bg-rose-500 border-rose-500 text-white hover:bg-rose-600 hover:border-rose-600 shadow-lg shadow-rose-200/60 z-10"
            onClick={handleRemoveClick}
            disabled={isUpdating}
            aria-label="Remove from wishlist"
          >
            <Heart className="w-[14px] h-[14px]" fill="currentColor" />
          </Button>

          {/* Shimmer */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-out" />
        </div>

        {/* Content */}
        <div className="p-3 flex-1 flex flex-col">
          {/* Title */}
          <h3
            className="font-bold text-sm md:text-base text-gray-900 line-clamp-2 leading-tight cursor-pointer hover:text-rose-700 transition-colors mb-2"
            onClick={handleProductClick}
          >
            {product.Product_name}
          </h3>

          {/* Pricing */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-lg md:text-xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">
              ₹{product.Product_price.toLocaleString()}
            </span>
            {discount > 0 && (
              <span className="text-xs text-gray-500 line-through">
                ₹{originalPrice.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity */}
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-rose-700 flex items-center gap-1">
              <Gem className="w-3 h-3" />
              Qty
            </span>
            <div className="flex items-center bg-rose-50 rounded-lg border-2 border-rose-200">
              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="w-8 h-8 p-0 hover:bg-rose-100 rounded-l-lg disabled:opacity-50"
                onClick={() => handleQuantityChange(-1)}
                disabled={isUpdating}
                aria-label="Decrease quantity"
              >
                <Minus className="w-3 h-3 text-rose-700" />
              </Button>

              <span className="px-3 py-1 text-sm font-bold min-w-[2rem] text-center relative text-gray-900">
                {localQuantity}
                {isUpdating && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                    <div className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
                  </div>
                )}
              </span>

              <Button
                variant="ghost"
                size="sm"
                type="button"
                className="w-8 h-8 p-0 hover:bg-rose-100 rounded-r-lg disabled:opacity-50"
                onClick={() => handleQuantityChange(1)}
                disabled={isUpdating || localQuantity >= 99}
                aria-label="Increase quantity"
              >
                <Plus className="w-3 h-3 text-rose-700" />
              </Button>
            </div>
          </div>

          {/* Add to cart */}
          <Button
            type="button"
            className="mt-auto w-full rounded-xl py-3 text-sm font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white hover:from-pink-700 hover:via-rose-700 hover:to-red-800 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-rose-200/60 disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleAddToCartClick}
            disabled={isUpdating || !product.Product_available}
          >
            {isUpdating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ShoppingCart className="w-4 h-4 mr-2" />
            )}
            {!product.Product_available
              ? "Out of Stock"
              : `Add ${localQuantity > 1 ? `${localQuantity} ` : ""}to Cart`}
          </Button>
        </div>
      </div>
    );
  }
);
OptimizedWishlistItem.displayName = "OptimizedWishlistItem";

/* ========== Wishlist Page ========== */
const WishlistPage: React.FC = () => {
  const {
    wishlist,
    clearWishlist,
    removeFromWishlist,
    getTotalItems,
    getTotalUniqueItems,
    loading,
  } = useWishlist();
  const { addToCart } = useCart();
  const navigate = useNavigate();

  const handleAddToCart = useCallback(
    (product: any, quantity: number) => {
      try {
        const cartProduct = {
          id: Math.floor(Math.random() * 1000000),
          _id: product._id,
          name: product.Product_name,
          price: `₹${product.Product_price}`,
          originalPrice: `₹${Math.round(product.Product_price * 1.2)}`,
          image: product.Product_image?.[0] || "/placeholder-image.jpg",
          isNew: false,
          quantity,
          Product_name: product.Product_name,
          Product_price: product.Product_price,
          Product_image: product.Product_image,
        };

        addToCart(cartProduct);

        toast({
          title: "Added to cart",
          description: `${quantity} x ${product.Product_name} added to cart`,
          duration: 2000,
        });
      } catch (error) {
        console.error("Error adding to cart:", error);
        toast({
          title: "Error",
          description: "Could not add to cart",
          variant: "destructive",
        });
      }
    },
    [addToCart]
  );

  const handleRemove = useCallback(
    (productId: string) => {
      removeFromWishlist(productId);
      toast({
        title: "Removed from wishlist",
        description: "Item has been removed",
        duration: 2000,
      });
    },
    [removeFromWishlist]
  );

  const handleNavigate = useCallback(
    (productId: string) => {
      navigate(`/product/${productId}`);
    },
    [navigate]
  );

  const handleClearWishlist = useCallback(() => {
    clearWishlist();
    toast({
      title: "Wishlist cleared",
      description: "All items have been removed from your wishlist",
      duration: 2000,
    });
  }, [clearWishlist]);

  const totalItems = useMemo(() => getTotalItems(), [getTotalItems]);
  const totalUniqueItems = useMemo(
    () => getTotalUniqueItems(),
    [getTotalUniqueItems]
  );

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50">
        <div className="bg-white/85 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-rose-100">
          <Loader2 className="w-14 h-14 text-rose-500 mx-auto mb-5 animate-spin" />
          <h2 className="text-xl font-black text-center text-gray-800">
            Loading your wishlist...
          </h2>
        </div>
      </div>
    );
  }

  // Empty state
  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 text-center px-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-10 shadow-2xl border-2 border-rose-100">
          <Sparkles className="w-14 h-14 text-rose-600 mx-auto mb-5" />
          <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 mb-4">
            Your Wishlist is Empty
          </h2>
          <p className="text-base text-rose-700 mb-6 max-w-md mx-auto">
            Discover our handcrafted treasures and add your favorites to the wishlist.
          </p>
          <Button
            onClick={() => navigate("/")}
            size="lg"
            type="button"
            className="rounded-full px-10 py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 shadow-lg hover:shadow-rose-200/60 transition-all duration-300"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Continue Shopping
          </Button>
        </div>
      </div>
    );
  }

  // Main
  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 via-white to-rose-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-bold mb-3 border border-rose-200">
              <Heart className="w-4 h-4" fill="currentColor" />
              <span className="flex items-center gap-2">
                <span>
                  {totalUniqueItems} {totalUniqueItems === 1 ? "Item" : "Items"}
                </span>
                <span className="text-rose-400">•</span>
                <span>{totalItems} Total Qty</span>
              </span>
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">
              Your Wishlist
            </h2>
          </div>

          {wishlist.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              type="button"
              onClick={handleClearWishlist}
              className="border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
              disabled={loading}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Clear All
            </Button>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6 lg:gap-8">
          {wishlist.map((item) => (
            <OptimizedWishlistItem
              key={item.product._id}
              item={item}
              onRemove={handleRemove}
              onAddToCart={handleAddToCart}
              onNavigate={handleNavigate}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default React.memo(WishlistPage);
