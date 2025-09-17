// src/pages/Signup.tsx
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Crown, Sparkles } from "lucide-react";
import axios from "axios";
import { useAuth } from "@/components/AuthContext";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const Signup = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  // Step management
  const [currentStep, setCurrentStep] = useState(1);

  // Form fields
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [firstName, setFirstName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // UI states
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSendOtp = async () => {
    if (!email) {
      toast({ title: "Error", description: "Please enter your email address", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { email });
      setCurrentStep(2);
      toast({
        title: "OTP Sent",
        description: "Please check your email for the verification code",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to send verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      toast({ title: "Error", description: "Please enter the verification code", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/verify-email`, { email, otp });
      setCurrentStep(3);
      toast({
        title: "Success",
        description: "Email verified successfully! Please complete your profile.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Invalid verification code",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/signup`, {
        firstName: firstName || email.split("@"),
        email,
        password,
        confirmPassword,
      });

      const loginRes = await axios.post(
        `${API_URL}/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      const data = loginRes.data;
      if (data.accessToken && data.reply) {
        localStorage.setItem("user_token", data.accessToken);
        localStorage.setItem("user", JSON.stringify(data.reply));
        login(data.reply);

        toast({
          title: "Welcome!",
          description: "Your account has been created successfully.",
        });

        navigate("/");
      } else {
        throw new Error("Failed to sign in automatically");
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Registration failed",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-xs font-bold text-rose-800 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="pl-4 h-12 bg-white/70 border-2 border-rose-100 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
                />
              </div>
              <p className="text-[11px] text-rose-700">
                A one-time code will be sent to verify the email.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleSendOtp}
              disabled={!email || loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-rose-200/60 transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Sending code...
                </div>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="otp" className="block text-xs font-bold text-rose-800 uppercase tracking-wide">
                Verification Code
              </label>
              <Input
                id="otp"
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                placeholder="Enter verification code"
                className="h-12 bg-white/70 border-2 border-rose-100 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
              />
              <p className="text-[11px] text-rose-700">
                Didn’t get it? Check spam or resend below.
              </p>
            </div>
            <Button
              type="button"
              onClick={handleVerifyOtp}
              disabled={!otp || loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-rose-200/60 transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                "Verify Code"
              )}
            </Button>
            <p className="text-center text-sm text-rose-700">
              Didn’t receive the code?{" "}
              <button
                type="button"
                onClick={handleSendOtp}
                className="font-bold text-rose-700 underline underline-offset-4 hover:text-rose-800"
              >
                Resend
              </button>
            </p>
          </div>
        );

      case 3:
        return (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="firstName" className="block text-xs font-bold text-rose-800 uppercase tracking-wide">
                Full Name
              </label>
              <Input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your name"
                className="h-12 bg-white/70 border-2 border-rose-100 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-xs font-bold text-rose-800 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10 h-12 bg-white/70 border-2 border-rose-100 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-rose-700 hover:text-rose-900"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-[11px] text-rose-700">Minimum 8 characters recommended.</p>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-xs font-bold text-rose-800 uppercase tracking-wide">
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="pr-10 h-12 bg-white/70 border-2 border-rose-100 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-rose-700 hover:text-rose-900"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-rose-300 rounded"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-rose-800">
                I agree to the{" "}
                <Link to={"/terms"} className="font-bold text-rose-700 underline underline-offset-4 hover:text-rose-800">
                  Terms and Conditions
                </Link>
              </label>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-rose-200/60 transition-all"
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Creating account...
                </div>
              ) : (
                "Create Account"
              )}
            </Button>
          </form>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-rose-100">
          {/* Header */}
          <div className="px-8 pt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-rose-200">
              <Crown className="w-4 h-4" />
              Join TheLoveCraft
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-2">Create Account</h2>
            <p className="text-rose-700 text-sm mb-6">
              {currentStep === 1 && "Step 1 of 3 • Verify your email"}
              {currentStep === 2 && "Step 2 of 3 • Enter the one-time code"}
              {currentStep === 3 && "Step 3 of 3 • Set your password"}
            </p>
          </div>

          {/* Body */}
          <div className="px-8 pb-8">{renderStep()}</div>

          {/* Footer */}
          {currentStep === 1 && (
            <div className="px-8 pb-8 -mt-2">
              <p className="text-center text-sm text-rose-700">
                Already have an account?{" "}
                <Link to="/login" className="font-bold text-rose-700 underline underline-offset-4 hover:text-rose-800">
                  Sign in
                </Link>
              </p>
            </div>
          )}

          {/* Accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-pink-200 via-rose-300 to-red-200" />
        </div>
      </div>
    </div>
  );
};

export default Signup;
