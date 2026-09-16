import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CartDrawer } from '../components/CartDrawer';
import { AuthModal } from '../components/AuthModal';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';

export const CustomerLayout: React.FC = () => {
  const location = useLocation();

  const { fetchUser, isAuthenticated, isAuthModalOpen, openAuthModal, closeAuthModal } = useAuthStore();
  const { fetchCart } = useCartStore();
  const { fetchWishlist } = useWishlistStore();

  useEffect(() => {
    fetchUser();
    fetchCart();
    if (isAuthenticated) {
      fetchWishlist();
    }
  }, [fetchUser, fetchCart, fetchWishlist, isAuthenticated]);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-blue-600 selection:text-white">
      {/* Header / Navbar */}
      <Navbar onOpenAuth={() => openAuthModal()} />

      {/* Main Content Area */}
      <main className="flex-1">
        <Outlet />
      </main>

      {/* Cart Drawer */}
      <CartDrawer />

      {/* Auth Modal */}
      <AuthModal isOpen={isAuthModalOpen} onClose={closeAuthModal} />

      {/* Footer */}
      <Footer />
    </div>
  );
};
