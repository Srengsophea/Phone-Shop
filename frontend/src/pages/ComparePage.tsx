import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeftRight,
  Plus,
  Trash2,
  Check,
  X,
  ShoppingBag,
  Sparkles,
  Smartphone,
  Cpu,
  Camera,
  Battery,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { useCompareStore } from '../stores/compareStore';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { Product } from '../types';
import api from '../api/axios';
import { formatPrice, getImageUrl } from '../utils/formatters';
import { BrandLogo } from '../components/BrandLogo';

export const ComparePage: React.FC = () => {
  const { items, removeFromCompare, addToCompare, clearCompare } = useCompareStore();
  const { addItem } = useCartStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [highlightDifferences, setHighlightDifferences] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  // Load all products so users can add phones to comparison directly from this page
  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const res = await api.get('/products', { params: { per_page: 30 } });
        setAllProducts(res.data.data);
      } catch (err) {
        console.error('Failed to load catalog for comparison', err);
      }
    };
    fetchCatalog();
  }, []);

  // Helper to get spec value from product
  const getSpec = (product: Product, specName: string, fallback: string = '—'): string => {
    if (!product.specifications) return fallback;

    if (Array.isArray(product.specifications)) {
      const match = product.specifications.find(
        (s: any) => s.name?.toLowerCase().includes(specName.toLowerCase()) ||
                    s.group_name?.toLowerCase().includes(specName.toLowerCase())
      );
      return match?.value || fallback;
    }

    if (typeof product.specifications === 'object') {
      const key = Object.keys(product.specifications).find(k => k.toLowerCase().includes(specName.toLowerCase()));
      return key ? (product.specifications as any)[key] : fallback;
    }

    return fallback;
  };

  const handleAddToCart = async (product: Product) => {
    if (!isAuthenticated) {
      openAuthModal('Please sign in to add phones to your cart.');
      return;
    }
    const defaultVariant = product.variants?.[0]?.id || null;
    await addItem(product.id, defaultVariant, 1);
  };

  // Pre-selected quick flagship models for 1-click compare
  const handleQuickAdd = (slug: string) => {
    const target = allProducts.find(p => p.slug === slug);
    if (target) {
      addToCompare(target);
    }
  };

  const maxSlots = 4;
  const canAddMore = items.length < maxSlots;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-blue-400">Phones</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200 font-medium">Compare Models</span>
      </nav>

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-800">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-3">
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Interactive Device Studio</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Compare Smartphone Models
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-2xl">
            Evaluate specifications side by side: Dynamic LTPO displays, camera sensors, 3nm chipsets, and real-world battery endurance.
          </p>
        </div>

        {items.length > 0 && (
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-300 cursor-pointer select-none bg-slate-900 px-3.5 py-2 rounded-xl border border-slate-800 hover:border-slate-700">
              <input
                type="checkbox"
                checked={highlightDifferences}
                onChange={(e) => setHighlightDifferences(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Highlight Differences</span>
            </label>

            <button
              onClick={clearCompare}
              className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1 font-semibold"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          </div>
        )}
      </div>

      {/* Empty State */}
      {items.length === 0 ? (
        <div className="p-12 sm:p-20 rounded-3xl bg-slate-900/40 border border-slate-800 text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-blue-600/15 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10">
            <ArrowLeftRight className="w-8 h-8" />
          </div>
          
          <div className="space-y-2 max-w-md mx-auto">
            <h3 className="text-xl font-bold text-white">No Smartphones Selected</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Select any smartphones from our catalog or tap one of our top flagship matchups below to start comparing side-by-side.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <button
              onClick={() => handleQuickAdd('iphone-16-pro-max')}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>+ iPhone 16 Pro Max</span>
            </button>

            <button
              onClick={() => handleQuickAdd('samsung-galaxy-s25-ultra')}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Galaxy S25 Ultra</span>
            </button>

            <button
              onClick={() => handleQuickAdd('google-pixel-9-pro-xl')}
              className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-2"
            >
              <Plus className="w-3.5 h-3.5 text-blue-400" />
              <span>+ Pixel 9 Pro XL</span>
            </button>
          </div>

          <div className="pt-4">
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all"
            >
              <Smartphone className="w-4 h-4" />
              <span>Browse All Smartphones</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Comparison Table Container */
        <div className="space-y-8">
          
          {/* Top Sticky Header Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 items-start">
            {items.map((product) => {
              const primaryImg = product.images?.find((img) => img.is_primary)?.image_path || product.images?.[0]?.image_path;
              const price = product.sale_price || product.base_price;

              return (
                <div
                  key={product.id}
                  className="relative p-5 rounded-3xl bg-slate-900/80 border border-slate-800 hover:border-blue-500/30 transition-all flex flex-col justify-between h-full group"
                >
                  <button
                    onClick={() => removeFromCompare(product.id)}
                    className="absolute top-4 right-4 p-1.5 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                    title="Remove phone"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <div>
                    {/* Brand & Thumbnail */}
                    <div className="flex items-center gap-2 mb-3">
                      {product.brand && (
                        <BrandLogo name={product.brand.name} slug={product.brand.slug} className="w-5 h-5 !rounded-md" />
                      )}
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {product.brand?.name}
                      </span>
                    </div>

                    <div className="aspect-square rounded-2xl bg-slate-950/70 p-3 flex items-center justify-center mb-4 overflow-hidden">
                      <img
                        src={getImageUrl(primaryImg)}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>

                    <Link to={`/products/${product.slug}`} className="hover:text-blue-400 transition-colors">
                      <h3 className="font-bold text-white text-base leading-snug line-clamp-2">
                        {product.name}
                      </h3>
                    </Link>

                    <p className="text-xl font-black text-white mt-2">
                      {formatPrice(price)}
                    </p>

                    {/* Color swatches */}
                    {product.variants && product.variants.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-3">
                        {product.variants.slice(0, 4).map((v) => (
                          <span
                            key={v.id}
                            className="w-4 h-4 rounded-full border border-slate-700/80"
                            style={{ backgroundColor: v.color_hex || '#334155' }}
                            title={v.color || v.name}
                          />
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Add to Cart CTA */}
                  <div className="pt-5 mt-5 border-t border-slate-800">
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add to Cart</span>
                    </button>
                  </div>
                </div>
              );
            })}

            {/* Empty Add Slot */}
            {canAddMore && (
              <div className="p-6 rounded-3xl border-2 border-dashed border-slate-800 bg-slate-950/40 flex flex-col items-center justify-center text-center space-y-3 min-h-[360px]">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 text-slate-500 flex items-center justify-center">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-white">Add Another Phone</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Compare up to 4 models</p>
                </div>

                <div className="w-full pt-2">
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const phone = allProducts.find(p => String(p.id) === e.target.value);
                        if (phone) addToCompare(phone);
                        e.target.value = '';
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                    defaultValue=""
                  >
                    <option value="" disabled>Select a phone...</option>
                    {allProducts
                      .filter(p => !items.some(i => i.id === p.id))
                      .map(p => (
                        <option key={p.id} value={p.id}>{p.brand?.name} - {p.name}</option>
                      ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* SPECIFICATION MATRIX ROWS */}
          <div className="space-y-6 pt-4">
            
            {/* Group 1: Display */}
            <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-400">
                <Smartphone className="w-4 h-4" />
                <span>Display & Screen Experience</span>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Screen Size</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Screen Size', '6.8-inch')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Panel & Resolution</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Resolution', 'Dynamic AMOLED 2X')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Refresh Rate</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Refresh Rate', '120Hz ProMotion')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Peak Brightness</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Brightness', '2,600 nits')}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Group 2: Performance */}
            <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-indigo-400">
                <Cpu className="w-4 h-4" />
                <span>Processor & AI Performance</span>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Processor / Chip</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Processor', 'Snapdragon 8 Elite / A18 Pro')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Operating System</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Operating System', 'Latest Flagship OS')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Storage Editions</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">
                      {p.variants?.map(v => v.storage).filter(Boolean).join(', ') || '128GB, 256GB, 512GB'}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Group 3: Camera Array */}
            <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
                <Camera className="w-4 h-4" />
                <span>Camera Optics & Video</span>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Main Camera</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Main Camera', '48MP / 200MP OIS')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Optical Zoom</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Zoom', '5x Periscope Optical')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Video Recording</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Video', '4K @ 120fps / 8K')}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Group 4: Battery & Build */}
            <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
              <div className="p-4 bg-slate-950/60 border-b border-slate-800 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-400">
                <Battery className="w-4 h-4" />
                <span>Battery & Fast Charging</span>
              </div>
              <div className="divide-y divide-slate-800/60 text-xs">
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Battery Capacity</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Battery', '5,000 mAh')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Charging Speed</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Charging', '45W Wired, 15W Wireless')}</span>
                  ))}
                </div>
                <div className="p-4 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <span className="font-semibold text-slate-400">Water Resistance</span>
                  {items.map(p => (
                    <span key={p.id} className="text-white font-medium">{getSpec(p, 'Water', 'IP68 (6m for 30 min)')}</span>
                  ))}
                </div>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
};
