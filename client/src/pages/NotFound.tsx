import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Crown, Sparkles, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 px-4">
      <div className="w-full max-w-md text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pink-100 to-rose-100 text-rose-800 px-4 py-2 rounded-full text-sm font-bold mb-5 border border-rose-200">
          <Crown className="w-4 h-4" />
          Lost in Treasures
          <Sparkles className="w-4 h-4" />
        </div>

        {/* Card */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-rose-100 shadow-2xl shadow-rose-200/40 overflow-hidden">
          <div className="px-8 pt-8 pb-6">
            <div className="text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 leading-none mb-3">
              404
            </div>
            <h1 className="text-xl font-black text-gray-900 mb-2">
              Page not found
            </h1>
            <p className="text-rose-700 text-sm mb-6">
              The link is a bit shy today. Let’s guide the journey back to our treasures.
            </p>

            <Link
              to="/"
              className="inline-flex items-center justify-center gap-2 w-full rounded-2xl px-4 py-3 text-sm font-bold bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white hover:from-pink-700 hover:via-rose-700 hover:to-red-800 transition-all duration-300 shadow-lg hover:shadow-rose-200/60"
            >
              <ArrowLeft className="w-4 h-4" />
              Return to Home
            </Link>

            <div className="mt-4 text-[11px] text-rose-600">
              Requested: <code className="font-mono">{location.pathname}</code>
            </div>
          </div>

          {/* Bottom glow strip */}
          <div className="h-1 w-full bg-gradient-to-r from-pink-200 via-rose-300 to-red-200" />
        </div>
      </div>
    </div>
  );
};

export default NotFound;
