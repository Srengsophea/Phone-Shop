import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  User as UserIcon,
  Package,
  Heart,
  MapPin,
  Clock,
  CheckCircle2,
  ShieldCheck,
  Plus,
  Trash2,
  Eye
} from 'lucide-react';
import api from '../api/axios';
import { User, Order, Address } from '../types';
import { useAuthStore } from '../stores/authStore';
import { formatPrice, formatDate } from '../utils/formatters';

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuthStore();

  const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'addresses' | 'security'>('overview');
  const [stats, setStats] = useState({ total_orders: 0, pending_orders: 0, completed_orders: 0, wishlist_count: 0 });
  const [orders, setOrders] = useState<Order[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Profile form state
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [profileMsg, setProfileMsg] = useState<string | null>(null);

  // Address form modal
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [newAddress, setNewAddress] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line_1: '',
    village: '',
    commune: '',
    district: '',
    province: 'Phnom Penh',
    country: 'Cambodia',
    is_default: false,
  });

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [dashRes, ordersRes, addrRes] = await Promise.all([
        api.get('/user/dashboard'),
        api.get('/orders'),
        api.get('/user/addresses'),
      ]);

      setStats(dashRes.data.data.stats);
      setOrders(ordersRes.data.data);
      setAddresses(addrRes.data.data);
    } catch (err) {
      console.error('Failed to load user dashboard data', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await updateProfile({ name, phone });
    setProfileMsg(success ? 'Profile updated successfully.' : 'Failed to update profile.');
    setTimeout(() => setProfileMsg(null), 3000);
  };

  const handleCreateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/user/addresses', newAddress);
      setIsAddressModalOpen(false);
      loadData();
    } catch (err) {
      console.error('Error creating address', err);
    }
  };

  const handleDeleteAddress = async (id: number) => {
    if (confirm('Delete this delivery address?')) {
      await api.delete(`/user/addresses/${id}`);
      loadData();
    }
  };

  const handleSetDefaultAddress = async (id: number) => {
    await api.post(`/user/addresses/${id}/default`);
    loadData();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* User Header Profile Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/25">
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email} • {user?.phone || 'No phone set'}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 rounded-full bg-blue-600/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider">
              {user?.role || 'Customer'}
            </span>
          </div>
        </div>

        {/* Quick Stats Pills */}
        <div className="flex items-center gap-4 text-center">
          <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="block text-xl font-extrabold text-white">{stats.total_orders}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Total Orders</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="block text-xl font-extrabold text-blue-400">{stats.pending_orders}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Active</span>
          </div>
          <div className="px-4 py-2 rounded-2xl bg-slate-950 border border-slate-800">
            <span className="block text-xl font-extrabold text-rose-400">{stats.wishlist_count}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Wishlist</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'overview' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Overview & Recent Orders
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'orders' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          All Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('addresses')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'addresses' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Delivery Addresses ({addresses.length})
        </button>
        <button
          onClick={() => setActiveTab('security')}
          className={`pb-3 border-b-2 transition-colors ${
            activeTab === 'security' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          Account Settings
        </button>
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Recent Smartphone Orders</h3>
            <button onClick={() => setActiveTab('orders')} className="text-xs text-blue-400 hover:underline">
              View All
            </button>
          </div>

          {orders.length === 0 ? (
            <div className="p-12 rounded-3xl bg-slate-900/30 border border-slate-800 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-white">No orders yet</p>
              <p className="text-xs text-slate-400">Discover our collection of flagship smartphones.</p>
              <Link to="/products" className="inline-block mt-3 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold">
                Shop Phones
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white">#{order.order_number}</span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold uppercase text-[10px]">
                        {order.status}
                      </span>
                    </div>
                    <p className="text-slate-400">{formatDate(order.created_at)} • {order.items?.length || 1} Products</p>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className="text-sm font-extrabold text-white">{formatPrice(order.total_amount)}</span>
                    <Link
                      to={`/orders/track/${order.order_number}`}
                      className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center gap-1.5"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Track Order</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: All Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          <h3 className="text-base font-bold text-white">Complete Order History</h3>
          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-white">#{order.order_number}</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 font-semibold uppercase text-[10px]">
                      {order.status}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase text-[10px]">
                      {order.payment_status}
                    </span>
                  </div>
                  <p className="text-slate-400">{formatDate(order.created_at)} • Payment: {order.payment_method}</p>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm font-extrabold text-white">{formatPrice(order.total_amount)}</span>
                  <Link
                    to={`/orders/track/${order.order_number}`}
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Tracking</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Delivery Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Saved Delivery Addresses</h3>
            <button
              onClick={() => setIsAddressModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div
                key={addr.id}
                className={`p-5 rounded-2xl border transition-all space-y-3 ${
                  addr.is_default ? 'bg-blue-600/10 border-blue-500/40' : 'bg-slate-900/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-white text-sm">{addr.full_name}</h4>
                  {addr.is_default && (
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      DEFAULT
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-300">{addr.phone}</p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {addr.address_line_1}, {addr.commune ? `Sangkat ${addr.commune}, ` : ''}{addr.district ? `Khan ${addr.district}, ` : ''}{addr.province}, {addr.country}
                </p>

                <div className="pt-2 flex items-center justify-between border-t border-slate-800/80 text-xs">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefaultAddress(addr.id)}
                      className="text-blue-400 hover:underline"
                    >
                      Set as Default
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    className="text-rose-400 hover:text-rose-300 ml-auto flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Account Settings */}
      {activeTab === 'security' && (
        <div className="max-w-xl space-y-6">
          <h3 className="text-base font-bold text-white">Update Personal Profile</h3>

          {profileMsg && (
            <p className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
              {profileMsg}
            </p>
          )}

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
              />
            </div>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
            >
              Save Changes
            </button>
          </form>
        </div>
      )}

      {/* New Address Modal */}
      {isAddressModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div onClick={() => setIsAddressModalOpen(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

            <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-bold text-white">Add Delivery Address</h3>

              <form onSubmit={handleCreateAddress} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    value={newAddress.full_name}
                    onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
                  <input
                    type="tel"
                    required
                    value={newAddress.phone}
                    onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Street Address</label>
                  <input
                    type="text"
                    required
                    value={newAddress.address_line_1}
                    onChange={(e) => setNewAddress({ ...newAddress, address_line_1: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Province</label>
                    <select
                      value={newAddress.province}
                      onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      <option value="Phnom Penh">Phnom Penh</option>
                      <option value="Siem Reap">Siem Reap</option>
                      <option value="Battambang">Battambang</option>
                      <option value="Sihanoukville">Sihanoukville</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Khan / District</label>
                    <input
                      type="text"
                      value={newAddress.district}
                      onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="set_default"
                    checked={newAddress.is_default}
                    onChange={(e) => setNewAddress({ ...newAddress, is_default: e.target.checked })}
                    className="rounded border-slate-700 text-blue-600"
                  />
                  <label htmlFor="set_default" className="text-xs text-slate-300 cursor-pointer">
                    Set as default shipping address
                  </label>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAddressModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
                  >
                    Save Address
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
