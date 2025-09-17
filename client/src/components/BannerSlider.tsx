import React, { useEffect, useState, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade, Navigation } from "swiper/modules";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, Play, Pause, Sparkles, Crown, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";
import axios, { AxiosResponse, AxiosError } from "axios";

// Environment variable with proper typing
const API_URL: string = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

// Interface definitions
interface Banner {
  _id: string;
  BannerUrl: string;
  BannerTitle?: string;
  BannerDescription?: string;
  BannerLink?: string;
}

interface BannerApiResponse {
  banners: Banner[];
  success?: boolean;
  message?: string;
}

interface BannerSliderProps {
  className?: string;
  headerHeight?: number;
  autoplayDelay?: number;
  showPlayPause?: boolean;
}

// Loading skeleton component - Pink Theme
const BannerSkeleton: React.FC<{
  className?: string;
}> = ({ className }) => (
  <motion.div
    className={`w-full relative ${className || ""}`}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
  >
    <div className="w-full relative overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
      <div className="aspect-w-16 aspect-h-9">
        <Skeleton className="w-full h-full bg-gradient-to-br from-rose-200 to-pink-200" />
      </div>
      
      {/* Floating elements during loading */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center">
          <Crown className="w-12 h-12 text-rose-400 mx-auto mb-4 animate-pulse" />
          <p className="text-rose-600 font-medium">Loading beautiful collections...</p>
        </div>
      </div>
      
      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="w-3 h-3 rounded-full bg-rose-300/60 animate-pulse" />
        ))}
      </div>
    </div>
  </motion.div>
);

// Error state component - Pink Theme
const BannerError: React.FC<{
  className?: string;
  onRetry?: () => void;
}> = ({ className, onRetry }) => (
  <div className={`w-full relative ${className || ""}`}>
    <div className="w-full max-w-4xl mx-auto px-4">
      <Card className="p-8 md:p-12 text-center bg-gradient-to-br from-pink-50 to-rose-50 border-rose-200 shadow-xl rounded-xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-r from-pink-500 to-rose-500 rounded-full flex items-center justify-center mx-auto mb-4 md:mb-6">
            <Heart className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-3 md:mb-4">
            Oops! Something went wrong
          </h3>
          <p className="text-rose-600 mb-4 md:mb-6 leading-relaxed text-sm md:text-base">
            We couldn't load our beautiful collections right now. Please check your connection and try again.
          </p>
          {onRetry && (
            <Button
              onClick={onRetry}
              className="bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-white px-6 py-2 md:px-8 md:py-3 rounded-xl md:rounded-2xl font-bold shadow-lg hover:shadow-xl transition-all duration-300 text-sm md:text-base"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Try Again
            </Button>
          )}
        </motion.div>
      </Card>
    </div>
  </div>
);

