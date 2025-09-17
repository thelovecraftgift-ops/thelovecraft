import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Crown, Sparkles } from "lucide-react";
import { useAuth } from "../components/AuthContext";

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || "http://localhost:3000";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login({ email, password });
      if (result.success) {
        toast({ title: "Login successful", description: `Welcome back, ${email}!` });
        navigate("/");
      } else {
        toast({
          title: "Login failed",
          description: result.error || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch {
      toast({
        title: "Login failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  const togglePasswordVisibility = () => setShowPassword((s) => !s);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/90 backdrop-blur-lg rounded-3xl shadow-2xl overflow-hidden border-2 border-rose-100">
          {/* Header */}
          <div className="px-8 pt-8 text-center">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-bold mb-4 border border-rose-200">
              <Crown className="w-4 h-4" />
              Welcome Back
              <Sparkles className="w-4 h-4" />
            </div>
            <h2 className="text-2xl font-black text-gray-900 mb-1">Sign in to continue</h2>
            <p className="text-rose-700 text-sm mb-6">Access your treasures and orders</p>
          </div>

          {/* Body */}
          <div className="px-8 pb-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div className="space-y-2">
                <label htmlFor="email" className="block text-xs font-bold text-rose-800 uppercase tracking-wide">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="h-12 bg-white/70 border-2 border-rose-100 focus:border-rose-400 focus:ring-rose-400 rounded-xl"
                />
              </div>

              {/* Password */}
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
                    onClick={togglePasswordVisibility}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-rose-700 hover:text-rose-900"
                    aria-label="Toggle password visibility"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              {/* Remember + Forgot */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-rose-600 focus:ring-rose-500 border-rose-300 rounded"
                  />
                  <span className="text-sm text-rose-800">Remember me</span>
                </label>
                <Link to="/forgot-password" className="text-sm font-bold text-rose-700 underline underline-offset-4 hover:text-rose-800">
                  Forgot password?
                </Link>
              </div>

              {/* Sign in */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 hover:from-pink-700 hover:via-rose-700 hover:to-red-800 text-white font-bold shadow-lg hover:shadow-rose-200/60 transition-all"
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Signing in...
                  </div>
                ) : (
                  "Sign in"
                )}
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-rose-100" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white/90 text-rose-700">Or continue with</span>
                </div>
              </div>

              {/* Google */}
              <Button
                type="button"
                onClick={handleGoogleLogin}
                variant="outline"
                className="w-full h-12 rounded-2xl border-2 border-rose-200 text-rose-800 hover:bg-rose-50 font-bold"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>

              {/* Footer link */}
              <p className="text-center text-sm text-rose-700">
                Don’t have an account?{" "}
                <Link to="/signup" className="font-bold text-rose-700 underline underline-offset-4 hover:text-rose-800">
                  Sign up
                </Link>
              </p>
            </form>
          </div>

          {/* Accent strip */}
          <div className="h-1 w-full bg-gradient-to-r from-pink-200 via-rose-300 to-red-200" />
        </div>
      </div>
    </div>
  );
};

export default Login;
