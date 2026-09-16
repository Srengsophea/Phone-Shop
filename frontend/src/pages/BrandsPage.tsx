import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, Search, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { BrandLogo } from '../components/BrandLogo';
import api from '../api/axios';

interface BrandItem {
  id: number;
  name: string;
  slug: string;
  logo?: string;
  is_featured?: boolean;
  products_count?: number;
}

const BRAND_TAGLINES: Record<string, { tagline: string; signature: string; gradient: string }> = {
  apple: {
    tagline: 'Titanium precision, A18 Pro silicon, and pro-grade camera innovation.',
    signature: 'iPhone 16 Pro Max • iPhone 15 Pro • iOS 18',
    gradient: 'from-slate-800/40 via-slate-900/60 to-slate-950',
  },
  samsung: {
    tagline: 'Pioneering Galaxy AI, ultra-telephoto zoom, and seamless foldables.',
    signature: 'Galaxy S25 Ultra • Galaxy Z Fold6 • S-Pen',
    gradient: 'from-blue-950/40 via-slate-900/60 to-slate-950',
  },
  google: {
    tagline: 'Intelligent photography, pure Android experience, and on-device Gemini AI.',
    signature: 'Pixel 9 Pro XL • Pixel 9 Pro Fold • Tensor G4',
    gradient: 'from-sky-950/40 via-slate-900/60 to-slate-950',
  },
  xiaomi: {
    tagline: 'Co-engineered with Leica for legendary optics and blisteringly fast HyperCharge.',
    signature: 'Xiaomi 15 Pro • Xiaomi 14T Pro • Leica Summilux',
    gradient: 'from-orange-950/40 via-slate-900/60 to-slate-950',
  },
  oneplus: {
    tagline: 'Never Settle with fluid 120Hz ProXDR displays and Hasselblad color mastery.',
    signature: 'OnePlus 13 • OnePlus 12 • 100W SUPERVOOC',
    gradient: 'from-red-950/40 via-slate-900/60 to-slate-950',
  },
  oppo: {
    tagline: 'Ultra-thin foldable craft, AI studio portrait perfection, and fluid design.',
    signature: 'Find X8 Pro • Find N3 Fold • Reno 12 Pro',
    gradient: 'from-emerald-950/40 via-slate-900/60 to-slate-950',
  },
  vivo: {
    tagline: 'ZEISS optical excellence, multifocal portrait masters, and BlueVolt battery life.',
    signature: 'X200 Pro • V40 Pro 5G • ZEISS APO Telephoto',
    gradient: 'from-cyan-950/40 via-slate-900/60 to-slate-950',
  },
  realme: {
    tagline: 'Monet luxury art dials, periscope telephotos, and unbeatable flagship value.',
    signature: 'Realme GT 6 5G • 13 Pro+ 5G • HYPERIMAGE+',
    gradient: 'from-amber-950/40 via-slate-900/60 to-slate-950',
  },
  honor: {
    tagline: 'World\'s thinnest foldables, Studio Harcourt portraits, and SGS drop protection.',
    signature: 'Magic V3 Fold • Magic 6 Pro • Honor 200 Pro',
    gradient: 'from-teal-950/40 via-slate-900/60 to-slate-950',
  },
  sony: {
    tagline: 'Alpha camera engineering, true optical zoom telephoto, and cinematic 4K 120fps.',
    signature: 'Xperia 1 VI • Xperia 5 V • Exmor T Sensor',
    gradient: 'from-purple-950/40 via-slate-900/60 to-slate-950',
  },
  asus: {
    tagline: 'Dominant esports mobile performance, AniMe Vision mini-LED, and 165Hz AMOLED.',
    signature: 'ROG Phone 8 Pro • ROG 7 Ultimate • AirTriggers',
    gradient: 'from-rose-950/40 via-slate-900/60 to-slate-950',
  },
  nothing: {
    tagline: 'Iconic transparent design, addressable Glyph Interface lights, and Nothing OS.',
    signature: 'Nothing Phone (2) • Phone (2a) Plus • Glyph Matrix',
    gradient: 'from-zinc-900/50 via-slate-900/60 to-slate-950',
  },
  infinix: {
    tagline: 'Esports cyber-mecha aesthetics, 100W All-Round FastCharge, and 4K vlogging.',
    signature: 'GT 20 Pro 5G • Note 40 Pro+ • Zero 30',
    gradient: 'from-emerald-950/30 via-slate-900/60 to-slate-950',
  },
  tecno: {
    tagline: 'Titanium aerospace foldables and Sony PolarAce computational imaging.',
    signature: 'Phantom V Fold2 5G • Camon 30 Premier',
    gradient: 'from-blue-950/30 via-slate-900/60 to-slate-950',
  },
  motorola: {
    tagline: 'Iconic flip phone innovation, real wood finishes, and Pantone color certification.',
    signature: 'Razr 50 Ultra • Edge 50 Ultra • Moto AI',
    gradient: 'from-sky-950/30 via-slate-900/60 to-slate-950',
  },
};

