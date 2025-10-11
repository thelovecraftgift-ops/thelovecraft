import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  ShoppingCart,
  Gift,
  User,
  Menu,
  X,
  LayoutDashboard,
  Heart,
  Crown,
  ArrowRight,
  Star
} from "lucide-react";
import { useAuth } from "@/components/AuthContext";
import { useCart } from "./CartContext";
import { useWishlist } from "./WishlistContext";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import Fuse from "fuse.js";
import { TokenManager } from "@/utils/tokenManager";
import LOVECRAFTLOGO from "../utils/final.png";

const Header = () => {
  const [logoError, setLogoError] = useState(false);
  const [menuLogoError, setMenuLogoError] = useState(false);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [recentSearches, setRecentSearches] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [products, setProducts] = useState<any[]>([]);
  const [productsLoading, setProductsLoading] = useState(true);

  const profileMenuRef = useRef<HTMLDivElement | null>(null);
  const searchResultsRef = useRef<HTMLDivElement | null>(null);
  const lastScrollY = useRef(0);
  const searchTimeoutRef = useRef<any>(null);

  const { user, logout, isAuthenticated } = useAuth();
  const { cart } = useCart();
  const { getTotalItems } = useWishlist();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  const navigationItems = [
    {
      name: "Personalized Gifts",
      href: "/custom-hamper",
      icon: <Gift className="w-5 h-5" />,
      description: "Create unique gifts for special moments",
      color:
        "text-rose-700 bg-gradient-to-br from-pink-50 to-rose-50 hover:from-pink-100 hover:to-rose-100",
      highlight: true,
      badge: "New",
    },
  ];

  const totalQuantity = useMemo(
    () => cart?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0,
    [cart]
  );

  const totalWishlistItems = useMemo(
    () => (getTotalItems ? getTotalItems() : 0),
    [getTotalItems]
  );

  const fuseOptions = useMemo(
    () => ({
      keys: [
        { name: "Product_name", weight: 0.7 },
        { name: "Product_category.category", weight: 0.2 },
        { name: "Product_discription", weight: 0.1 },
      ],
      threshold: 0.5,
      minMatchCharLength: 2,
      includeScore: true,
      includeMatches: true,
      ignoreLocation: true,
      findAllMatches: false,
      shouldSort: true,
      isCaseSensitive: false,
      distance: 100,
    }),
    []
  );

  const fuse = useMemo(
    () => (products.length ? new Fuse(products, fuseOptions) : null),
    [products, fuseOptions]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("recentSearches");
      if (saved) {
        const parsed = JSON.parse(saved);
        setRecentSearches(Array.isArray(parsed) ? parsed.slice(0, 5) : []);
      }
    } catch {
      setRecentSearches([]);
    }
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setProductsLoading(true);
      try {
        const API_URL =
          import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";
        const response = await fetch(`${API_URL}/api/getproducts`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProducts(Array.isArray(data.products) ? data.products : []);
      } catch {
        setProducts([]);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [toast]);

  const performSearch = useCallback(
    async (query: string) => {
      if (!query.trim() || !fuse) {
        setSearchResults([]);
        setShowSearchResults(false);
        return;
      }
      setIsSearching(true);
      setShowSearchResults(true);
      try {
        const results = fuse
          .search(query)
          .slice(0, 6)
          .map((r: any) => ({ ...r.item, score: r.score, matches: r.matches }));
        setSearchResults(results);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    },
    [fuse]
  );

  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.trim()) performSearch(searchQuery);
      else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [searchQuery, performSearch]);

  const handleSearch = useCallback(
    (e: any) => {
      e.preventDefault();
      if (!searchQuery.trim()) return;
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchResults(false);
      setIsMobileSearchOpen(false);
      setIsMobileMenuOpen(false);
    },
    [searchQuery, navigate]
  );

  const handleProductClick = useCallback(
    (productId: string) => {
      navigate(`/product/${productId}`);
      setShowSearchResults(false);
      setIsMobileSearchOpen(false);
      setSearchQuery("");
      setIsMobileMenuOpen(false);
    },
    [navigate]
  );

  const handleLogout = useCallback(() => {
    logout();
    toast({ title: "See you soon! ✨", description: "Thanks for visiting TheLoveCraft!" });
    navigate("/");
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
  }, [logout, toast, navigate]);

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setIsProfileMenuOpen(false);
      }
      if (searchResultsRef.current && !searchResultsRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setShowNavbar(currentScrollY <= lastScrollY.current || currentScrollY <= 60);
      lastScrollY.current = currentScrollY;
    };
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, { passive: true } as any);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow =
      isMobileMenuOpen || isMobileSearchOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen, isMobileSearchOpen]);

  useEffect(() => {
    const checkAdminStatus = () => {
      const adminToken = TokenManager.getToken("admin");
      const userRole =
        user?.role === "admin" ||
        localStorage.getItem("user_role") === "admin" ||
        (() => {
          try {
            const parsedAdmin = JSON.parse(
              localStorage.getItem("admin_user") || "{}"
            );
            return parsedAdmin?.role === "admin";
          } catch {
            return false;
          }
        })();
      setIsAdmin(Boolean(adminToken) && Boolean(userRole));
    };
    checkAdminStatus();
    window.addEventListener("storage", checkAdminStatus);
    return () => window.removeEventListener("storage", checkAdminStatus);
  }, [user]);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: showNavbar ? 0 : -100 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 left-0 right-0 z-50 shadow-xl"
      >
        {/* Header gradient */}
        <div
          className="backdrop-blur-xl border-b border-rose-300/50"
          style={{
            background:
              "linear-gradient(90deg, #e91e63, #c2185b 45%, #b71c1c)",
          }}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-18 lg:h-20 gap-4">
              {/* Logo with solid #ec0075 behind image area only */}
              <motion.div
                className="flex-shrink-0 relative"
                whileHover={{ scale: 1.05, rotate: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15 }}
              >
                <button
                  onClick={() => navigate("/")}
                  className="flex items-center focus:outline-none group relative"
                  aria-label="Go to homepage"
                >
                  <div className="relative inline-block">
                    <div
                      aria-hidden
                      className="absolute inset-0 rounded-md"
                      // style={{ background: "#ec0075", opacity: 1, zIndex: 0 }}
                    />
                    {!logoError ? (
                      <img
                        src={LOVECRAFTLOGO}
                        alt="TheLoveCraft Logo"
                        className="relative z-[1] h-16 w-auto lg:h-16 object-contain "
                        onError={() => setLogoError(true)}
                        draggable={true}
                        style={{ padding: "2px" }}
                      />
                    ) : (
                      <Crown className="relative z-[1] h-12 w-12 lg:h-16 lg:w-16 text-yellow-300" strokeWidth={1.5} />
                    )}
                  </div>
                </button>
              </motion.div>

              {/* Search */}
              <div className="hidden md:flex flex-1 max-w-xl mx-6 relative" ref={searchResultsRef}>
                <div className="w-full relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className="h-5 w-5 text-rose-400 z-10" strokeWidth={1.5} />
                  </div>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch(e)}
                    onFocus={() => searchQuery && setShowSearchResults(true)}
                    placeholder="Search for handcrafted treasures..."
                    className="w-full pl-12 pr-4 py-3.5 text-base bg-white/92 backdrop-blur-sm border-2 border-rose-100/70 rounded-2xl focus:ring-4 focus:ring-rose-300/20 focus:border-rose-300 focus:bg-white transition-all duration-300 placeholder-rose-400 shadow-lg hover:shadow-xl"
                  />
                  <AnimatePresence>
                    {showSearchResults && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        className="absolute top-full mt-3 bg-white/95 backdrop-blur-xl border-2 border-rose-200/50 rounded-2xl w-full z-50 shadow-2xl max-h-96 overflow-hidden"
                      >
                        {isSearching ? (
                          <div className="p-8 text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-3 border-rose-500 mx-auto"></div>
                            <p className="text-sm text-rose-600 mt-3 font-medium">Discovering treasures...</p>
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="p-4 max-h-80 overflow-y-auto">
                            <div className="grid gap-2">
                              {searchResults.map((product: any) => (
                                <button
                                  key={product._id}
                                  onClick={() => handleProductClick(product._id)}
                                  className="w-full p-4 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 rounded-xl transition-all duration-300 flex items-center space-x-4 border border-transparent hover:border-rose-200 hover:shadow-lg group"
                                >
                                  <div className="w-14 h-14 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow flex-shrink-0">
                                    <img
                                      src={product.Product_image?.[0] || "/api/placeholder/56/56"}
                                      alt={product.Product_name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/api/placeholder/56/56"; }}
                                    />
                                  </div>
                                  <div className="flex-1 text-left min-w-0">
                                    <h4 className="font-bold text-gray-900 truncate text-base group-hover:text-rose-700">
                                      {product.Product_name}
                                    </h4>
                                    <p className="text-rose-600 font-bold text-sm mt-1">
                                      ₹{product.Product_price?.toLocaleString()}
                                    </p>
                                  </div>
                                  <ArrowRight className="w-5 h-5 text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ))}
                            </div>
                            <button
                              onClick={(e) => handleSearch(e)}
                              className="w-full mt-4 p-3 bg-gradient-to-r from-rose-500 to-pink-500 text-white font-bold rounded-xl hover:from-rose-600 hover:to-pink-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                            >
                              View all results for "{searchQuery}"
                            </button>
                          </div>
                        ) : searchQuery && !isSearching ? (
                          <div className="p-8 text-center">
                            <Crown className="mx-auto h-12 w-12 text-rose-300 mb-4" strokeWidth={1.5} />
                            <h3 className="text-lg font-bold text-rose-800 mb-2">No treasures found</h3>
                            <p className="text-rose-600 text-sm">Try different keywords to discover amazing pieces</p>
                          </div>
                        ) : null}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Right Section */}
              <div className="flex items-center space-x-3">
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="md:hidden p-3 text-white hover:text-pink-200 transition-colors rounded-2xl hover:bg-white/10" onClick={() => setIsMobileSearchOpen(true)} aria-label="Search">
                  <Search size={20} strokeWidth={1.5} />
                </motion.button>

                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:flex relative p-3 text-white hover:text-pink-200 transition-colors rounded-2xl hover:bg-white/10 border-2 border-white/20 hover:border-white/30" onClick={() => navigate("/wishlist")} aria-label="Wishlist">
                  <Heart size={20} strokeWidth={1.5} />
                  {totalWishlistItems > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-1 -right-1 inline-flex items-center justify-center w-6 h-6 text-xs font-bold text-rose-700 bg-white rounded-full shadow-lg">
                      {totalWishlistItems > 9 ? "9+" : totalWishlistItems}
                    </motion.span>
                  )}
                </motion.button>

                <motion.button whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }} className="relative p-3 bg-white text-rose-600 hover:bg-pink-50 transition-all duration-300 rounded-2xl shadow-lg hover:shadow-xl border-2 border-white/50" onClick={() => navigate("/cart")} aria-label="Shopping Cart">
                  <ShoppingCart size={22} strokeWidth={1.5} />
                  {totalQuantity > 0 && (
                    <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute -top-2 -right-2 inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 rounded-full shadow-lg border-2 border-white">
                      {totalQuantity > 99 ? "99+" : totalQuantity}
                    </motion.span>
                  )}
                </motion.button>

                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} className="p-3 text-white hover:text-pink-200 transition-colors rounded-2xl hover:bg-white/10 border-2 border-white/20 hover:border-white/30" onClick={() => setIsMobileMenuOpen((v) => !v)} aria-label="Menu">
                  {isMobileMenuOpen ? <X size={22} strokeWidth={1.5} /> : <Menu size={22} strokeWidth={1.5} />}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile Search Modal */}
      <AnimatePresence>
        {isMobileSearchOpen && (
          <motion.div key="search-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[60] md:hidden" style={{ background: "linear-gradient(135deg, #e91e63, #c2185b 45%, #b71c1c)" }}>
            <div className="flex flex-col h-full safe-area-inset">
              <div className="flex items-center p-6 border-b-2 border-rose-300 bg-white/90 backdrop-blur-xl shadow-xl">
                <button onClick={() => setIsMobileSearchOpen(false)} className="p-2 text-rose-600 hover:text-rose-800 transition-colors rounded-xl mr-4" aria-label="Close search">
                  <X size={24} strokeWidth={1.5} />
                </button>
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-rose-400" size={20} strokeWidth={1.5} />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSearch(e)} placeholder="Find your perfect piece..." className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-white to-rose-50/50 border-2 border-rose-200 rounded-2xl focus:ring-4 focus:ring-rose-300/20 focus:border-rose-400 text-base placeholder-rose-400 shadow-lg" autoFocus />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto pb-safe">
                {isSearching ? (
                  <div className="flex justify-center items-center p-16">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-3 border-white mx-auto"></div>
                      <p className="text-white mt-4 font-bold">Searching...</p>
                    </div>
                  </div>
                ) : searchResults.length > 0 ? (
                  <div className="p-6 space-y-4">
                    {searchResults.map((product: any) => (
                      <button key={product._id} onClick={() => handleProductClick(product._id)} className="w-full p-5 hover:bg-white/10 rounded-2xl transition-colors flex items-center space-x-4 text-left border-2 border-white/20 hover:border-white/40 shadow-lg hover:shadow-xl bg-white/5">
                        <div className="w-16 h-16 rounded-xl overflow-hidden shadow-md flex-shrink-0">
                          <img src={product.Product_image?.[0] || "/api/placeholder/64/64"} alt={product.Product_name} className="w-full h-full object-cover" onError={(e) => { (e.currentTarget as HTMLImageElement).src = "/api/placeholder/64/64"; }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-white truncate text-base">{product.Product_name}</h4>
                          <p className="text-pink-200 font-bold text-sm mt-1">₹{product.Product_price?.toLocaleString()}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-pink-200" />
                      </button>
                    ))}
                  </div>
                ) : searchQuery && !isSearching ? (
                  <div className="flex flex-col items-center justify-center p-16 text-center">
                    <Crown className="h-16 w-16 text-pink-200 mb-6" strokeWidth={1.5} />
                    <h3 className="text-xl font-bold text-white mb-3">No treasures found</h3>
                    <p className="text-pink-200 text-base">Try different keywords to discover amazing pieces</p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div key="mm-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[59] bg-black/60 mobile-menu-container" onClick={(e) => { if (e.target === e.currentTarget) setIsMobileMenuOpen(false); }}>
            <motion.div key="mm-panel" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "tween", duration: 0.25 }} className="absolute right-0 top-0 h-full w-80 max-w-[90vw] bg-gradient-to-br from-white via-rose-50/30 to-pink-50 shadow-2xl overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex flex-col h-full">
                {/* Panel Header with logo + close */}
                <div className="flex items-center justify-between p-6 bg-gradient-to-r from-pink-600 via-rose-700 to-red-800 text-white">
                  <div className="flex items-center">
                    {!menuLogoError ? (
                      <div className="relative inline-block">
                        <div aria-hidden className="absolute inset-0 rounded-md" />
                        <img src={LOVECRAFTLOGO} alt="TheLoveCraft" className="relative z-[1] h-10 w-auto object-contain" onError={() => setMenuLogoError(true)} />
                      </div>
                    ) : (
                      <Crown className="h-8 w-8 text-yellow-300" strokeWidth={1.5} />
                    )}
                  </div>
                  <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-white hover:bg-white/20 transition-colors rounded-xl" aria-label="Close menu">
                    <X size={24} strokeWidth={1.5} />
                  </button>
                </div>

                {/* === Menu Body: Featured / Quick Access / Admin / Auth === */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-6 pb-safe space-y-8">

                    {/* Featured */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center">
                        <Star className="w-4 h-4 mr-2" />
                        Featured
                      </h3>
                      {navigationItems.map((item) => (
                        <motion.button
                          key={item.name}
                          onClick={() => {
                            navigate(item.href);
                            setIsMobileMenuOpen(false);
                          }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          className={`flex items-start w-full text-left p-5 rounded-2xl font-bold transition-colors border-2 shadow-lg ${item.color} ${
                            item.highlight ? "border-rose-300 ring-2 ring-rose-200" : "border-current border-opacity-20"
                          }`}
                        >
                          <div className="flex-shrink-0 mr-4 mt-1">{item.icon}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-bold text-lg truncate">{item.name}</span>
                              {item.badge && (
                                <span className="text-xs bg-white px-3 py-1 rounded-full font-bold opacity-90 flex-shrink-0 ml-2">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm opacity-75 leading-tight">{item.description}</p>
                          </div>
                        </motion.button>
                      ))}
                    </div>

                    {/* Quick Access */}
                    <div className="space-y-4 border-t-2 border-rose-200 pt-6">
                      <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center">
                        <Heart className="w-4 h-4 mr-2" />
                        Quick Access
                      </h3>

                      {/* Wishlist (mobile only) */}
                      <button
                        onClick={() => {
                          navigate("/wishlist");
                          setIsMobileMenuOpen(false);
                        }}
                        className="sm:hidden flex items-center w-full text-left px-4 py-4 rounded-2xl font-bold transition-colors text-rose-700 bg-gradient-to-r from-rose-50 to-pink-50 hover:from-rose-100 hover:to-pink-100 border-2 border-rose-200 justify-between shadow-lg"
                      >
                        <div className="flex items-center">
                          <Heart size={20} className="mr-4" strokeWidth={1.5} />
                          <div>
                            <div className="font-bold">My Wishlist</div>
                            <div className="text-xs opacity-75">Saved favorites</div>
                          </div>
                        </div>
                        {totalWishlistItems > 0 && (
                          <span className="inline-flex items-center justify-center w-7 h-7 text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-pink-500 rounded-full shadow-lg">
                            {totalWishlistItems > 9 ? "9+" : totalWishlistItems}
                          </span>
                        )}
                      </button>

                      {/* Cart */}
                      <button
                        onClick={() => {
                          navigate("/cart");
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center w-full text-left px-4 py-4 rounded-2xl font-bold transition-colors text-white bg-gradient-to-r from-pink-600 via-rose-700 to-red-800 hover:from-pink-700 hover:via-rose-800 hover:to-red-900 border-2 border-rose-400 justify-between shadow-xl hover:shadow-2xl"
                      >
                        <div className="flex items-center">
                          <ShoppingCart size={20} className="mr-4" strokeWidth={1.5} />
                          <div>
                            <div className="font-bold">Shopping Cart</div>
                            <div className="text-xs opacity-90">Review your treasures</div>
                          </div>
                        </div>
                        {totalQuantity > 0 && (
                          <span className="inline-flex items-center justify-center w-8 h-8 text-sm font-bold text-rose-600 bg-white rounded-full shadow-lg">
                            {totalQuantity > 9 ? "9+" : totalQuantity}
                          </span>
                        )}
                      </button>
                    </div>

                    {/* Admin Panel */}
                  {isAdmin && (
  <div className="mb-8 border-t-2 border-rose-200 pt-6">
    <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center">
      <LayoutDashboard className="w-4 h-4 mr-2" />
      Admin Panel
    </h3>

    {/* Admin Dashboard Button */}
    <button
      onClick={() => {
        navigate("/admin");
        setIsMobileMenuOpen(false);
      }}
      className="flex items-center w-full text-left px-4 py-4 text-white bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl font-bold transition-colors shadow-lg hover:shadow-xl border-2 border-amber-400 mb-4"
    >
      <LayoutDashboard size={20} className="mr-4" strokeWidth={1.5} />
      <div>
        <div className="font-bold">Admin Dashboard</div>
        <div className="text-xs opacity-90">Manage your store</div>
      </div>
    </button>

    {/* Add Coupon Button */}
    <button
      onClick={() => {
        navigate("/admin/addcoupon");
        setIsMobileMenuOpen(false);
      }}
      className="flex items-center w-full text-left px-4 py-4 text-white bg-gradient-to-r from-pink-600 via-rose-700 to-red-800 rounded-2xl font-bold transition-colors shadow-lg hover:shadow-xl border-2 border-rose-400"
    >
      <Gift size={20} className="mr-4" strokeWidth={1.5} />
      <div>
        <div className="font-bold">Add Coupon</div>
        <div className="text-xs opacity-90">Create new discount codes</div>
      </div>
    </button>
  </div>
)}


                    {/* Authentication */}
                    <div className="border-t-2 border-rose-200 pt-6">
                      {!isAuthenticated ? (
                        <div className="space-y-4">
                          <h3 className="text-xs font-bold text-rose-600 uppercase tracking-wider mb-4 flex items-center">
                            <User className="w-4 h-4 mr-2" />
                            Join Us
                          </h3>
                          <button
                            onClick={() => {
                              navigate("/login");
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full py-4 border-2 border-rose-300 text-rose-800 rounded-2xl font-bold hover:bg-rose-50 transition-colors shadow-lg"
                          >
                            Sign In
                          </button>
                          <button
                            onClick={() => {
                              navigate("/signup");
                              setIsMobileMenuOpen(false);
                            }}
                            className="w-full py-4 bg-gradient-to-r from-pink-600 via-rose-700 to-red-800 text-white rounded-2xl font-bold hover:from-pink-700 hover:via-rose-800 hover:to-red-900 transition-all shadow-lg border-2 border-rose-400"
                          >
                            Join TheLoveCraft Family
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="px-4 py-4 bg-gradient-to-r from-rose-100 to-pink-100 rounded-2xl border-2 border-rose-200 shadow-inner">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" strokeWidth={1.5} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  Welcome, {user?.firstName || "Dear Customer"}!
                                </p>
                                <p className="text-xs text-rose-600 truncate">{user?.email}</p>
                              </div>
                            </div>
                          </div>

                          <button onClick={() => { navigate("/profile"); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 rounded-xl transition-colors font-bold">
                            My Profile
                          </button>

                          <button onClick={() => { navigate("/orders"); setIsMobileMenuOpen(false); }} className="w-full text-left px-4 py-3 text-gray-800 hover:bg-gradient-to-r hover:from-rose-50 hover:to-pink-50 rounded-xl transition-colors font-bold">
                            Order History
                          </button>

                          <button onClick={handleLogout} className="w-full text-left px-4 py-3 text-red-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 rounded-xl transition-colors border-t-2 border-rose-200 mt-4 pt-4 font-bold">
                            Sign Out
                          </button>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
                {/* Panel footer (optional) */}
                <div className="p-6 bg-gradient-to-r from-rose-100 to-pink-100 text-center border-t-2 border-rose-200">
                  <p className="text-xs text-rose-700 font-bold">© 2025 TheLoveCraft</p>
                  <p className="text-xs text-rose-600 mt-1">Handcrafted with Love ❤️</p>
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Header;
