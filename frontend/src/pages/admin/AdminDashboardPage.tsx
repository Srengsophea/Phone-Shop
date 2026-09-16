import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign,
  ShoppingBag,
  Clock,
  AlertTriangle,
  TrendingUp,
  Package,
  Users,
  Eye,
  ArrowRight
} from 'lucide-react';
import api from '../../api/axios';
import { formatPrice, formatDate } from '../../utils/formatters';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get('/admin/dashboard/stats');
        setData(response.data.data);
      } catch (err) {
        console.error('Failed to load dashboard statistics', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading || !data) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Loading store performance metrics...</p>
      </div>
    );
  }

  const { metrics, sales_over_time, category_distribution, recent_orders } = data;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Executive Dashboard</h1>
        <p className="text-xs text-slate-400 mt-1">Real-time smartphone store metrics, inventory alerts, and sales analytics</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Sales */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white">{formatPrice(metrics.total_sales)}</h3>
          <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Today: {formatPrice(metrics.today_sales)}</span>
          </p>
        </div>

        {/* Total Orders */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-white">{metrics.total_orders}</h3>
          <p className="text-[11px] text-slate-400">
            Fulfillment Rate: <strong>98.4%</strong>
          </p>
        </div>

        {/* Pending Orders */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Pending Fulfillment</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-amber-400">{metrics.pending_orders}</h3>
          <p className="text-[11px] text-slate-400">Requires processing</p>
        </div>

        {/* Low Stock Alerts */}
        <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Low Stock Alerts</span>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-extrabold text-rose-400">{metrics.low_stock_count}</h3>
          <p className="text-[11px] text-rose-400/80 font-medium">Out of stock: {metrics.out_of_stock_count}</p>
        </div>

      </div>

      {/* 7-Day Performance & Category Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Sales Timeline Bar Visual */}
        <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-white">7-Day Revenue Progression</h3>
              <p className="text-xs text-slate-400">Paid orders generated per day</p>
            </div>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
              This Week
            </span>
          </div>

          <div className="grid grid-cols-7 gap-3 pt-6 items-end h-52 border-b border-slate-800 pb-4">
            {sales_over_time.map((day: any, i: number) => {
              const maxRev = Math.max(...sales_over_time.map((d: any) => d.revenue), 1000);
              const heightPct = Math.max(15, Math.round((day.revenue / maxRev) * 100));

              return (
                <div key={i} className="flex flex-col items-center gap-2 h-full justify-end group">
                  <span className="text-[10px] text-slate-400 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    ${day.revenue}
                  </span>
                  <div
                    className="w-full max-w-[36px] bg-gradient-to-t from-blue-600 to-indigo-500 rounded-xl group-hover:brightness-125 transition-all shadow-md"
                    style={{ height: `${heightPct}%` }}
                  />
                  <span className="text-xs font-bold text-slate-300">{day.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Split */}
        <div className="lg:col-span-4 p-6 sm:p-8 rounded-3xl bg-slate-900/50 border border-slate-800 space-y-6">
          <h3 className="text-base font-bold text-white">Product Catalog Mix</h3>
          <div className="space-y-4">
            {category_distribution.map((cat: any) => (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300 font-medium">{cat.name}</span>
                  <span className="text-slate-500 font-mono">{cat.products_count} models</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{ width: `${Math.min(100, cat.products_count * 15)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-400">
            <Link to="/admin/inventory" className="text-blue-400 hover:underline flex items-center gap-1">
              <span>Inspect full inventory ledger</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

      </div>

      {/* Recent Orders Table */}
      <div className="rounded-3xl bg-slate-900/50 border border-slate-800 p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-white">Recent Smartphone Orders</h3>
            <p className="text-xs text-slate-400">Live order queue requiring fulfillment</p>
          </div>
          <Link
            to="/admin/orders"
            className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1"
          >
            <span>View all orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Total</th>
                <th className="py-3 px-4">Order Status</th>
                <th className="py-3 px-4">Payment</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {recent_orders.map((o: any) => (
                <tr key={o.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-white">#{o.order_number}</td>
                  <td className="py-3.5 px-4">
                    <p className="font-semibold text-slate-200">{o.user?.name}</p>
                    <p className="text-[11px] text-slate-400">{o.user?.email}</p>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-white">{formatPrice(o.total_amount)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold uppercase text-[10px]">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 uppercase text-[10px]">
                      {o.payment_status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <Link
                      to={`/admin/orders`}
                      className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold"
                    >
                      Manage
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