export const BrandsPage: React.FC = () => {
  const [brands, setBrands] = useState<BrandItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await api.get('/brands');
        const list = res.data?.data || res.data || [];
        setBrands(list);
      } catch (err) {
        console.error('Failed to load brands:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBrands();
  }, []);

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  return (
    <div className="min-h-screen bg-slate-950 py-10 px-4 sm:px-6 lg:px-8 text-slate-100">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Header Hero */}
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 border border-slate-800 p-8 sm:p-12 shadow-2xl">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Official Authorized Partners</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
              Explore 15 Official <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-300">
                Smartphone Brands
              </span>
            </h1>
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
              PhoneHub is an authorized dealer offering 100% genuine smartphones directly from world-leading manufacturers. Every device is backed by official international warranty and local nationwide support.
            </p>

            {/* Quick Guarantees */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-semibold text-slate-300">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" /> 1-Year Official Warranty
              </span>
              <span className="flex items-center gap-1.5 text-blue-400">
                <ShieldCheck className="w-4 h-4" /> 100% Sealed & Authentic
              </span>
              <span className="flex items-center gap-1.5 text-cyan-400">
                <Sparkles className="w-4 h-4" /> Free Express Shipping
              </span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search brand (e.g. Apple, Samsung, Nothing)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
            />
          </div>

          <div className="text-xs text-slate-400 font-medium">
            Showing <strong className="text-white">{filteredBrands.length}</strong> of{' '}
            <strong className="text-white">{brands.length}</strong> partner brands
          </div>
        </div>

        {/* Brands Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 rounded-3xl bg-slate-900/50 border border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBrands.map((brand) => {
              const meta = BRAND_TAGLINES[brand.slug] || {
                tagline: 'High quality smartphones with certified hardware performance.',
                signature: 'Flagship & Value Series',
                gradient: 'from-slate-900 via-slate-900 to-slate-950',
              };

              return (
                <Link
                  key={brand.id}
                  to={`/products?brand=${brand.slug}`}
                  className={`group relative rounded-3xl p-6 bg-gradient-to-b ${meta.gradient} border border-slate-800/80 hover:border-blue-500/50 shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col justify-between overflow-hidden`}
                >
                  <div className="space-y-4">
                    {/* Card Top */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <BrandLogo
                          name={brand.name}
                          slug={brand.slug}
                          className="w-12 h-12 !rounded-2xl shadow-lg group-hover:scale-105 transition-transform"
                        />
                        <div>
                          <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                            {brand.name}
                          </h3>
                          <span className="text-[11px] font-semibold text-slate-400">
                            {brand.products_count ?? 0} Models Available
                          </span>
                        </div>
                      </div>

                      <div className="w-8 h-8 rounded-full bg-slate-800/60 border border-slate-700/50 flex items-center justify-center text-slate-400 group-hover:text-blue-400 group-hover:border-blue-500/40 group-hover:bg-blue-500/10 transition-all">
                        <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                      </div>
                    </div>

                    {/* Tagline */}
                    <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed">
                      {meta.tagline}
                    </p>
                  </div>

                  {/* Card Bottom Signature Chips */}
                  <div className="pt-5 mt-5 border-t border-slate-800/80">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-1">
                      Featured Lineup:
                    </span>
                    <span className="text-[11px] font-semibold text-blue-400/90 truncate block">
                      {meta.signature}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
