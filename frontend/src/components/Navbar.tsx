import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Smartphone,
  Search,
  Heart,
  ShoppingBag,
  User as UserIcon,
  Menu,
  X,
  LogOut,
  ShieldCheck,
  Package,
  MapPin,
  ChevronDown,
  ArrowLeftRight,
  Flame,
  Truck,
  Sparkles,
  ArrowRight,
  Zap,
  Layers,
  PhoneCall,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useFilterStore } from '../stores/filterStore';
import { useCompareStore } from '../stores/compareStore';
import { SearchModal } from './SearchModal';
import { BrandLogo } from './BrandLogo';
import { formatPrice } from '../utils/formatters';

interface NavbarProps {
  onOpenAuth: () => void;
}

const MEGA_MENU_FLAGSHIPS = [
  {
    name: 'iPhone 16 Pro Max',
    brand: 'Apple',
    slug: 'iphone-16-pro-max',
    price: '$1,149',
    tag: 'A18 Pro (3nm)',
    image: '/images/products/iphone-16-pro-max.jpg',
  },
  {
    name: 'Galaxy S25 Ultra',
    brand: 'Samsung',
    slug: 'samsung-galaxy-s25-ultra',
    price: '$1,299',
    tag: 'Snapdragon 8 Elite',
    image: '/images/products/samsung-galaxy-s25-ultra.jpg',
  },
  {
    name: 'Pixel 9 Pro XL',
    brand: 'Google',
    slug: 'google-pixel-9-pro-xl',
    price: '$1,099',
    tag: 'Google Tensor G4',
    image: '/images/products/google-pixel-9-pro-xl.jpg',
  },
];

