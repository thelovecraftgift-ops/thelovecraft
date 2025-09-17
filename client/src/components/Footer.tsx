import { Instagram, Mail, Phone, MapPin, Crown, Heart, Gem, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import logo from "../utils/final.png"

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const Footer = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await axios.get(`${API_URL}/api/getAllData`, { withCredentials: true });
        setCategories(data?.data?.categories ?? []);
      } catch (e) {
        console.error("Footer: Failed fetching categories", e);
        setCategories([]);
      }
    })();
  }, []);

  const quickLinks = [
    { label: "About", to: "/about" },
    { label: "Contact", to: "/contact" },
    { label: "Refund", to: "/refund" },
    { label: "Privacy", to: "/privacy" },
    { label: "Terms", to: "/terms" },
  ];

  return (
    <footer className="relative bg-gradient-to-br from-pink-600 via-rose-700 to-red-800 overflow-hidden">
      {/* Decorative Elements - Luxury Theme [5] */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-r from-pink-400/10 to-rose-400/10 blur-3xl" />
        <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-gradient-to-r from-red-400/10 to-pink-400/10 blur-3xl" />
        
        {/* Floating Sparkles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/30 rounded-full"
            style={{
              top: `${20 + (i * 10)}%`,
              left: `${15 + (i * 12)}%`,
            }}
            animate={{
              y: [-5, 5, -5],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 4 + (i * 0.3),
              repeat: Infinity,
              delay: i * 0.5,
            }}
          />
        ))}
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-20 z-10">
        
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Brand Section - Enhanced [6] */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-5 space-y-8"
          >
            {/* Logo & Brand */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
               
                <div>
                 <img src={logo} alt="logo" className="h-30 w-60 relative bottom-5"/>
                </div>
              </div>
              
              <p className="text-pink-100 leading-relaxed max-w-lg text-lg">
                Exquisite handcrafted gifts & jewelry that speak your unique style. 
                Each piece tells a story, crafted with passion and designed to last a lifetime.
              </p>
            </div>

            {/* Social & Contact */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <motion.a
                  href="https://www.instagram.com/thelovecraft.gift"
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center hover:bg-white/20 transition-all duration-300 group"
                  aria-label="Instagram"
                >
                  <Instagram className="w-6 h-6 text-pink-200 group-hover:text-white transition-colors" />
                </motion.a>
                
                <div className="flex-1">
                  <a 
                    href="mailto:thelovecraft.gift@gmail.com" 
                    className="flex items-center space-x-3 text-pink-100 hover:text-white transition-colors group"
                  >
                    <Mail className="w-5 h-5" />
                    <span className="text-sm font-medium">thelovecraft.gift@gmail.com</span>
                  </a>
                </div>
              </div>

              <a 
                href="tel:8757331432"
                className="flex items-center space-x-3 text-pink-100 hover:text-white transition-colors group"
              >
                <Phone className="w-5 h-5" />
                <span className="text-lg font-semibold">+91 8757331432</span>
              </a>
            </div>

            {/* Values */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Heart, text: "Made with Love" },
                { icon: Crown, text: "Royal Quality" },
                { icon: Gem, text: "Ethical Sourcing" },
                { icon: Sparkles, text: "Lifetime Guarantee" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center space-x-2 text-pink-200"
                >
                  <item.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Quick Links */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="lg:col-span-2 space-y-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-pink-300 to-rose-300 rounded-full mr-3"></span>
              Company
            </h3>
            <nav className="space-y-4" aria-label="Quick Links">
              {quickLinks.map(({ label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex items-center space-x-3 text-pink-100 hover:text-white transition-colors group"
                >
                  <div className="w-1 h-1 rounded-full bg-pink-300 group-hover:bg-white transition-colors"></div>
                  <span className="font-medium capitalize">{label}</span>
                </Link>
              ))}
            </nav>
          </motion.div>

          {/* Categories */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="lg:col-span-2 space-y-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-rose-300 to-red-300 rounded-full mr-3"></span>
              Collections
            </h3>
            <nav className="space-y-4" aria-label="Shop Categories">
              {categories.length > 0 ? (
                categories.slice(0, 6).map(({ _id, name }, idx) => (
                  <Link
                    key={_id ?? name ?? idx}
                    to={`/category/${(name ?? '').toLowerCase()}`}
                    className="flex items-center space-x-3 text-pink-100 hover:text-white transition-colors group"
                  >
                    <div className="w-1 h-1 rounded-full bg-rose-300 group-hover:bg-white transition-colors"></div>
                    <span className="font-medium">{name}</span>
                  </Link>
                ))
              ) : (
                <p className="text-pink-200/60 font-medium italic text-sm">Loading collections...</p>
              )}
            </nav>
          </motion.div>

          {/* Address */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="lg:col-span-3 space-y-6"
          >
            <h3 className="text-xl font-bold text-white mb-6 flex items-center">
              <span className="w-2 h-8 bg-gradient-to-b from-red-300 to-pink-300 rounded-full mr-3"></span>
              Visit Us
            </h3>
            
            <address className="not-italic space-y-4">
              <div className="flex items-start space-x-3 text-pink-100">
                <MapPin className="w-5 h-5 mt-1 flex-shrink-0" />
                <div>
                  <p className="font-medium leading-relaxed">
                    NH 33, Dimna Pardih Road<br />
                    Opposite SBI Bank<br />
                    Jamshedpur, Jharkhand - 831012
                  </p>
                </div>
              </div>
            </address>

            {/* Store Hours */}
         
          </motion.div>
        </div>

        {/* Newsletter Section [10] */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20 mb-12"
        >
          <div className="text-center max-w-2xl mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center">
                <Heart className="w-8 h-8 text-pink-200" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-4">
              Join Our Royal Family
            </h3>
            <p className="text-pink-200 mb-8 leading-relaxed">
              Be the first to discover new collections, exclusive offers, and artisan stories. 
              Get 10% off your first purchase when you subscribe!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-pink-200/60 focus:outline-none focus:ring-2 focus:ring-white/30"
              />
              <button className="px-8 py-4 bg-white text-rose-700 font-bold rounded-2xl hover:bg-pink-100 transition-colors shadow-lg hover:shadow-xl">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>

        {/* Bottom Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 1 }}
          className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6 text-pink-200"
        >
          <div className="flex items-center space-x-4">
            <p className="text-sm">© 2025 TheLoveCraft. All rights reserved.</p>
            <span className="hidden md:block w-1 h-1 bg-pink-300 rounded-full"></span>
            <p className="text-sm">Made with ❤️ in India</p>
          </div>
          
          <div className="flex items-center gap-8 text-sm">
            <Link to="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <span className="w-1 h-1 bg-pink-300 rounded-full"></span>
            <Link to="/terms" className="hover:text-white transition-colors">
              Terms & Conditions
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Custom Animation Styles */}
      <style >{`
        @keyframes slow-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-slow-spin {
          animation: slow-spin 20s linear infinite;
        }
        .animate-slow-spin-reverse {
          animation: slow-spin 25s linear infinite reverse;
        }
      `}</style>
    </footer>
  );
};

export default Footer;
