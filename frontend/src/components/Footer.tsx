import React from 'react';
import { Link } from 'react-router-dom';
import { Smartphone, Shield, Truck, Clock, RefreshCw, Mail, Phone, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-slate-900 text-slate-400">
      {/* Feature Highlights Banner */}
      <div className="border-b border-slate-900 py-10 bg-slate-950/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">Free Express Delivery</h4>
                <p className="text-xs text-slate-400 mt-0.5">On all flagship orders nationwide</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">1-Year Official Warranty</h4>
                <p className="text-xs text-slate-400 mt-0.5">100% Genuine brand warranty</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                <RefreshCw className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">7-Day Free Replacement</h4>
                <p className="text-xs text-slate-400 mt-0.5">Instant swap for manufacturer defects</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-white font-semibold text-sm">24/7 Expert Support</h4>
                <p className="text-xs text-slate-400 mt-0.5">Live chat with certified technicians</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                <Smartphone className="w-5 h-5" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                Phone<span className="text-blue-500">Hub</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              PhoneHub is Cambodia's premier destination for genuine smartphones, flagship releases, smart accessories, and professional tech repairs with guaranteed warranty.
            </p>
            <div className="space-y-2 pt-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-blue-400" />
                <span>+855 23 888 999 / +855 12 345 678</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" />
                <span>support@phonehub.com</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-4 h-4 text-blue-400" />
                <span>#128 Preah Norodom Blvd, Phnom Penh, Cambodia</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Shop Categories</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/products?category=smartphones" className="hover:text-blue-400 transition-colors">Smartphones</Link></li>
              <li><Link to="/products?brand=apple" className="hover:text-blue-400 transition-colors">Apple iPhone</Link></li>
              <li><Link to="/products?brand=samsung" className="hover:text-blue-400 transition-colors">Samsung Galaxy</Link></li>
              <li><Link to="/products?brand=google" className="hover:text-blue-400 transition-colors">Google Pixel</Link></li>
              <li><Link to="/products?brand=xiaomi" className="hover:text-blue-400 transition-colors">Xiaomi & Poco</Link></li>
              <li><Link to="/products?category=accessories" className="hover:text-blue-400 transition-colors">Cases & Chargers</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Customer Support</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/orders" className="hover:text-blue-400 transition-colors">Order Tracking</Link></li>
              <li><Link to="/shipping" className="hover:text-blue-400 transition-colors">Shipping & Delivery</Link></li>
              <li><Link to="/warranty" className="hover:text-blue-400 transition-colors">Warranty Policy</Link></li>
              <li><Link to="/returns" className="hover:text-blue-400 transition-colors">Returns & Refunds</Link></li>
              <li><Link to="/faq" className="hover:text-blue-400 transition-colors">Frequently Asked Questions</Link></li>
            </ul>
          </div>

          {/* Payment & Security */}
          <div>
            <h3 className="text-white font-semibold text-sm mb-4">Payment Methods</h3>
            <p className="text-xs text-slate-400 mb-4">
              We accept secure online card payments, local bank transfers, and cash on delivery.
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                Cash On Delivery
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                ABA Pay / KHQR
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                Stripe Card
              </span>
              <span className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-semibold text-slate-300">
                Wing Bank
              </span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} PhoneHub E-Commerce. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link to="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link to="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <Link to="/sitemap" className="hover:text-slate-400">Sitemap</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
