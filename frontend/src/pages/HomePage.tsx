import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Flame,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Truck,
  Award,
  ChevronRight,
  Star
} from 'lucide-react';
import api from '../api/axios';
import { Product, Brand, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { BrandLogo } from '../components/BrandLogo';
import { formatPrice } from '../utils/formatters';

const HERO_FLAGSHIPS = [
  {
    id: 'iphone-16-pro-max',
    brand: 'Apple',
    brandSlug: 'apple',
    name: 'iPhone 16 Pro Max',
    tagline: 'Titanium. Built for Apple Intelligence.',
    subtext: 'Crafted with Grade 5 Titanium and equipped with the breakthrough 3nm A18 Pro silicon, 48MP Fusion camera system with 5x telephoto, and unprecedented battery endurance.',
    price: '$1,149.00',
    originalPrice: '$1,199.00',
    slug: 'iphone-16-pro-max',
    badge: 'Flagship of the Year',
    image: '/images/products/iphone-16-pro-max.jpg',
    glow: 'from-amber-500/20 via-orange-500/10 to-transparent',
    accentText: 'text-amber-400',
    hotspots: [
      { id: 1, top: '28%', left: '32%', title: '48MP Fusion Camera', desc: '5x Optical Zoom with 4K 120fps Dolby Vision HDR' },
      { id: 2, top: '54%', left: '68%', title: 'Apple A18 Pro (3nm)', desc: '16-core Neural Engine for Apple Intelligence' },
      { id: 3, top: '78%', left: '26%', title: 'Grade 5 Titanium', desc: 'Aerospace microblasted finish with Ceramic Shield' },
    ],
    specs: [
      { label: 'Processor', value: 'A18 Pro (3nm)' },
      { label: 'Camera', value: '48MP + 48MP + 12MP' },
      { label: 'Battery', value: '4,685 mAh (33h video)' },
      { label: 'Display', value: '6.9" 120Hz ProMotion' },
    ],
  },
  {
    id: 'samsung-galaxy-s25-ultra',
    brand: 'Samsung',
    brandSlug: 'samsung',
    name: 'Galaxy S25 Ultra',
    tagline: 'The Ultimate Galaxy AI Experience.',
    subtext: 'Engineered with Snapdragon 8 Elite for Galaxy, iconic flat titanium frame, built-in S Pen, and groundbreaking 200MP Quad-Telephoto zoom system with ProVisual AI.',
    price: '$1,299.00',
    originalPrice: null,
    slug: 'samsung-galaxy-s25-ultra',
    badge: 'Most Powerful Android',
    image: '/images/products/samsung-galaxy-s25-ultra.jpg',
    glow: 'from-blue-500/20 via-cyan-500/10 to-transparent',
    accentText: 'text-cyan-400',
    hotspots: [
      { id: 1, top: '26%', left: '70%', title: '200MP Quad Telephoto', desc: 'Space Zoom 100x with ProVisual AI Engine' },
      { id: 2, top: '50%', left: '28%', title: 'Snapdragon 8 Elite', desc: 'Overclocked 4.47GHz Prime CPU for Galaxy' },
      { id: 3, top: '76%', left: '62%', title: 'Built-in S Pen', desc: 'Ultra-low latency with AI smart selection' },
    ],
    specs: [
      { label: 'Processor', value: 'Snapdragon 8 Elite' },
      { label: 'Camera', value: '200MP + 50MP + 50MP' },
      { label: 'Battery', value: '5,000 mAh (45W Fast)' },
      { label: 'Display', value: '6.8" Dynamic AMOLED 2X' },
    ],
  },
  {
    id: 'google-pixel-9-pro-xl',
    brand: 'Google',
    brandSlug: 'google',
    name: 'Pixel 9 Pro XL',
    tagline: 'Gemini Pro Silicon. Pure Innovation.',
    subtext: 'Super Actua Display with 3,000 nits peak brightness, Google Tensor G4 with 16GB RAM, on-device Gemini Nano, and pro triple camera array with 8K Video Boost.',
    price: '$1,099.00',
    originalPrice: null,
    slug: 'google-pixel-9-pro-xl',
    badge: 'Best AI Smartphone',
    image: '/images/products/google-pixel-9-pro-xl.jpg',
    glow: 'from-emerald-500/20 via-teal-500/10 to-transparent',
    accentText: 'text-emerald-400',
    hotspots: [
      { id: 1, top: '28%', left: '48%', title: 'Pro Camera Visor', desc: '50MP main with 8K Video Boost & Macro Focus' },
      { id: 2, top: '54%', left: '72%', title: 'Google Tensor G4', desc: 'Multimodal Gemini Nano on-device AI' },
      { id: 3, top: '75%', left: '30%', title: '3,000 Nits Actua Display', desc: '1-120Hz LTPO OLED with Gorilla Glass Armor' },
    ],
    specs: [
      { label: 'Processor', value: 'Google Tensor G4' },
      { label: 'Camera', value: '50MP + 48MP + 48MP' },
      { label: 'Battery', value: '5,060 mAh (37W Fast)' },
      { label: 'Display', value: '6.8" Super Actua OLED' },
    ],
  },
];

export const HomePage: React.FC = () => {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [dealProducts, setDealProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Cinematic Hero State
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);
  const [activeHotspot, setActiveHotspot] = useState<number | null>(null);

  // Countdown timer for Flash Sale
  const [timeLeft, setTimeLeft] = useState({ hours: 8, minutes: 34, seconds: 12 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        const [featuredRes, dealsRes, brandsRes, catRes] = await Promise.all([
          api.get('/products?featured=1&per_page=8'),
          api.get('/products?on_sale=1&per_page=4'),
          api.get('/brands'),
          api.get('/categories'),
        ]);

        setFeaturedProducts(featuredRes.data.data);
        setDealProducts(dealsRes.data.data);
        setBrands(brandsRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error('Error loading homepage data', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const activeHero = HERO_FLAGSHIPS[activeHeroIdx];

  return (
    <div className="space-y-16 pb-16">
      
      {/* 1. Cinematic Storefront Hero Section */}
      <section className="relative overflow-hidden pt-6 pb-16 md:pt-10 md:pb-24 border-b border-slate-900 bg-gradient-to-b from-slate-900/80 via-slate-950 to-slate-950">
        {/* Glow ambient background lighting */}
        <div className={`absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-tr ${activeHero.glow} rounded-full blur-3xl pointer-events-none transition-all duration-700`} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-8">
          
          {/* Flagship Switcher Tabs */}
          <div className="flex items-center justify-center">
            <div className="inline-flex p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-md">
              {HERO_FLAGSHIPS.map((flagship, idx) => {
                const isActive = activeHeroIdx === idx;
                return (
                  <button
                    key={flagship.id}
                    onClick={() => {
                      setActiveHeroIdx(idx);
                      setActiveHotspot(null);
                    }}
                    className={`px-4 sm:px-6 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <BrandLogo name={flagship.brand} slug={flagship.brandSlug} className="w-4 h-4 !rounded-sm" />
                    <span>{flagship.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{activeHero.badge}</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-[1.1]">
                {activeHero.name}. <br />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
                  {activeHero.tagline}
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                {activeHero.subtext}
              </p>

              {/* Hardware Highlights Matrix */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                {activeHero.specs.map((s, i) => (
                  <div key={i} className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm text-left">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{s.label}</p>
                    <p className="text-xs font-bold text-white mt-0.5 truncate">{s.value}</p>
                  </div>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to={`/products/${activeHero.slug}`}
                  className="px-7 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white font-bold text-sm shadow-xl shadow-blue-500/25 flex items-center gap-2.5 transition-all"
                >
                  <span>Order Now from {activeHero.price}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/compare"
                  className="px-6 py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 font-bold text-sm transition-all"
                >
                  Compare Specs
                </Link>
              </div>

              {/* Badges Bar */}
              <div className="pt-4 border-t border-slate-800/80 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-400" />
                  <span>Same-Day Express Dispatch</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>100% Genuine Warranty</span>
                </div>
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Instant Trade-In Credit</span>
                </div>
              </div>
            </div>

            {/* Hero Right Visual Presentation with Interactive Hotspots */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-sm sm:max-w-md p-4 rounded-3xl bg-gradient-to-tr from-slate-900/80 via-slate-900/40 to-transparent border border-slate-800 backdrop-blur-md shadow-2xl">
                <div className="relative aspect-[4/5] rounded-2xl bg-slate-950/90 flex items-center justify-center overflow-hidden border border-slate-800/80 shadow-inner group">
                  <img
                    src={activeHero.image}
                    alt={activeHero.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Interactive Feature Hotspots */}
                  {activeHero.hotspots.map((spot) => {
                    const isHovered = activeHotspot === spot.id;
                    return (
                      <div
                        key={spot.id}
                        style={{ top: spot.top, left: spot.left }}
                        className="absolute z-20 -translate-x-1/2 -translate-y-1/2"
                        onMouseEnter={() => setActiveHotspot(spot.id)}
                        onMouseLeave={() => setActiveHotspot(null)}
                      >
                        {/* Radar Pulse Button */}
                        <button
                          type="button"
                          onClick={() => setActiveHotspot(isHovered ? null : spot.id)}
                          className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600/90 text-white shadow-lg shadow-blue-500/50 hover:scale-110 transition-transform"
                        >
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
                          <span className="relative w-2.5 h-2.5 rounded-full bg-white" />
                        </button>

                        {/* Hotspot Tooltip Popover */}
                        {isHovered && (
                          <div className="absolute top-10 left-1/2 -translate-x-1/2 w-48 p-3 rounded-2xl bg-slate-900/95 border border-blue-500/50 shadow-2xl backdrop-blur-md z-30 text-left animate-in fade-in zoom-in-95 pointer-events-none">
                            <p className="text-xs font-bold text-blue-400">{spot.title}</p>
                            <p className="text-[11px] text-slate-300 mt-1 leading-tight">{spot.desc}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Floating Device Status Pill */}
                  <div className="absolute bottom-4 left-4 right-4 p-3.5 rounded-2xl bg-slate-900/95 backdrop-blur-md border border-slate-800 shadow-xl flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{activeHero.brand} Flagship</p>
                      <h4 className="text-sm font-bold text-white">{activeHero.name}</h4>
                      <p className="text-xs text-slate-300 font-semibold mt-0.5">
                        {activeHero.price} <span className="text-emerald-400 font-semibold ml-1">● In Stock</span>
                      </p>
                    </div>
                    <Link
                      to={`/products/${activeHero.slug}`}
                      className="p-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-500/25 transition-all hover:scale-105"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Top Brands Showcase */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Authorized Smartphone Brands</h2>
            <p className="text-xs text-slate-400">100% Genuine international manufacturer partners</p>
          </div>
          <Link to="/brands" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
            <span>All Brands</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {brands.map((b) => (
            <Link
              key={b.id}
              to={`/products?brand=${b.slug}`}
              className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 hover:bg-slate-800/60 transition-all text-center group flex flex-col items-center justify-center gap-2.5 shadow-sm hover:shadow-lg hover:shadow-blue-500/5"
            >
              <div className="w-14 h-14 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-center p-1.5 group-hover:scale-110 group-hover:border-slate-700 transition-all duration-300 shadow-inner">
                <BrandLogo name={b.name} slug={b.slug} className="w-10 h-10" />
              </div>
              <span className="text-xs font-semibold text-slate-300 group-hover:text-white transition-colors">
                {b.name}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. Hot Deals / Flash Sale Countdown */}
      {dealProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-rose-950/40 via-slate-900 to-indigo-950/40 border border-rose-500/20 shadow-2xl relative overflow-hidden">
            
            {/* Header with timer */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl font-extrabold text-white flex items-center gap-2">
                    Flash Sale Deals
                    <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-bold">LIMITED TIME</span>
                  </h3>
                  <p className="text-xs text-slate-400">Special smartphone pricing ends soon</p>
                </div>
              </div>

              {/* Countdown Clocks */}
              <div className="flex items-center gap-2 text-center">
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-base font-extrabold text-white font-mono">0{timeLeft.hours}</span>
                  <span className="block text-[9px] uppercase font-semibold text-slate-400">Hours</span>
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-base font-extrabold text-white font-mono">{timeLeft.minutes < 10 ? `0${timeLeft.minutes}` : timeLeft.minutes}</span>
                  <span className="block text-[9px] uppercase font-semibold text-slate-400">Mins</span>
                </div>
                <span className="text-slate-500 font-bold">:</span>
                <div className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800">
                  <span className="block text-base font-extrabold text-rose-400 font-mono">{timeLeft.seconds < 10 ? `0${timeLeft.seconds}` : timeLeft.seconds}</span>
                  <span className="block text-[9px] uppercase font-semibold text-slate-400">Secs</span>
                </div>
              </div>
            </div>

            {/* Deals Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {dealProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>

          </div>
        </section>
      )}

      {/* 4. Featured Flagship Smartphones */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-white tracking-tight">Featured Smartphones</h2>
            <p className="text-xs text-slate-400 mt-1">Our curated selection of world-class smartphone powerhouses</p>
          </div>
          <Link
            to="/products"
            className="flex items-center gap-1.5 text-xs font-semibold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Explore All 20+ Phones</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={setQuickViewProduct}
              />
            ))}
          </div>
        )}
      </section>

      {/* 5. Category Banners Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            to="/products?brand=apple"
            className="group relative h-48 rounded-3xl overflow-hidden p-6 flex flex-col justify-between border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-blue-500/40 transition-all"
          >
            <div>
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Apple Ecosystem</span>
              <h3 className="text-xl font-bold text-white mt-1">iPhone 16 Series</h3>
              <p className="text-xs text-slate-400 mt-0.5">Titanium builds with A18 Pro</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-blue-400">
              Shop iPhone <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/products?brand=samsung"
            className="group relative h-48 rounded-3xl overflow-hidden p-6 flex flex-col justify-between border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-purple-500/40 transition-all"
          >
            <div>
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Galaxy AI</span>
              <h3 className="text-xl font-bold text-white mt-1">Galaxy S25 Ultra</h3>
              <p className="text-xs text-slate-400 mt-0.5">200MP Quad Tele & S Pen</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-purple-400">
              Shop Galaxy <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          <Link
            to="/products?brand=google"
            className="group relative h-48 rounded-3xl overflow-hidden p-6 flex flex-col justify-between border border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 hover:border-emerald-500/40 transition-all"
          >
            <div>
              <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Google Tensor</span>
              <h3 className="text-xl font-bold text-white mt-1">Pixel 9 Pro XL</h3>
              <p className="text-xs text-slate-400 mt-0.5">Gemini AI with 7 Years Updates</p>
            </div>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-white group-hover:text-emerald-400">
              Shop Pixel <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </section>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