const POPULAR_BRANDS = [
  { name: 'Apple', slug: 'apple' },
  { name: 'Samsung', slug: 'samsung' },
  { name: 'Google', slug: 'google' },
  { name: 'Xiaomi', slug: 'xiaomi' },
  { name: 'OnePlus', slug: 'oneplus' },
  { name: 'OPPO', slug: 'oppo' },
  { name: 'Vivo', slug: 'vivo' },
  { name: 'Realme', slug: 'realme' },
];

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { cart, toggleCart } = useCartStore();
  const { items: wishlistItems } = useWishlistStore();
  const compareCount = useCompareStore((state) => state.items.length);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  // Dropdown states for desktop mega menus
  const [isPhonesMenuOpen, setIsPhonesMenuOpen] = useState(false);
  const [isBrandsMenuOpen, setIsBrandsMenuOpen] = useState(false);

  const phonesTimeoutRef = useRef<any>(null);
  const brandsTimeoutRef = useRef<any>(null);

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setIsPhonesMenuOpen(false);
    setIsBrandsMenuOpen(false);
  }, [location.pathname]);

  const cartCount = cart.items.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlistItems.length;
  const isAdmin = user && (user.role === 'admin' || user.role === 'super_admin' || user.role === 'manager');

  const handlePhonesMouseEnter = () => {
    clearTimeout(phonesTimeoutRef.current);
    setIsPhonesMenuOpen(true);
  };

  const handlePhonesMouseLeave = () => {
    phonesTimeoutRef.current = setTimeout(() => setIsPhonesMenuOpen(false), 200);
  };

  const handleBrandsMouseEnter = () => {
    clearTimeout(brandsTimeoutRef.current);
    setIsBrandsMenuOpen(true);
  };

  const handleBrandsMouseLeave = () => {
    brandsTimeoutRef.current = setTimeout(() => setIsBrandsMenuOpen(false), 200);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/90 border-b border-slate-800/80 shadow-2xl transition-all">
      
      {/* 1. Top Micro-Announcement Utility Bar */}
      <div className="hidden md:block bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/60 py-1.5 px-4 sm:px-6 lg:px-8 text-[11px] text-slate-400">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-slate-300 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              100% Genuine Smartphones • 1-Year Official Warranty
            </span>
            <span className="text-slate-700">•</span>
            <span className="text-slate-400">
              ⚡ Same-Day Express Dispatch in Phnom Penh
            </span>
          </div>

          <div className="flex items-center gap-5 text-slate-400">
            <span className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer transition-colors">
              <PhoneCall className="w-3 h-3 text-blue-400" />
              <span>Hotline: +855 23 888 999</span>
            </span>
            <span className="text-slate-700">•</span>
            <span className="flex items-center gap-1 hover:text-slate-200 cursor-pointer transition-colors">
              <Globe className="w-3 h-3 text-slate-400" />
              <span>Cambodia (USD $)</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-4 lg:gap-6">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 group-hover:shadow-blue-500/40 transition-all">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white leading-none">
                  Phone<span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Hub</span>
                </span>
                <span className="px-1.5 py-0.2 rounded-md bg-blue-500/15 border border-blue-500/30 text-[9px] font-extrabold tracking-wider text-blue-400 uppercase">
                  PRO
                </span>
              </div>
              <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400 mt-0.5">
                Smartphones & Tech
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1.5 text-xs font-semibold text-slate-300">
            
            {/* Home */}
            <Link
              to="/"
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-all ${
                location.pathname === '/'
                  ? 'bg-blue-600/15 text-blue-400 font-bold shadow-sm shadow-blue-500/10'
                  : 'hover:text-white hover:bg-slate-900/80'
              }`}
            >
              Home
            </Link>

            {/* Phones with Mega Menu */}
            <div
              className="relative"
              onMouseEnter={handlePhonesMouseEnter}
              onMouseLeave={handlePhonesMouseLeave}
            >
              <Link
                to="/products"
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 transition-all ${
                  location.pathname.startsWith('/products')
                    ? 'bg-blue-600/15 text-blue-400 font-bold shadow-sm shadow-blue-500/10'
                    : 'hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <span>Phones</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isPhonesMenuOpen ? 'rotate-180 text-blue-400' : 'text-slate-400'}`} />
              </Link>

              {/* Mega Menu Dropdown */}
              {isPhonesMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-[540px] rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-5 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-400" />
                      <span className="text-xs font-bold uppercase tracking-wider text-white">Featured Flagships 2026</span>
                    </div>
                    <Link to="/products" className="text-[11px] font-bold text-blue-400 hover:text-blue-300 flex items-center gap-1">
                      All Smartphones <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>

                  {/* Flagship Cards Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    {MEGA_MENU_FLAGSHIPS.map((phone) => (
                      <Link
                        key={phone.slug}
                        to={`/products/${phone.slug}`}
                        className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-blue-500/40 hover:bg-slate-850 transition-all text-left group"
                      >
                        <div className="aspect-[4/5] rounded-xl bg-slate-900/80 mb-2.5 overflow-hidden flex items-center justify-center p-2 border border-slate-800">
                          <img
                            src={phone.image}
                            alt={phone.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 rounded-lg"
                          />
                        </div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider">{phone.brand}</p>
                        <h4 className="text-xs font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                          {phone.name}
                        </h4>
                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-slate-800/80">
                          <span className="text-xs font-black text-white">{phone.price}</span>
                          <span className="text-[9px] text-slate-400">{phone.tag}</span>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Quick Filters Footer */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-slate-500">Popular:</span>
                      <Link to="/products?category=smartphones" className="hover:text-blue-400">5G Flagships</Link>
                      <span>•</span>
                      <Link to="/compare" className="hover:text-blue-400">Compare Tool</Link>
                      <span>•</span>
                      <Link to="/deals" className="hover:text-rose-400">Deals (-35%)</Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Compare */}
            <Link
              to="/compare"
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                location.pathname === '/compare'
                  ? 'bg-blue-600/15 text-blue-400 font-bold shadow-sm shadow-blue-500/10'
                  : 'hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-blue-400" />
              <span>Compare</span>
              {compareCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-black rounded-full bg-blue-600 text-white shadow-sm shadow-blue-500/30 animate-pulse">
                  {compareCount}
                </span>
              )}
            </Link>

            {/* Brands with Quick Brand Grid Flyout */}
            <div
              className="relative"
              onMouseEnter={handleBrandsMouseEnter}
              onMouseLeave={handleBrandsMouseLeave}
            >
              <Link
                to="/brands"
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1 transition-all ${
                  location.pathname === '/brands'
                    ? 'bg-blue-600/15 text-blue-400 font-bold shadow-sm shadow-blue-500/10'
                    : 'hover:text-white hover:bg-slate-900/80'
                }`}
              >
                <span>Brands</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${isBrandsMenuOpen ? 'rotate-180 text-blue-400' : 'text-slate-400'}`} />
              </Link>

              {/* Brands Flyout */}
              {isBrandsMenuOpen && (
                <div className="absolute left-0 top-full mt-2 w-80 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Authorized Partners</span>
                    <Link to="/brands" className="text-[11px] font-bold text-blue-400 hover:underline">View All</Link>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    {POPULAR_BRANDS.map((b) => (
                      <Link
                        key={b.slug}
                        to={`/products?brand=${b.slug}`}
                        className="p-2.5 rounded-xl bg-slate-950 hover:bg-slate-800/80 border border-slate-800 flex flex-col items-center justify-center gap-1 group transition-all"
                      >
                        <BrandLogo name={b.name} slug={b.slug} className="w-8 h-8 !rounded-lg group-hover:scale-105 transition-transform" />
                        <span className="text-[10px] font-bold text-slate-300 group-hover:text-white truncate max-w-[50px]">{b.name}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Hot Deals */}
            <Link
              to="/deals"
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                location.pathname === '/deals'
                  ? 'bg-rose-500/15 text-rose-400 font-bold shadow-sm shadow-rose-500/10'
                  : 'hover:text-rose-400 hover:bg-slate-900/80'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-rose-400" />
              <span>Deals</span>
              <span className="px-1.5 py-0.2 text-[9px] font-black rounded-md bg-gradient-to-r from-rose-600 to-orange-500 text-white shadow-sm shadow-rose-500/20">
                HOT
              </span>
            </Link>

            {/* Track Order */}
            <Link
              to="/track-order"
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 transition-all ${
                location.pathname.startsWith('/track-order') || location.pathname.startsWith('/orders/track')
                  ? 'bg-emerald-500/15 text-emerald-400 font-bold shadow-sm shadow-emerald-500/10'
                  : 'hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Track Order</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </Link>

          </nav>

          {/* Predictive Search Bar Trigger Button */}
          <div className="hidden md:flex flex-1 max-w-xs lg:max-w-sm mx-1">
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="w-full flex items-center justify-between pl-9 pr-2.5 py-2 rounded-2xl bg-slate-900/80 hover:bg-slate-900 border border-slate-800/90 hover:border-blue-500/50 text-xs text-slate-400 hover:text-slate-200 transition-all shadow-inner relative group"
            >
              <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-400 transition-colors absolute left-3 top-2.5" />
              <span className="truncate">Search phones, chips, 200MP...</span>
              <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded-lg bg-slate-800/90 border border-slate-700/60 text-[9px] font-mono text-slate-400 group-hover:text-slate-200 shadow-sm">
                Ctrl K
              </kbd>
            </button>
          </div>

          {/* Action Buttons: Search Mobile, Wishlist, Cart, User Profile */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            
            {/* Mobile Search Icon Button */}
            <button
              type="button"
              onClick={() => setIsSearchModalOpen(true)}
              className="md:hidden p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
              title="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Wishlist Button */}
            <Link
              to="/wishlist"
              className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all group"
              title="Wishlist"
            >
              <Heart className="w-5 h-5 group-hover:text-rose-400 transition-colors" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-md shadow-rose-500/30">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Button */}
            <button
              onClick={() => toggleCart(true)}
              className="relative p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all group flex items-center gap-2"
              title="View Shopping Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5 group-hover:text-blue-400 transition-colors" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-black flex items-center justify-center shadow-md shadow-blue-500/30">
                    {cartCount}
                  </span>
                )}
              </div>
            </button>

            {/* User Account / Profile / Login Button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all text-left shadow-sm"
                >
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-500/20">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="hidden xl:block text-xs leading-tight">
                    <p className="font-bold text-slate-200 truncate max-w-[90px]">{user.name}</p>
                    <p className="text-[10px] text-slate-400 capitalize">{user.role}</p>
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-slate-900/95 border border-slate-800 shadow-2xl py-2 z-50 divide-y divide-slate-800/60 backdrop-blur-xl animate-in fade-in zoom-in-95">
                    <div className="px-4 py-2.5">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Signed in as</p>
                      <p className="text-xs font-bold text-slate-200 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-blue-400 hover:bg-blue-500/10 transition-colors"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                      <Link
                        to="/profile"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" />
                        <span>Account Profile</span>
                      </Link>
                      <Link
                        to="/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                      >
                        <Package className="w-4 h-4 text-slate-400" />
                        <span>Order History</span>
                      </Link>
                      <Link
                        to="/track-order"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2 text-xs text-slate-300 hover:bg-slate-800/80 transition-colors"
                      >
                        <Truck className="w-4 h-4 text-slate-400" />
                        <span>Live Delivery Status</span>
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsUserMenuOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-400 hover:bg-rose-500/10 transition-colors text-left font-semibold"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all whitespace-nowrap"
              >
                <UserIcon className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-slate-300" />}
            </button>

          </div>

        </div>

        {/* 3. Mobile Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-slate-800/80 space-y-4 animate-in fade-in">
            
            {/* Search Button Mobile */}
            <button
              type="button"
              onClick={() => {
                setIsMobileMenuOpen(false);
                setIsSearchModalOpen(true);
              }}
              className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-slate-400 text-left"
            >
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-blue-400" />
                <span>Search phones by brand, chip, camera...</span>
              </div>
              <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">Search</span>
            </button>

            <nav className="flex flex-col space-y-1 text-sm font-semibold text-slate-300">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl hover:bg-slate-850">
                Home
              </Link>
              <Link to="/products" onClick={() => setIsMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl hover:bg-slate-850 flex items-center justify-between">
                <span>Phones & Flagships</span>
                <span className="text-xs text-blue-400">Browse 20+</span>
              </Link>
              <Link to="/compare" onClick={() => setIsMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl hover:bg-slate-850 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-blue-400" />
                  <span>Compare Phones</span>
                </div>
                {compareCount > 0 && (
                  <span className="px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white font-bold">{compareCount}</span>
                )}
              </Link>
              <Link to="/brands" onClick={() => setIsMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl hover:bg-slate-850">
                Brands
              </Link>
              <Link to="/deals" onClick={() => setIsMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl hover:bg-slate-850 text-rose-400 flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4" />
                  <span>Hot Deals & Discounts</span>
                </div>
                <span className="px-2 py-0.5 text-[10px] rounded-md bg-rose-500/20 text-rose-400 border border-rose-500/30 font-bold">HOT</span>
              </Link>
              <Link to="/track-order" onClick={() => setIsMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl hover:bg-slate-850 flex items-center justify-between text-emerald-400">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4" />
                  <span>Live Order Tracking</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              </Link>
              {isAdmin && (
                <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="px-3.5 py-2.5 rounded-xl bg-blue-600/20 text-blue-400 font-bold">
                  Admin Dashboard
                </Link>
              )}
            </nav>

            {/* Quick Brand Badges in Mobile Drawer */}
            <div className="pt-3 border-t border-slate-800/80">
              <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">Shop by Brand</p>
              <div className="grid grid-cols-4 gap-2">
                {POPULAR_BRANDS.slice(0, 4).map((b) => (
                  <Link
                    key={b.slug}
                    to={`/products?brand=${b.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 flex flex-col items-center justify-center text-center gap-1"
                  >
                    <BrandLogo name={b.name} slug={b.slug} className="w-6 h-6 !rounded-md" />
                    <span className="text-[10px] text-slate-300 font-semibold">{b.name}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Global Predictive Search Modal */}
      <SearchModal isOpen={isSearchModalOpen} onClose={() => setIsSearchModalOpen(false)} />
    </header>
  );
};
