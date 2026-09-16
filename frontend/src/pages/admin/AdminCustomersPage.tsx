import React, { useEffect, useState } from 'react';
import { Users, Search, ShieldCheck, ShieldAlert } from 'lucide-react';
import api from '../../api/axios';
import { User } from '../../types';
import { formatDate, formatPrice } from '../../utils/formatters';

export const AdminCustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const loadCustomers = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/admin/customers', { params: { search } });
      setCustomers(response.data.data);
    } catch (err) {
      console.error('Error loading customers', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [search]);

  const handleToggleStatus = async (id: number) => {
    await api.put(`/admin/customers/${id}/toggle-status`);
    loadCustomers();
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Customer Management</h1>
        <p className="text-xs text-slate-400 mt-1">Review customer spending volume, order counts, and toggle account access</p>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customers by name, email, or phone..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
            <tr>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Orders Count</th>
              <th className="py-3 px-4">Total Spending</th>
              <th className="py-3 px-4">Registered Date</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3.5 px-4 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                    {c.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white">{c.name}</p>
                    <p className="text-[11px] text-slate-400">{c.email} • {c.phone || 'No phone'}</p>
                  </div>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-semibold uppercase text-[10px]">
                    {c.role}
                  </span>
                </td>
                <td className="py-3.5 px-4 font-bold text-white">{c.orders_count || 0} orders</td>
                <td className="py-3.5 px-4 font-extrabold text-blue-400">{formatPrice(c.orders_sum_total_amount || 0)}</td>
                <td className="py-3.5 px-4 text-slate-400">{formatDate(c.created_at)}</td>
                <td className="py-3.5 px-4">
                  <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                    c.is_active ? 'bg-emerald-500/15 text-emerald-400' : 'bg-rose-500/15 text-rose-400'
                  }`}>
                    {c.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(c.id)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200"
                  >
                    {c.is_active ? 'Disable' : 'Enable'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
