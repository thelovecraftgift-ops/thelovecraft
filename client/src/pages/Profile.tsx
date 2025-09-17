import { useEffect, useMemo } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  Shield,
  Calendar,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Package,
  Heart,
  Sparkles,
  Crown,
} from "lucide-react";
import { format, isValid } from "date-fns";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

type UserProfile = {
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNo?: number | string;
  role: string;
  createdAt?: string;
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
  };
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
};

const Profile = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      toast({
        title: "Login required",
        description: "Please login to view profile",
      });
    }
  }, [user, toast]);

  const current = user as UserProfile | null;

  const formatDate = (dateString?: string, fmt = "MMMM d, yyyy") => {
    if (!dateString) return "N/A";
    try {
      const d = new Date(dateString);
      return isValid(d) ? format(d, fmt) : "N/A";
    } catch {
      return "N/A";
    }
  };

  const formatPhone = (val?: string | number) => {
    if (!val) return "Not provided";
    const s = String(val);
    if (s.startsWith("+91 ")) return s;
    if (s.startsWith("91") && s.length === 12) {
      const n = s.slice(2);
      return `+91 ${n.replace(/(\d{5})(\d{5})/, "$1-$2")}`;
    }
    if (/^\d{10}$/.test(s)) {
      return `+91 ${s.replace(/(\d{5})(\d{5})/, "$1-$2")}`;
    }
    return s;
  };

  const initials = useMemo(() => {
    const f = current?.firstName?.trim() || "";
    const l = current?.lastName?.trim() || "";
    if (f && l) return `${f[0]}${l[0]}`.toUpperCase();
    if (f) return f[0].toUpperCase();
    if (l) return l[0].toUpperCase();
    return "U";
  }, [current?.firstName, current?.lastName]);

  const displayName = useMemo(() => {
    const f = current?.firstName?.trim() || "";
    const l = current?.lastName?.trim() || "";
    return f && l ? `${f} ${l}` : f || l || "User";
  }, [current?.firstName, current?.lastName]);

  const displayAddress = useMemo(() => {
    const src = current?.address || (current as any) || {};
    const list = [src.street, src.city, src.state, src.pinCode, src.country].filter(Boolean);
    return list.length ? list.join(", ") : "Not provided";
  }, [current]);

  if (!current) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4">
          <div className="text-center max-w-sm p-8 bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border-2 border-rose-100">
            <User className="w-10 h-10 text-rose-600 mx-auto mb-4" />
            <h1 className="text-2xl font-black text-gray-900 mb-2">Please Login</h1>
            <p className="text-rose-700 text-sm mb-6">Login to view your profile details.</p>
            <Button
              onClick={() => navigate("/login")}
              className="w-full rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800"
            >
              Go to Login
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 pt-20 pb-12 px-3">
        <div className="max-w-4xl mx-auto">
          {/* Title */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-bold mb-3 border border-rose-200">
              <Crown className="w-4 h-4" />
              Account Overview
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">
              My Profile
            </h1>
          </motion.div>

          {/* Identity Card (no edit) */}
          <motion.div
            className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border-2 border-rose-100 p-6 mb-6"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="w-24 h-24 md:w-28 md:h-28 rounded-full bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white flex items-center justify-center shadow-lg">
                  <span className="text-2xl md:text-3xl font-black">{initials}</span>
                </div>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  {current.isVerified ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  )}
                </div>
              </div>

              <div className="mt-4 text-center">
                <h2 className="text-xl md:text-2xl font-black text-gray-900">{displayName}</h2>
                <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-2 bg-rose-50 px-3 py-1 rounded-full border border-rose-200 text-rose-700 text-xs font-semibold">
                    <Mail className="w-3 h-3" />
                    {current.email}
                  </span>
                  {current.isPhoneVerified && (
                    <span className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 text-emerald-700 text-xs font-semibold">
                      <CheckCircle className="w-3 h-3" />
                      Phone Verified
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick actions (distinct look, no edit) */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <button
              onClick={() => navigate("/orders")}
              className="flex flex-col items-center p-4 bg-white/90 rounded-2xl border-2 border-rose-100 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition"
            >
              <Package className="w-7 h-7 text-rose-700 mb-2" />
              <span className="text-sm font-semibold text-gray-900">Orders</span>
            </button>
            <button
              onClick={() => navigate("/wishlist")}
              className="flex flex-col items-center p-4 bg-white/90 rounded-2xl border-2 border-rose-100 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition"
            >
              <Heart className="w-7 h-7 text-pink-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">Wishlist</span>
            </button>
            <button
              onClick={() => navigate("/custom-hamper")}
              className="flex flex-col items-center p-4 bg-white/90 rounded-2xl border-2 border-rose-100 shadow-md hover:shadow-lg hover:-translate-y-[2px] transition"
            >
              <Sparkles className="w-7 h-7 text-amber-600 mb-2" />
              <span className="text-sm font-semibold text-gray-900">Hampers</span>
            </button>
          </motion.div>

          {/* Info blocks - read-only, simplified layout */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {/* Contact */}
            <div className="bg-white/90 rounded-2xl border-2 border-rose-100 p-5 shadow">
              <div className="flex items-center gap-2 mb-3">
                <User className="w-4 h-4 text-rose-700" />
                <h3 className="text-base font-black text-gray-900">Contact</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-rose-800">
                  <Mail className="w-4 h-4" />
                  <span className="font-semibold break-all">{current.email || "Not provided"}</span>
                </div>
                <div className="flex items-center gap-2 text-rose-800">
                  <Phone className="w-4 h-4" />
                  <span className="font-semibold">{formatPhone(current.phoneNo)}</span>
                </div>
              </div>
            </div>

            {/* Address */}
            <div className="bg-white/90 rounded-2xl border-2 border-rose-100 p-5 shadow">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-rose-700" />
                <h3 className="text-base font-black text-gray-900">Address</h3>
              </div>
              <p className="text-sm font-semibold text-rose-800">
                {displayAddress}
              </p>
            </div>

            {/* Account */}
            <div className="bg-white/90 rounded-2xl border-2 border-rose-100 p-5 shadow">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-4 h-4 text-rose-700" />
                <h3 className="text-base font-black text-gray-900">Account</h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white capitalize">
                  {current.role || "user"}
                </span>
                {current.role === "admin" && (
                  <span className="text-[11px] text-rose-700 font-semibold bg-rose-100 px-2 py-1 rounded-full">
                    Admin privileges
                  </span>
                )}
              </div>
              <div className="mt-3 text-sm text-rose-800">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-semibold">
                    Member since {formatDate(current.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification */}
            <div className="bg-white/90 rounded-2xl border-2 border-rose-100 p-5 shadow">
              <div className="flex items-center gap-2 mb-3">
                <CheckCircle className="w-4 h-4 text-rose-700" />
                <h3 className="text-base font-black text-gray-900">Verification</h3>
              </div>
              <div className="text-sm space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-rose-800">Email Verified</span>
                  <div className="flex items-center gap-1">
                    {current.isVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-semibold">Yes</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-600 font-semibold">Pending</span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-rose-800">Phone Verified</span>
                  <div className="flex items-center gap-1">
                    {current.isPhoneVerified ? (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-green-600 font-semibold">Yes</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        <span className="text-amber-600 font-semibold">Pending</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
};

export default Profile;
