import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, Variants } from "framer-motion";
import {
  AlertCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Gem,
  ArrowRight,
  Eye,
  MousePointer,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

interface Category {
  _id: string;
  name: string;
  slug: string;
  image: string;
  productCount?: number;
}

const CategoryGrid: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  /* fetch data ----------------------------------------------------- */
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/getAllData`, {
          withCredentials: true,
        });
        setCategories(data?.data?.categories || []);
        setError(null);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to load collections.");
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  /* scroll helpers ------------------------------------------------- */
  const scrollBy = (dx: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: dx, behavior: "smooth" });
    }
  };

  /* Pink/Rose/Burgundy color scheme only */
  const getColorClass = (index: number) => {
    const colors = [
      "rose",
      "pink", 
      "red",
      "fuchsia",
    ];
    return colors[index % colors.length];
  };

  /* framer variants ------------------------------------------------ */
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: 0.2 },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { type: "spring", stiffness: 250, damping: 20 },
    },
  };

  /* Loading Skeleton */
  const LoadingSkeleton = () => (
    <div className="flex-shrink-0 w-[280px] sm:w-96">
      <div className="relative">
        <Skeleton className="w-full h-48 rounded-2xl bg-rose-100" />
        <div className="mt-4 space-y-2">
          <Skeleton className="h-6 w-3/4 rounded-lg bg-rose-100" />
          <Skeleton className="h-4 w-1/2 rounded-lg bg-pink-100" />
        </div>
      </div>
    </div>
  );

  /* loading state -------------------------------------------------- */
  if (loading) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-br from-pink-50 via-white to-rose-50/30 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-10 right-10 w-64 h-64 bg-rose-200/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-80 h-80 bg-pink-200/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6">
          <div className="mb-10 md:mb-16">
            <Skeleton className="h-6 w-32 rounded-lg mb-4 bg-rose-100" />
            <Skeleton className="h-12 w-64 rounded-xl mb-2 bg-pink-100" />
            <Skeleton className="h-4 w-48 rounded-lg bg-rose-100" />
          </div>

          <div className="overflow-x-auto pb-8">
            <div className="flex space-x-4 sm:space-x-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <LoadingSkeleton key={i} />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* error state ---------------------------------------------------- */
  if (error) {
    return (
      <section className="py-12 md:py-20 bg-gradient-to-br from-red-50 via-white to-pink-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Alert variant="destructive" className="bg-white/90 backdrop-blur-sm border-red-200 shadow-lg rounded-xl">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-sm font-medium text-red-700 ml-2">
              {error} Please refresh the page.
            </AlertDescription>
          </Alert>
        </div>
      </section>
    );
  }

  /* main UI -------------------------------------------------------- */
  return (
    <section className="py-12 md:py-20 bg-gradient-to-br from-pink-50 via-white to-rose-50/30 relative overflow-hidden">
      {/* Pink/Rose Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 right-20 w-96 h-96 bg-gradient-to-br from-rose-100/20 to-pink-100/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-gradient-to-br from-red-100/15 to-rose-100/10 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto relative z-10 px-4 sm:px-6">
        {/* Header with Scroll Hint */}
        <motion.div
          className="mb-10 md:mb-16"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              {/* Small Badge - Pink Theme */}
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <Badge className="bg-white/80 text-rose-700 border-rose-200/50 px-3 py-1 text-xs font-medium rounded-lg shadow-sm mb-3 md:mb-4">
                  Explore
                </Badge>
              </motion.div>

              {/* Clean Title - Rose Theme */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-2 md:mb-3 leading-tight"
              >
                Our <span className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 bg-clip-text text-transparent">Collections</span>
              </motion.h1>

              {/* Minimal Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-rose-600 text-base md:text-lg leading-relaxed"
              >
                Discover curated pieces for every moment
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
              <span>Scroll to explore more</span>
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

        {/* Modern Card Layout with Scroll Indicators */}
        <div className="relative group">
          {/* Left Fade Gradient - Pink Theme (Desktop only) */}
          <div className="absolute left-0 top-0 bottom-0 w-6 md:w-12 bg-gradient-to-r from-white via-white/80 to-transparent z-10 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300 hidden md:block" />
          
          {/* Right Fade Gradient - Pink Theme (Desktop only) */}
          <div className="absolute right-0 top-0 bottom-0 w-6 md:w-12 bg-gradient-to-l from-white via-white/80 to-transparent z-10 pointer-events-none hidden md:block" />

          <motion.div
            ref={scrollRef}
            className="overflow-x-auto snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] pb-6 md:pb-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex space-x-4 sm:space-x-6 pl-1 pr-4 md:pr-12" style={{ width: "max-content" }}>
              {categories.map((category, index) => {
                const colorClass = getColorClass(index);
                
                return (
                  <motion.div
                    key={category._id}
                    className="group/card relative flex-shrink-0 snap-center"
                    variants={itemVariants}
                  >
                    <motion.button
                      onClick={() => navigate(`/category/${category.slug}`)}
                      className="relative w-[280px] sm:w-96 focus:outline-none text-left"
                      whileHover={{ y: -6 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    >
                      {/* Modern Card Design - Pink Theme */}
                      <div className="relative bg-white rounded-xl md:rounded-2xl shadow-lg hover:shadow-xl border border-rose-200/50 overflow-hidden transition-all duration-500">
                        
                        {/* Image Section */}
                        <div className="relative h-40 sm:h-48 overflow-hidden">
                          <motion.img
                            src={category.image || "/fallback.jpg"}
                            alt={category.name}
                            className="w-full h-full object-cover"
                            whileHover={{ scale: 1.05 }}
                            transition={{ duration: 0.6 }}
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = "/fallback.jpg";
                            }}
                          />
                          
                          {/* Gradient Overlay - Pink Theme */}
                          <div className="absolute inset-0 bg-gradient-to-t from-rose-600/20 via-transparent to-transparent" />
                          
                          {/* Category Badge - Pink Theme */}
                          <div className="absolute top-3 sm:top-4 left-3 sm:left-4">
                            <div className={`bg-gradient-to-r from-${colorClass}-500 to-${colorClass}-600 text-white px-2 sm:px-3 py-1 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm`}>
                              <Gem className="w-3 h-3 inline mr-1" />
                              Premium
                            </div>
                          </div>

                          {/* Hover Action - Pink Theme */}
                          <motion.div
                            className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg opacity-0 group-hover/card:opacity-100"
                            whileHover={{ scale: 1.1 }}
                            transition={{ duration: 0.3 }}
                          >
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-rose-700" />
                          </motion.div>
                        </div>

                        {/* Content Section */}
                        <div className="p-4 sm:p-6">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2 line-clamp-1">
                                {category.name}
                              </h3>
                              
                              {category.productCount && (
                                <p className="text-rose-500 text-xs sm:text-sm font-medium">
                                  {category.productCount} pieces available
                                </p>
                              )}
                            </div>
                            
                            {/* Arrow - Pink Theme */}
                            <motion.div
                              className="ml-3 sm:ml-4 text-rose-400 group-hover/card:text-rose-600"
                              whileHover={{ x: 4 }}
                              transition={{ duration: 0.3 }}
                            >
                              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                            </motion.div>
                          </div>
                        </div>

                        {/* Bottom Color Accent - Pink/Rose Theme */}
                        <div className={`h-1 bg-gradient-to-r from-${colorClass}-400 to-${colorClass}-600`} />
                      </div>
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Enhanced Navigation Arrows - Pink Theme (Desktop only) */}
          {categories.length > 2 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollBy(-400)}
                className="absolute left-1 md:left-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12 
                           bg-white/95 backdrop-blur-sm border-rose-200 text-rose-600
                           hover:bg-white hover:text-rose-700 hover:border-rose-300 hover:scale-110
                           transition-all duration-300 opacity-0 group-hover:opacity-100 
                           rounded-full shadow-xl z-20 hidden md:flex"
              >
                <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                onClick={() => scrollBy(400)}
                className="absolute right-1 md:right-2 top-1/2 -translate-y-1/2 w-10 h-10 md:w-12 md:h-12
                           bg-white/95 backdrop-blur-sm border-rose-200 text-rose-600
                           hover:bg-white hover:text-rose-700 hover:border-rose-300 hover:scale-110
                           transition-all duration-300 opacity-0 group-hover:opacity-100 
                           rounded-full shadow-xl z-20 hidden md:flex"
              >
                <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
              </Button>
            </>
          )}
        </div>

        {/* Mobile Scroll Hint - Pink Theme */}
        <motion.div
          className="md:hidden text-center mt-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <div className="inline-flex items-center space-x-2 text-rose-500 text-sm bg-white/50 px-4 py-2 rounded-full border border-rose-200/50">
            <motion.div
              animate={{ x: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <ArrowRight className="w-4 h-4" />
            </motion.div>
            <span>Swipe to see more collections</span>
          </div>
        </motion.div>

        {/* Bottom CTA - Pink Theme */}
        <motion.div
          className="text-center mt-8 md:mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-rose-500 text-sm">
            Can't find what you're looking for? <span className="text-rose-700 font-medium cursor-pointer hover:underline">Browse all items</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default CategoryGrid;