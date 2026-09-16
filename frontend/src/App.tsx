import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link } from 'react-router-dom';
import { CustomerLayout } from './layouts/CustomerLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Customer Storefront Pages
import { HomePage } from './pages/HomePage';
import { ProductListingPage } from './pages/ProductListingPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { WishlistPage } from './pages/WishlistPage';

// Admin Portal Pages
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { AdminProductsPage } from './pages/admin/AdminProductsPage';
import { AdminInventoryPage } from './pages/admin/AdminInventoryPage';
import { AdminOrdersPage } from './pages/admin/AdminOrdersPage';
import { AdminCustomersPage } from './pages/admin/AdminCustomersPage';
import { AdminCouponsPage } from './pages/admin/AdminCouponsPage';
import { AdminReviewsPage } from './pages/admin/AdminReviewsPage';
import { AdminAuditLogsPage } from './pages/admin/AdminAuditLogsPage';

// Not Found Page
const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-3xl font-black mb-6">
        404
      </div>
      <h1 className="text-3xl font-extrabold text-white mb-3">Page Not Found</h1>
      <p className="text-slate-400 text-sm max-w-md mb-8">
        The smartphone, category, or page you are looking for might have been moved or does not exist.
      </p>
      <Link
        to="/"
        className="px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-500/25 transition-all"
      >
        Return to Storefront
      </Link>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Customer Storefront Routes */}
        <Route path="/" element={<CustomerLayout />}>
          <Route index element={<HomePage />} />
          <Route path="products" element={<ProductListingPage />} />
          <Route path="products/:slug" element={<ProductDetailPage />} />
          <Route path="categories/:slug" element={<ProductListingPage />} />
          <Route path="brands/:slug" element={<ProductListingPage />} />
          <Route path="deals" element={<ProductListingPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="orders/track/:orderNumber" element={<OrderTrackingPage />} />
          <Route path="orders/track" element={<OrderTrackingPage />} />
          <Route path="profile" element={<UserProfilePage />} />
          <Route path="orders" element={<UserProfilePage />} />
          <Route path="addresses" element={<UserProfilePage />} />
          <Route path="wishlist" element={<WishlistPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* Dedicated Admin Portal Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="products" element={<AdminProductsPage />} />
          <Route path="inventory" element={<AdminInventoryPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="customers" element={<AdminCustomersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
          <Route path="audit-logs" element={<AdminAuditLogsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