const BannerSlider: React.FC<BannerSliderProps> = ({
  className = "",
  headerHeight = 80,
  autoplayDelay = 4000,
  showPlayPause = true,
}) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [swiperInstance, setSwiperInstance] = useState<SwiperType | null>(null);

  const fetchBanners = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      setError(false);

      const res: AxiosResponse<BannerApiResponse> = await axios.get(
        `${API_URL}/api/getbanners`,
        {
          withCredentials: true,
          timeout: 10000, // 10 second timeout
        }
      );

      if (res.data.success !== false && res.data.banners) {
        setBanners(res.data.banners);
      } else {
        throw new Error(res.data.message || "Failed to fetch banners");
      }
    } catch (err) {
      console.error("Failed to fetch banners:", err);
      setError(true);
      setBanners([]);

      // Log detailed error information
      if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError;
        console.error("Axios error details:", {
          status: axiosError.response?.status,
          statusText: axiosError.response?.statusText,
          data: axiosError.response?.data,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBanners();
  }, [fetchBanners]);

  const togglePlayPause = useCallback((): void => {
    if (!swiperInstance) return;

    if (isPlaying) {
      swiperInstance.autoplay.stop();
    } else {
      swiperInstance.autoplay.start();
    }
    setIsPlaying(!isPlaying);
  }, [swiperInstance, isPlaying]);

  const handleImageError = useCallback(
    (e: React.SyntheticEvent<HTMLImageElement, Event>): void => {
      const target = e.currentTarget as HTMLImageElement;
      target.src = "/fallback-banner.jpg";
      target.onerror = null; // Prevent infinite loop
    },
    []
  );

  const handleSwiperInit = useCallback((swiper: SwiperType): void => {
    setSwiperInstance(swiper);
  }, []);

  const handleSlideChange = useCallback((swiper: SwiperType): void => {
    setCurrentSlide(swiper.realIndex);
  }, []);

  const handleBannerClick = useCallback((banner: Banner): void => {
    if (banner.BannerLink) {
      window.open(banner.BannerLink, "_blank", "noopener,noreferrer");
    }
  }, []);

  // Loading state
  if (loading) {
    return <BannerSkeleton className={className} />;
  }

  // Error state
  if (error) {
    return (
      <BannerError
        className={className}
        onRetry={fetchBanners}
      />
    );
  }

  // No banners state
  if (!banners.length) {
    return null;
  }

  return (
    <motion.section
      className={`w-full relative ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Enhanced header with luxury controls */}
      {showPlayPause && (
        <div className="absolute top-4 right-4 z-30 flex items-center space-x-2 md:space-x-4">
          {/* Slide counter - Pink Theme */}
          <div className="hidden md:flex items-center space-x-2 text-sm text-white bg-gradient-to-r from-pink-600/80 to-rose-600/80 backdrop-blur-md rounded-full px-3 py-1.5 md:px-4 md:py-2 border border-white/20">
            <Crown className="w-3 h-3 md:w-4 md:h-4 text-yellow-300" />
            <span className="font-bold text-white text-xs md:text-sm">
              {String(currentSlide + 1).padStart(2, "0")}
            </span>
            <span className="text-pink-200">/</span>
            <span className="text-pink-200 text-xs md:text-sm">{String(banners.length).padStart(2, "0")}</span>
          </div>

          {/* Play/Pause button - Pink Theme */}
          <Button
            variant="secondary"
            size="sm"
            onClick={togglePlayPause}
            className="hidden md:flex items-center space-x-2 bg-white/10 backdrop-blur-md border-white/20 text-white hover:bg-white/20 rounded-xl md:rounded-2xl px-3 py-1.5 md:px-4 md:py-2"
            aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
          >
            {isPlaying ? (
              <Pause className="w-3 h-3 md:w-4 md:h-4" />
            ) : (
              <Play className="w-3 h-3 md:w-4 md:h-4" />
            )}
            <span className="text-xs font-medium">{isPlaying ? "Pause" : "Play"}</span>
          </Button>
        </div>
      )}

      {/* Main banner slider - Pink Theme */}
      <div className="w-full relative overflow-hidden bg-gradient-to-br from-pink-100 to-rose-100 rounded-xl">
        <Swiper
          modules={[Autoplay, Pagination, EffectFade, Navigation]}
          spaceBetween={0}
          slidesPerView={1}
          loop={banners.length > 1}
          effect="fade"
          fadeEffect={{ crossFade: true }}
          autoplay={{
            delay: autoplayDelay,
            disableOnInteraction: false,
            pauseOnMouseEnter: false,
          }}
          pagination={{
            clickable: true,
            bulletClass: "swiper-pagination-bullet !bg-white/70 !w-2 !h-2 md:!w-3 md:!h-3 !rounded-full !border-2 !border-pink-300",
            bulletActiveClass: "swiper-pagination-bullet-active !bg-gradient-to-r !from-pink-500 !to-rose-500 !w-6 md:!w-8 !h-2 md:!h-3 !rounded-full !border-white",
            renderBullet: (index: number, className: string): string => {
              return `<span class="${className} transition-all duration-300 cursor-pointer hover:!scale-125" aria-label="Go to slide ${index + 1}"></span>`;
            },
          }}
          navigation={{
            prevEl: ".swiper-button-prev-custom",
            nextEl: ".swiper-button-next-custom",
          }}
          onSwiper={handleSwiperInit}
          onSlideChange={handleSlideChange}
          className="w-full group banner-slider rounded-xl"
          style={{ 
            aspectRatio: '16/9',
            // Pink theme CSS variables
            "--swiper-pagination-color": "#ec4899",
            "--swiper-pagination-bullet-inactive-color": "#ffffff",
            "--swiper-pagination-bullet-inactive-opacity": "0.7",
            "--swiper-pagination-bullet-size": "12px",
            "--swiper-pagination-bullet-horizontal-gap": "6px"
          } as React.CSSProperties}
        >
          {banners.map((banner, index) => (
            <SwiperSlide key={banner._id} className="relative">
              <div
                className="relative w-full h-full overflow-hidden cursor-pointer banner-slide group/slide rounded-xl"
                onClick={() => handleBannerClick(banner)}
              >
                {/* Fixed 16:9 Aspect Ratio Container */}
                <div className="aspect-w-16 aspect-h-9 w-full h-full">
                  {/* Banner Image with Pink Overlay */}
                  <img
                    src={banner.BannerUrl}
                    alt={banner.BannerTitle || `Banner ${index + 1}`}
                    className="w-full h-full object-cover object-center transition-transform duration-[5000ms] group-hover/slide:scale-105"
                    loading={index === 0 ? "eager" : "lazy"}
                    onError={handleImageError}
                  />

                  {/* Luxury shimmer effect - Pink Theme */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-pink-300/20 to-transparent translate-x-[-100%] group-hover/slide:translate-x-[100%] transition-transform duration-1500 ease-out" />
                  
                  {/* Subtle pink overlay for brand consistency */}
                  <div className="absolute inset-0 bg-gradient-to-t from-pink-900/10 via-transparent to-rose-900/5" />
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Navigation buttons - Pink Theme */}
        {banners.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="swiper-button-prev-custom absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-rose-500/20 hover:scale-110 hover:border-pink-300/50 transition-all duration-300 opacity-70 hover:opacity-100 rounded-full shadow-xl"
              aria-label="Previous slide"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </Button>

            <Button
              variant="secondary"
              size="icon"
              className="swiper-button-next-custom absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 z-20 w-10 h-10 md:w-12 md:h-12 bg-white/10 backdrop-blur-md border-2 border-white/20 text-white hover:bg-gradient-to-r hover:from-pink-500/20 hover:to-rose-500/20 hover:scale-110 hover:border-pink-300/50 transition-all duration-300 opacity-70 hover:opacity-100 rounded-full shadow-xl"
              aria-label="Next slide"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </Button>
          </>
        )}
      </div>

      {/* Enhanced banner styles - Pink Theme */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .banner-slider {
          aspect-ratio: 16/9;
          border-radius: 12px;
          overflow: hidden;
        }
        
        .banner-slider .swiper-pagination {
          bottom: 16px !important;
          z-index: 15;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        
        .banner-slider .swiper-pagination-bullet {
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
          margin: 0 4px !important;
          opacity: 0.7;
          backdrop-filter: blur(8px);
          box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        }
        
        .banner-slider .swiper-pagination-bullet:hover {
          transform: scale(1.3) !important;
          opacity: 1;
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.4);
        }
        
        .banner-slider .swiper-pagination-bullet-active {
          opacity: 1 !important;
          transform: scale(1.1);
          box-shadow: 0 6px 20px rgba(236, 72, 153, 0.6);
        }
        
        .banner-slide {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
          border-radius: 12px;
        }
        
        .banner-slider .swiper-slide img {
          filter: brightness(1.02) contrast(1.05) saturate(1.1);
          object-fit: cover;
          object-position: center center;
          width: 100%;
          height: 100%;
        }
        
        /* Pink Theme Glow Effects */
        .swiper-button-prev-custom:hover,
        .swiper-button-next-custom:hover {
          box-shadow: 0 8px 32px rgba(236, 72, 153, 0.3);
        }
        
        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .banner-slider .swiper-pagination {
            bottom: 12px !important;
          }
          .banner-slider .swiper-pagination-bullet {
            margin: 0 3px !important;
            width: 8px !important;
            height: 8px !important;
          }
        }
        
        /* Aspect ratio utility */
        .aspect-w-16 {
          position: relative;
          padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
        }
        
        .aspect-w-16 > * {
          position: absolute;
          height: 100%;
          width: 100%;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
        }
        
        /* Loading shimmer effect */
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .shimmer {
          animation: shimmer 2s infinite;
        }
      `,
        }}
      />
    </motion.section>
  );
};

export default BannerSlider;