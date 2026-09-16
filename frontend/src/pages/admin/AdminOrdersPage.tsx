import React, { useEffect, useState } from 'react';
import { ShoppingBag, Search, Eye, X, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../../api/axios';
import { Order, OrderStatus } from '../../types';
import { formatPrice, formatDate } from '../../utils/formatters';

export const AdminOrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Status update state
  const [newStatus, setNewStatus] = useState<OrderStatus>('pending');
  const [statusNotes, setStatusNotes] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('pending');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params: Record<string, any> = {};
      if (statusFilter) params.status = statusFilter;
      if (search) params.search = search;

      const response = await api.get('/admin/orders', { params });
      setOrders(response.data.data);
    } catch (err) {
      console.error('Error loading orders', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, search]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setPaymentStatus(order.payment_status);
    setStatusNotes('');
    setFeedback(null);
  };

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      const response = await api.put(`/admin/orders/${selectedOrder.id}/status`, {
        status: newStatus,
        notes: statusNotes || `Order updated to ${newStatus}`,
        payment_status: paymentStatus,
      });

      setSelectedOrder(response.data.data);
      setFeedback('Order status updated successfully.');
      loadOrders();
      setTimeout(() => setFeedback(null), 2500);
    } catch (err: any) {
      setFeedback(err.response?.data?.message || 'Failed to update order status.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Order Fulfillment & Management</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review customer shipments, update tracking progressions, and manage payments.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by order # or customer..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="processing">Processing</option>
          <option value="packed">Packed</option>
          <option value="shipped">Shipped</option>
          <option value="out_for_delivery">Out for Delivery</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </select>
      </div>

      {/* Orders Table */}
      <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
            <tr>
              <th className="py-3 px-4">Order #</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Total Amount</th>
              <th className="py-3 px-4">Fulfillment Status</th>
              <th className="py-3 px-4">Payment</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-slate-800/20 transition-colors">
                <td className="py-3.5 px-4 font-mono font-bold text-white">#{o.order_number}</td>
                <td className="py-3.5 px-4 text-slate-400">{formatDate(o.created_at)}</td>
                <td className="py-3.5 px-4">
                  <p className="font-semibold text-slate-200">{o.shipping_address_snapshot?.full_name}</p>
                  <p className="text-[11px] text-slate-400">{o.shipping_address_snapshot?.phone}</p>
                </td>
                <td className="py-3.5 px-4 font-extrabold text-white">{formatPrice(o.total_amount)}</td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold uppercase text-[10px]">
                    {o.status.replace('_', ' ')}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 uppercase text-[10px] font-semibold">
                    {o.payment_method} ({o.payment_status})
                  </span>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleOpenDetail(o)}
                    className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 ml-auto"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Manage</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Detail & Progression Drawer Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div onClick={() => setSelectedOrder(null)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

            <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl z-10 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white">Order #{selectedOrder.order_number}</h3>
                  <p className="text-xs text-slate-400">Placed on {formatDate(selectedOrder.created_at)}</p>
                </div>
                <button onClick={() => setSelectedOrder(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedback && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                  {feedback}
                </div>
              )}

              {/* Status Update Form */}
              <form onSubmit={handleUpdateStatus} className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Update Progression</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Fulfillment Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="processing">Processing</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="out_for_delivery">Out for Delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled (Auto-Restock)</option>
                      <option value="refunded">Refunded (Auto-Restock)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Payment Status</label>
                    <select
                      value={paymentStatus}
                      onChange={(e) => setPaymentStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="failed">Failed</option>
                      <option value="refunded">Refunded</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-400 mb-1">Internal Note / Tracking Log</label>
                  <input
                    type="text"
                    value={statusNotes}
                    onChange={(e) => setStatusNotes(e.target.value)}
                    placeholder="e.g. Courier assigned with tracking code..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold"
                  >
                    Save Status Progression
                  </button>
                </div>
              </form>

              {/* Items Snapshot */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Purchased Items Snapshot</h4>
                <div className="divide-y divide-slate-800 border border-slate-800 rounded-2xl p-4 bg-slate-950/40">
                  {selectedOrder.items?.map((item) => (
                    <div key={item.id} className="py-2.5 first:pt-0 last:pb-0 flex justify-between text-xs">
                      <div>
                        <p className="font-bold text-white">{item.product_name}</p>
                        <p className="text-slate-400 font-mono text-[11px]">SKU: {item.sku} • Qty: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-white">{formatPrice(item.subtotal)}</span>
                    </div>
                  ))}
                  <div className="pt-3 flex justify-between font-bold text-white text-sm">
                    <span>Total Order Value</span>
                    <span className="text-blue-400">{formatPrice(selectedOrder.total_amount)}</span>
                  </div>
                </div>
              </div>

              {/* Shipping Address Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-bold text-white text-sm">{selectedOrder.shipping_address_snapshot?.full_name}</p>
                <p className="text-blue-400 font-medium">{selectedOrder.shipping_address_snapshot?.phone}</p>
                <p>{selectedOrder.shipping_address_snapshot?.address_line_1}, {selectedOrder.shipping_address_snapshot?.commune}, {selectedOrder.shipping_address_snapshot?.province}</p>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
