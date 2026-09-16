import React, { useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Smartphone,
  Layers,
  ShoppingBag,
  Users,
  Tag,
  Star,
  FileText,
  LogOut,
  ExternalLink,
  ShieldAlert,
  ArrowLeft
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';

export const AdminLayout: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout, isLoading } = useAuthStore();

  const navItems = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Products & Variants', path: '/admin/products', icon: Smartphone },
    { label: 'Inventory Ledger', path: '/admin/inventory', icon: Layers },
    { label: 'Orders & Fulfillment', path: '/admin/orders', icon: ShoppingBag },
    { label: 'Customers', path: '/admin/customers', icon: Users },
    { label: 'Discount Coupons', path: '/admin/coupons', icon: Tag },
    { label: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
    { label: 'Audit Logs', path: '/admin/audit-logs', icon: FileText },
  ];

  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'manager');

  if (!isLoading && (!isAuthenticated || !isAdmin)) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="max-w-md w-full p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-white">Administrative Access Required</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            You must be logged in with an administrator account to access the PhoneHub management portal.
          </p>
          <div className="p-3 rounded-xl bg-slate-950 text-left text-xs space-y-1 font-mono text-slate-300">
            <p>Admin Email: <span className="text-blue-400">admin@example.com</span></p>
            <p>Password: <span className="text-blue-400">ChangeMe123!</span></p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Storefront</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex text-slate-100 selection:bg-blue-600 selection:text-white">
      
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900/80 backdrop-blur-md border-r border-slate-800 flex flex-col justify-between shrink-0 hidden md:flex">
        <div className="p-6 space-y-6">
          {/* Admin Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/25">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-white">Phone<span className="text-blue-500">Hub</span></span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-blue-400">Admin Control</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5 pt-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Info & Storefront Link */}
        <div className="p-6 border-t border-slate-800 space-y-3">
          <Link
            to="/"
            className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-300 hover:text-white hover:border-slate-700 transition-all"
          >
            <span className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-blue-400" />
              <span>View Storefront</span>
            </span>
          </Link>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs truncate max-w-[120px]">
              <p className="font-bold text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-slate-400 capitalize">{user?.role}</p>
            </div>
            <button
              onClick={() => {
                logout();
                navigate('/');
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* Top Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/40 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400">PhoneHub Store Manager</span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
            >
              Storefront
            </Link>
          </div>
        </header>

        <main className="p-6 sm:p-8 flex-1">
          <Outlet />
        </main>
      </div>

    </div>
  );
};
