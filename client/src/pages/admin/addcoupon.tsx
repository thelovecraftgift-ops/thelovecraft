import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Trash2, PlusCircle, Gift, ToggleRight } from "lucide-react";

const API = import.meta.env.VITE_REACT_APP_API_URL; // Backend base URL

type Coupon = {
  _id: string;
  code: string;
  percent?: number | null;
  rupees?: number | null;
  minOrder?: number;
  maxDiscount?: number | null;
  startsAt?: string | null;   // ISO strings from API
  expiresAt?: string | null;
  active: boolean;
  usageLimit?: number | null;
  usedCount?: number;
  createdAt?: string;
  updatedAt?: string;
};

const ManageCoupons = () => {
  // form state
  const [code, setCode] = useState("");
  const [percent, setPercent] = useState<string>("");
  const [rupees, setRupees] = useState<string>("");
  const [minOrder, setMinOrder] = useState<string>("");
  const [maxDiscount, setMaxDiscount] = useState<string>("");
  const [startsAt, setStartsAt] = useState<string>("");
  const [expiresAt, setExpiresAt] = useState<string>("");
  const [active, setActive] = useState<boolean>(true);
  const [usageLimit, setUsageLimit] = useState<string>("");

  // list state
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(false);

  // fetch coupons
  const fetchCoupons = async () => {
    try {
      setListLoading(true);
      const res = await axios.get(`${API}/admin/getCoupon`);
      setCoupons(res.data.data || []);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to load coupons 😢");
    } finally {
      setListLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // helpers
  const parseNumberOrNull = (v: string) => {
    if (v == null || v.trim() === "") return null;
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  };

  const payload = useMemo(() => {
    // send only meaningful fields, matching controller expectations
    const body: any = {
      code: code.trim().toUpperCase(),
      active,
    };
    const p = parseNumberOrNull(percent);
    const r = parseNumberOrNull(rupees);
    const mo = parseNumberOrNull(minOrder);
    const md = parseNumberOrNull(maxDiscount);
    const ul = parseNumberOrNull(usageLimit);

    if (p != null) body.percent = p;
    if (r != null) body.rupees = r;
    if (mo != null) body.minOrder = mo;
    if (md != null) body.maxDiscount = md;
    if (ul != null) body.usageLimit = ul;

    if (startsAt) body.startsAt = new Date(startsAt).toISOString();
    if (expiresAt) body.expiresAt = new Date(expiresAt).toISOString();

    return body;
  }, [code, percent, rupees, minOrder, maxDiscount, startsAt, expiresAt, active, usageLimit]);

  // Add coupon
  const handleAddCoupon = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      toast.warning("Coupon code is required");
      return;
    }
    const p = parseNumberOrNull(percent);
    const r = parseNumberOrNull(rupees);
    if ((p == null || p === 0) && (r == null || r === 0)) {
      toast.warning("Provide either percent or flat rupees discount");
      return;
    }
    if (p != null && (p < 0 || p > 100)) {
      toast.warning("Percent must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/admin/addcoupon`, payload);
      toast.success("🎉 Coupon added successfully!");
      // reset form
      setCode("");
      setPercent("");
      setRupees("");
      setMinOrder("");
      setMaxDiscount("");
      setStartsAt("");
      setExpiresAt("");
      setActive(true);
      setUsageLimit("");
      // refresh list
      fetchCoupons();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to add coupon");
    } finally {
      setLoading(false);
    }
  };

  // Delete coupon
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this coupon?")) return;
    try {
      await axios.post(`${API}/admin/deletecoupon`, { id });
      toast.success("🗑️ Coupon deleted");
      setCoupons((prev) => prev.filter((c) => c._id !== id));
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Delete failed");
    }
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return "";
    return d.toLocaleDateString();
  };

  const isUpcoming = (c: Coupon) => {
    if (!c.startsAt) return false;
    const now = Date.now();
    return new Date(c.startsAt).getTime() > now;
  };

  const isExpired = (c: Coupon) => {
    if (!c.expiresAt) return false;
    const now = Date.now();
    return new Date(c.expiresAt).getTime() < now;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-pink-50 py-12 px-4 flex justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-white rounded-3xl shadow-2xl border border-rose-200 p-8"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Gift className="w-12 h-12 text-rose-500" />
          </div>
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 via-rose-600 to-red-700">
            Manage Coupons
          </h1>
          <p className="text-gray-600 mt-2">
            Create, configure, and track discount coupons ✨
          </p>
        </div>

        {/* Add Coupon Form */}
        <form
          onSubmit={handleAddCoupon}
          className="bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 rounded-2xl p-6 shadow-inner mb-10"
        >
          <h3 className="text-xl font-bold text-rose-700 mb-4 flex items-center gap-2">
            <PlusCircle className="w-5 h-5" />
            Add New Coupon
          </h3>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            {/* Code */}
            <div>
              <label className="block text-sm font-semibold text-rose-600 mb-1">
                Code
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="LOVECRAFT10"
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
                required
              />
            </div>

            {/* Percent */}
            <div>
              <label className="block text-sm font-semibold text-rose-600 mb-1">
                Percent (%)
              </label>
              <input
                type="number"
                value={percent}
                onChange={(e) => setPercent(e.target.value)}
                placeholder="10"
                min={0}
                max={100}
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
              />
            </div>

            {/* Rupees */}
            <div>
              <label className="block text-sm font-semibold text-rose-600 mb-1">
                Flat Off (₹)
              </label>
              <input
                type="number"
                value={rupees}
                onChange={(e) => setRupees(e.target.value)}
                placeholder="100"
                min={0}
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
              />
            </div>
          </div>

          {/* Advanced config */}
          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-rose-600 mb-1">
                Min Order (₹)
              </label>
              <input
                type="number"
                value={minOrder}
                onChange={(e) => setMinOrder(e.target.value)}
                placeholder="0"
                min={0}
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-rose-600 mb-1">
                Max Discount Cap (₹)
              </label>
              <input
                type="number"
                value={maxDiscount}
                onChange={(e) => setMaxDiscount(e.target.value)}
                placeholder="e.g. 500"
                min={0}
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
              />
            </div>
            <div className="flex items-end gap-3">
              <div className="flex items-center gap-2">
                <ToggleRight className={`w-5 h-5 ${active ? "text-emerald-600" : "text-gray-400"}`} />
                <label className="text-sm font-semibold text-rose-600">Active</label>
              </div>
              <button
                type="button"
                onClick={() => setActive((s) => !s)}
                className={`ml-auto px-4 py-2 rounded-lg border ${active ? "bg-emerald-50 border-emerald-300 text-emerald-700" : "bg-gray-50 border-gray-300 text-gray-700"}`}
              >
                {active ? "Active" : "Inactive"}
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="block text-sm font-semibold text-rose-600 mb-1">
                Starts At
              </label>
              <input
                type="datetime-local"
                value={startsAt}
                onChange={(e) => setStartsAt(e.target.value)}
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-rose-600 mb-1">
                Expires At
              </label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-rose-600 mb-1">
                Usage Limit (total)
              </label>
              <input
                type="number"
                value={usageLimit}
                onChange={(e) => setUsageLimit(e.target.value)}
                placeholder="e.g. 100"
                min={0}
                className="w-full px-4 py-3 border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-rose-300 focus:border-rose-400 outline-none"
              />
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-pink-600 via-rose-600 to-red-700 text-white font-bold rounded-xl shadow-lg hover:from-pink-700 hover:to-red-800 transition-all"
          >
            {loading ? "Adding..." : "Add Coupon"}
          </motion.button>
        </form>

        {/* Coupon List */}
        <div className="bg-gradient-to-r from-rose-100 to-pink-100 border border-rose-200 rounded-2xl p-6 shadow-inner">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-rose-700">Existing Coupons</h3>
            {listLoading && <span className="text-sm text-rose-600">Loading…</span>}
          </div>

          {coupons.length === 0 ? (
            <p className="text-center text-rose-600 font-medium py-10">No coupons found.</p>
          ) : (
            <div className="grid gap-4">
              {coupons.map((c) => {
                const upcoming = isUpcoming(c);
                const expired = isExpired(c);
                return (
                  <motion.div
                    key={c._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between bg-white border-2 border-rose-200 rounded-xl shadow-sm hover:shadow-md p-4"
                  >
                    <div className="space-y-1">
                      <h4 className="font-bold text-rose-700 text-lg flex items-center gap-2">
                        {c.code}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full ${
                            c.active && !expired ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {expired ? "Expired" : c.active ? "Active" : "Inactive"}
                        </span>
                        {upcoming && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Upcoming</span>}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {c.percent ? `${c.percent}% off` : c.rupees ? `₹${c.rupees} off` : ""}
                        {c.minOrder ? ` • Min ₹${c.minOrder}` : ""}
                        {c.maxDiscount ? ` • Cap ₹${c.maxDiscount}` : ""}
                        {typeof c.usedCount === "number" ? ` • Used ${c.usedCount}${c.usageLimit ? `/${c.usageLimit}` : ""}` : ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        {c.startsAt ? `From ${formatDate(c.startsAt)} ` : ""}
                        {c.expiresAt ? `to ${formatDate(c.expiresAt)}` : ""}
                      </p>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(c._id)}
                      className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-red-500 to-rose-600 text-white font-bold rounded-lg shadow hover:from-red-600 hover:to-rose-700"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default ManageCoupons;
