"use client";

import { useState, useEffect } from "react";
import { 
  Save, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  Check, 
  Plus, 
  Trash2, 
  Edit3, 
  Ticket, 
  Power, 
  PowerOff,
  X,
  Eye,
  EyeOff
} from "lucide-react";
import { useRouter } from "next/navigation";

interface Coupon {
  id: number;
  code: string;
  description: string;
  discountType: string;
  discountValue: number;
  minPurchaseAmount: number;
  cutoffPrice: number | null;
  targetType: string;
  targetValue: string | null;
  isActive: boolean;
  isVisible: boolean;
  expiresAt: string | null;
  createdAt: string;
}

export default function CouponsAdminPage() {
  const router = useRouter();
  
  // State
  const [couponsList, setCouponsList] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  
  // Form State
  const [editingId, setEditingId] = useState<number | null>(null);
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState("flat"); // flat or percentage
  const [discountValue, setDiscountValue] = useState("");
  const [minPurchaseAmount, setMinPurchaseAmount] = useState("");
  const [cutoffPrice, setCutoffPrice] = useState("");
  const [targetType, setTargetType] = useState("all"); // all, first_order, category, product
  const [targetValue, setTargetValue] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const [expiresAt, setExpiresAt] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [categoriesList, setCategoriesList] = useState<string[]>([]);

  const fetchCoupons = async () => {
    try {
      const res = await fetch("/api/admin/coupons");
      const data = await res.json();
      if (data.success) {
        setCouponsList(data.data);
        if (data.categories) {
          setCategoriesList(data.categories);
        }
      } else {
        setError(data.error || "Failed to load coupons.");
      }
      
      if (res.status === 401) {
        router.push("/admin/login");
      }
    } catch (err) {
      setError("Failed to fetch coupons.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, [router]);

  const resetForm = () => {
    setEditingId(null);
    setCode("");
    setDescription("");
    setDiscountType("flat");
    setDiscountValue("");
    setMinPurchaseAmount("");
    setCutoffPrice("");
    setTargetType("all");
    setTargetValue("");
    setIsActive(true);
    setIsVisible(true);
    setExpiresAt("");
    setShowForm(false);
  };

  const handleEditClick = (coupon: Coupon) => {
    setEditingId(coupon.id);
    setCode(coupon.code);
    setDescription(coupon.description);
    setDiscountType(coupon.discountType);
    setDiscountValue(coupon.discountValue.toString());
    setMinPurchaseAmount(coupon.minPurchaseAmount.toString());
    setCutoffPrice(coupon.cutoffPrice?.toString() || "");
    setTargetType(coupon.targetType);
    setTargetValue(coupon.targetValue || "");
    setIsActive(coupon.isActive);
    setIsVisible(coupon.isVisible !== undefined ? coupon.isVisible : true);
    setExpiresAt(coupon.expiresAt || "");
    setShowForm(true);
    // Scroll to top or form container
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !description.trim() || !discountValue) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    const payload = {
      id: editingId,
      code: code.trim().toUpperCase(),
      description: description.trim(),
      discountType,
      discountValue: Number(discountValue),
      minPurchaseAmount: minPurchaseAmount ? Number(minPurchaseAmount) : 0,
      cutoffPrice: cutoffPrice ? Number(cutoffPrice) : null,
      targetType,
      targetValue: targetValue.trim() || null,
      isActive,
      isVisible,
      expiresAt: expiresAt || null,
    };

    try {
      const url = "/api/admin/coupons";
      const method = editingId ? "PUT" : "POST";
      
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(editingId ? "Coupon updated successfully!" : "Coupon created successfully!");
        resetForm();
        fetchCoupons();
        router.refresh();
      } else {
        setError(data.error || "Failed to save coupon.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCouponStatus = async (coupon: Coupon) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon.id,
          isActive: !coupon.isActive
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Coupon ${coupon.code} ${!coupon.isActive ? 'enabled' : 'disabled'} successfully!`);
        fetchCoupons();
        router.refresh();
      } else {
        setError(data.error || "Failed to update status.");
      }
    } catch (err) {
      setError("Failed to toggle coupon status.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleCouponVisibility = async (coupon: Coupon) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch("/api/admin/coupons", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: coupon.id,
          isVisible: !coupon.isVisible
        }),
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess(`Coupon ${coupon.code} visibility changed to ${!coupon.isVisible ? 'Public' : 'Private'} successfully!`);
        fetchCoupons();
        router.refresh();
      } else {
        setError(data.error || "Failed to update visibility.");
      }
    } catch (err) {
      setError("Failed to toggle coupon visibility.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this coupon?")) return;

    setIsSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/admin/coupons?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      
      if (data.success) {
        setSuccess("Coupon deleted successfully!");
        fetchCoupons();
        router.refresh();
      } else {
        setError(data.error || "Failed to delete coupon.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-10">
      {/* Centered Heading */}
      <div className="text-center space-y-2">
        <div className="inline-flex p-3 bg-[#1B3022]/5 rounded-3xl text-[#1B3022] mb-2">
          <Ticket size={32} />
        </div>
        <h1 className="text-4xl font-gabriola font-bold text-[#1B3022] tracking-wide">
          Manage Coupon Codes
        </h1>
        <p className="text-xs uppercase tracking-widest text-[#C5A059] font-black">
          Add and configure storefront discount offers
        </p>
      </div>

      {/* Messages */}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <Check className="flex-shrink-0" size={18} />
          <span className="text-sm font-bold">{success}</span>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-2xl flex items-center space-x-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <AlertCircle className="flex-shrink-0" size={18} />
          <span className="text-sm font-bold">{error}</span>
        </div>
      )}

      {/* Add / Edit Form Panel */}
      {showForm ? (
        <div className="bg-white border border-[#1B3022]/5 rounded-[2rem] p-8 shadow-xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center justify-between border-b border-brand/5 pb-4 mb-6">
            <h3 className="text-lg font-bold text-[#1B3022] uppercase tracking-tight flex items-center gap-2">
              <Sparkles size={18} className="text-[#C5A059]" />
              {editingId ? "Edit Coupon Details" : "Create New Coupon"}
            </h3>
            <button 
              onClick={resetForm} 
              className="p-2 text-[#1B3022]/40 hover:text-[#1B3022] rounded-full hover:bg-[#1B3022]/5 transition-all"
            >
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest block ml-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FESTIVE15"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all uppercase"
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest block ml-1">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Flat 15% Off above ₹15,000"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Discount Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest block ml-1">Discount Type</label>
                <select
                  value={discountType}
                  onChange={(e) => {
                    setDiscountType(e.target.value);
                    if (e.target.value === "flat") setCutoffPrice("");
                  }}
                  className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all cursor-pointer"
                >
                  <option value="flat">Flat Amount (₹)</option>
                  <option value="percentage">Percentage (%)</option>
                </select>
              </div>

              {/* Discount Value */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest block ml-1">
                  Discount Value {discountType === "flat" ? "(₹)" : "(%)"}
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder={discountType === "flat" ? "e.g. 500" : "e.g. 15"}
                  value={discountValue}
                  onChange={(e) => setDiscountValue(e.target.value)}
                  className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all"
                />
              </div>

              {/* Min Purchase Amount */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest block ml-1">Min Purchase (₹)</label>
                <input
                  type="number"
                  min="0"
                  placeholder="e.g. 1999"
                  value={minPurchaseAmount}
                  onChange={(e) => setMinPurchaseAmount(e.target.value)}
                  className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Cutoff Price (only for percentage) */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest block ml-1 ${discountType === 'percentage' ? 'text-[#1B3022]/40' : 'text-[#1B3022]/20'}`}>
                  Cutoff Price Cap (₹) {discountType !== 'percentage' && '(Percentage Only)'}
                </label>
                <input
                  type="number"
                  min="0"
                  disabled={discountType !== "percentage"}
                  placeholder="e.g. 20000"
                  value={cutoffPrice}
                  onChange={(e) => setCutoffPrice(e.target.value)}
                  className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>

              {/* Target Type */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest block ml-1">Applicable Customer/Products</label>
                <select
                  value={targetType}
                  onChange={(e) => {
                    setTargetType(e.target.value);
                    if (e.target.value === "all" || e.target.value === "first_order") setTargetValue("");
                  }}
                  className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all cursor-pointer"
                >
                  <option value="all">All Purchases</option>
                  <option value="first_order">First Order Placement Only</option>
                  <option value="category">Specific Categories (comma separated)</option>
                  <option value="product">Specific Product IDs / SKUs (comma separated)</option>
                </select>
              </div>

              {/* Target Value */}
              <div className="space-y-2">
                <label className={`text-[10px] font-black uppercase tracking-widest block ml-1 ${['category', 'product'].includes(targetType) ? 'text-[#1B3022]/40' : 'text-[#1B3022]/20'}`}>
                  Target Criteria {!['category', 'product'].includes(targetType) && '(Not Required)'}
                </label>
                
                {targetType === "category" ? (
                  <select
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all cursor-pointer"
                  >
                    <option value="">-- Select Category --</option>
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    disabled={!["category", "product"].includes(targetType)}
                    placeholder={
                      targetType === "product" 
                        ? "e.g. 1, 2, SHIRT-XL, Ethnic Wear" 
                        : "No target details needed"
                    }
                    value={targetValue}
                    onChange={(e) => setTargetValue(e.target.value)}
                    className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  />
                )}

                {["category", "product"].includes(targetType) && (
                  <p className="text-[9px] text-[#1B3022]/45 font-semibold ml-1 mt-1 leading-normal">
                    {targetType === "category" 
                      ? "* Select an available category from the dropdown menu to restrict this coupon." 
                      : "* Enter multiple product IDs or SKUs separated by commas. Any matching item in cart will get this discount."}
                  </p>
                )}
              </div>
            </div>

            {/* Expiry Date & Visibility / Active Status Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Expiry Date */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest block ml-1">Expiry Date (Optional)</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-brand-light border border-brand/5 rounded-2xl py-3.5 px-4 text-sm font-bold text-[#1B3022] focus:outline-none focus:ring-2 focus:ring-[#C5A059]/20 transition-all cursor-pointer"
                />
              </div>

              {/* Status checkboxes */}
              <div className="flex flex-col justify-center space-y-4 pt-4 md:pt-6">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="isActiveCheckbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-5 h-5 rounded border-[#1B3022]/20 text-[#1B3022] focus:ring-[#C5A059]/20 cursor-pointer"
                  />
                  <label htmlFor="isActiveCheckbox" className="text-xs font-bold text-[#1B3022]/80 uppercase tracking-widest cursor-pointer select-none">
                    Enable Coupon (Active)
                  </label>
                </div>

                <div className="flex flex-col space-y-1">
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      id="isVisibleCheckbox"
                      checked={isVisible}
                      onChange={(e) => setIsVisible(e.target.checked)}
                      className="w-5 h-5 rounded border-[#1B3022]/20 text-[#1B3022] focus:ring-[#C5A059]/20 cursor-pointer"
                    />
                    <label htmlFor="isVisibleCheckbox" className="text-xs font-bold text-[#1B3022]/80 uppercase tracking-widest cursor-pointer select-none">
                      Show publicly in storefront
                    </label>
                  </div>
                  <p className="text-[9px] text-[#1B3022]/45 font-semibold ml-8 leading-normal">
                    * If unchecked, this coupon is hidden from the public "Available Offers" list, but remains valid when manually entered.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-4 pt-4 border-t border-brand/5">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-4 border-2 border-brand/5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#1B3022]/40 hover:bg-brand-light transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-4 bg-[#1B3022] text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1B3022]/90 shadow-lg transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Save size={14} /> {editingId ? "Update Coupon" : "Create Coupon"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="flex justify-end">
          <button
            onClick={() => setShowForm(true)}
            className="bg-[#1B3022] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#1B3022]/90 transition-all shadow-md active:scale-95 flex items-center gap-2"
          >
            <Plus size={16} /> Add Coupon Code
          </button>
        </div>
      )}

      {/* Coupons Table Listing */}
      <div className="bg-white border border-[#1B3022]/5 rounded-[2rem] overflow-hidden shadow-lg">
        <div className="p-6 border-b border-brand/5 flex items-center justify-between">
          <h3 className="text-md font-bold text-[#1B3022] uppercase tracking-tight">Active & Inactive Coupons</h3>
          <span className="text-[10px] font-bold text-white bg-[#C5A059] px-3 py-1 rounded-full uppercase tracking-widest">
            {couponsList.length} Total
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-[#C5A059] animate-spin" />
          </div>
        ) : couponsList.length === 0 ? (
          <div className="py-20 text-center text-[#1B3022]/40 font-bold text-sm">
            No coupons added yet. Click "Add Coupon Code" above to get started.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-light/50 border-b border-brand/5">
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Code</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Description</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Discount</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Min Purchase</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Cutoff Cap</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Target</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Visibility</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Expiry</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest">Status</th>
                  <th className="py-4 px-6 text-[10px] font-black text-[#1B3022]/40 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand/5">
                {couponsList.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-brand-light/20 transition-all">
                    {/* Code */}
                    <td className="py-4 px-6">
                      <span className="font-bold text-[#1B3022] tracking-wider font-mono bg-brand-light px-3 py-1.5 rounded-lg border border-brand/5">
                        {coupon.code}
                      </span>
                    </td>
                    
                    {/* Description */}
                    <td className="py-4 px-6 text-sm font-medium text-[#1B3022]/80 max-w-[200px] truncate">
                      {coupon.description}
                    </td>

                    {/* Discount Value */}
                    <td className="py-4 px-6 text-sm font-bold text-[#1B3022]">
                      {coupon.discountType === "flat" ? `₹${coupon.discountValue}` : `${coupon.discountValue}%`}
                    </td>

                    {/* Min Purchase */}
                    <td className="py-4 px-6 text-sm text-[#1B3022]/60 font-mono">
                      ₹{coupon.minPurchaseAmount}
                    </td>

                    {/* Cutoff Price */}
                    <td className="py-4 px-6 text-sm text-[#1B3022]/60 font-mono">
                      {coupon.cutoffPrice ? `₹${coupon.cutoffPrice}` : "-"}
                    </td>

                    {/* Target */}
                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#C5A059]">
                          {coupon.targetType === "first_order" ? "1st Purchase" : coupon.targetType === "all" ? "All Orders" : coupon.targetType}
                        </span>
                        {coupon.targetValue && (
                          <span className="text-[9px] text-[#1B3022]/40 font-bold truncate max-w-[120px]">
                            {coupon.targetValue}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Visibility */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleCouponVisibility(coupon)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                          coupon.isVisible 
                            ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                            : 'bg-amber-100 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {coupon.isVisible ? (
                          <>
                            <Eye size={10} /> Public
                          </>
                        ) : (
                          <>
                            <EyeOff size={10} /> Private
                          </>
                        )}
                      </button>
                    </td>

                    {/* Expiry */}
                    <td className="py-4 px-6 text-sm font-semibold text-[#1B3022]/70 font-mono">
                      {coupon.expiresAt ? (
                        <span className={new Date(coupon.expiresAt + (coupon.expiresAt.length === 10 ? "T23:59:59" : "")) < new Date() ? "text-red-500 line-through" : ""}>
                          {coupon.expiresAt}
                        </span>
                      ) : (
                        <span className="text-[#1B3022]/30 italic font-sans text-xs">No Expiry</span>
                      )}
                    </td>

                    {/* Status Toggle Badge */}
                    <td className="py-4 px-6">
                      <button
                        onClick={() => toggleCouponStatus(coupon)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest shadow-sm cursor-pointer hover:scale-105 active:scale-95 transition-all ${
                          coupon.isActive 
                            ? 'bg-green-100 text-green-700 border border-green-200' 
                            : 'bg-red-100 text-red-700 border border-red-200'
                        }`}
                      >
                        {coupon.isActive ? (
                          <>
                            <Power size={10} /> Active
                          </>
                        ) : (
                          <>
                            <PowerOff size={10} /> Inactive
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-6 text-right space-x-2">
                      <button
                        onClick={() => handleEditClick(coupon)}
                        className="p-2 text-[#C5A059] hover:text-[#C5A059]/80 hover:bg-[#C5A059]/5 rounded-lg transition-all"
                        title="Edit Coupon"
                      >
                        <Edit3 size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="p-2 text-red-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                        title="Delete Coupon"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
