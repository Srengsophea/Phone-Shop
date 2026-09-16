import React, { useEffect, useState } from 'react';
import { Tag, Plus, Trash2, X } from 'lucide-react';
import api from '../../api/axios';
import { Coupon } from '../../types';
import { formatPrice } from '../../utils/formatters';

export const AdminCouponsPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    code: '',
    type: 'percentage',
    value: '',
    min_spend: '',
    max_discount: '',
    usage_limit: 100,
  });

  const loadCoupons = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/coupons');
      setCoupons(response.data.data);
    } catch (err) {
      console.error('Error loading coupons', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/coupons', {
        code: formData.code.toUpperCase(),
        type: formData.type,
        value: Number(formData.value),
        min_spend: formData.min_spend ? Number(formData.min_spend) : null,
        max_discount: formData.max_discount ? Number(formData.max_discount) : null,
        usage_limit: Number(formData.usage_limit),
      });

      setIsModalOpen(false);
      loadCoupons();
    } catch (err) {
      console.error('Error creating coupon', err);
    }
  };

  const handleDeleteCoupon = async (id: number) => {
    if (confirm('Delete this coupon code?')) {
      await api.delete(`/admin/coupons/${id}`);
      loadCoupons();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Promotional Coupons</h1>
          <p className="text-xs text-slate-400 mt-1">Create and manage percentage and fixed discount codes</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon Code</span>
        </button>
      </div>

      <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
            <tr>
              <th className="py-3 px-4">Coupon Code</th>
              <th className="py-3 px-4">Discount Type</th>
              <th className="py-3 px-4">Value</th>
              <th className="py-3 px-4">Min. Spend</th>
              <th className="py-3 px-4">Max. Discount</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-white text-sm tracking-wider">{c.code}</td>
                <td className="py-3.5 px-4 uppercase text-[11px] font-semibold text-slate-300">{c.type}</td>
                <td className="py-3.5 px-4 font-bold text-blue-400">
                  {c.type === 'percentage' ? `${c.value}% OFF` : formatPrice(c.value)}
                </td>
                <td className="py-3.5 px-4 text-slate-300">{c.min_spend ? formatPrice(c.min_spend) : 'None'}</td>
                <td className="py-3.5 px-4 text-slate-300">{c.max_discount ? formatPrice(c.max_discount) : 'Unlimited'}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    c.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {c.is_active ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleDeleteCoupon(c.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

            <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Create Discount Coupon</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Coupon Code (Uppercase)</label>
                  <input
                    type="text"
                    required
                    placeholder="PHONEHUB10"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono uppercase"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount ($)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Discount Value</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      placeholder={formData.type === 'percentage' ? '10' : '50.00'}
                      value={formData.value}
                      onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Min Spend ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="100.00"
                      value={formData.min_spend}
                      onChange={(e) => setFormData({ ...formData, min_spend: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Max Discount ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="50.00"
                      value={formData.max_discount}
                      onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
                  >
                    Create Coupon
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
