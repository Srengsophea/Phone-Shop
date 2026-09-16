import React, { useEffect, useState } from 'react';
import { Star, Check, X, Eye } from 'lucide-react';
import api from '../../api/axios';
import { Review } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AdminReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [statusFilter, setStatusFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadReviews = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/reviews', { params: { status: statusFilter } });
      setReviews(response.data.data);
    } catch (err) {
      console.error('Error loading reviews', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, [statusFilter]);

  const handleUpdateStatus = async (id: number, status: 'approved' | 'rejected') => {
    await api.put(`/admin/reviews/${id}/status`, { status });
    loadReviews();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer Reviews Moderation</h1>
          <p className="text-xs text-slate-400 mt-1">Review feedback, verified purchase badges, and approve or reject submissions</p>
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
        >
          <option value="">All Reviews</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
            <tr>
              <th className="py-3 px-4">Smartphone</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Rating & Review</th>
              <th className="py-3 px-4">Verified Purchase</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Moderation</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {reviews.map((r: any) => (
              <tr key={r.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3.5 px-4 font-bold text-white max-w-[180px] truncate">
                  {r.product?.name}
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-slate-200">{r.user?.name}</p>
                  <p className="text-[10px] text-slate-400">{formatDate(r.created_at)}</p>
                </td>
                <td className="py-3.5 px-4 max-w-xs space-y-1">
                  <div className="flex items-center text-amber-400">
                    {[...Array(r.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                  </div>
                  <p className="font-semibold text-white">{r.title}</p>
                  <p className="text-slate-400 text-[11px] line-clamp-2">{r.comment}</p>
                </td>
                <td className="py-3.5 px-4">
                  {r.is_verified_purchase ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 font-bold text-[10px]">
                      VERIFIED
                    </span>
                  ) : (
                    <span className="text-slate-500 text-[11px]">Unverified</span>
                  )}
                </td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full font-bold uppercase text-[10px] ${
                    r.status === 'approved'
                      ? 'bg-emerald-500/15 text-emerald-400'
                      : r.status === 'rejected'
                      ? 'bg-rose-500/15 text-rose-400'
                      : 'bg-amber-500/15 text-amber-400'
                  }`}>
                    {r.status}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    {r.status !== 'approved' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'approved')}
                        className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-all"
                        title="Approve Review"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                    {r.status !== 'rejected' && (
                      <button
                        onClick={() => handleUpdateStatus(r.id, 'rejected')}
                        className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
                        title="Reject Review"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
