import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, Sparkles, ChevronRight, TrendingUp, ArrowRight } from 'lucide-react';
import api from '../api/axios';
import { Product } from '../types';
import { formatPrice, getImageUrl } from '../utils/formatters';
import { BrandLogo } from './BrandLogo';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TRENDING_SEARCHES = [
  'iPhone 16 Pro Max',
  'Galaxy S25 Ultra',
  'Pixel 9 Pro XL',
  'Xiaomi 15 Pro',
  'Snapdragon 8 Elite',
  '200MP Camera',
];

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Global ESC and Ctrl+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Live search debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await api.get('/products', {
          params: { search: query, per_page: 6 },
        });
        setResults(response.data.data || []);
      } catch (err) {
        console.error('Search query error', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelectProduct = (slug: string) => {
    onClose();
    navigate(`/products/${slug}`);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onClose();
      navigate(`/products?search=${encodeURIComponent(query.trim())}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Header Bar */}
        <form onSubmit={handleSearchSubmit} className="relative flex items-center border-b border-slate-800 px-5 py-4">
          <Search className="w-5 h-5 text-blue-400 shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search phones by model, brand, chip, camera (e.g. S25 Ultra, Titanium)..."
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-base focus:outline-none"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-slate-800 text-[11px] font-mono text-slate-400 hover:text-white"
          >
            ESC
          </button>
        </form>

        {/* Modal Body */}
        <div className="max-h-[60vh] overflow-y-auto p-5 space-y-5">
          {/* Trending suggestions */}
          {!query && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <TrendingUp className="w-4 h-4 text-blue-400" />
                <span>Trending Searches</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {TRENDING_SEARCHES.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setQuery(item)}
                    className="px-3.5 py-1.5 rounded-full bg-slate-800/80 hover:bg-blue-600/20 border border-slate-700 hover:border-blue-500/40 text-xs text-slate-300 hover:text-blue-400 transition-all"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-8 text-center space-y-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-400">Scanning flagship smartphones...</p>
            </div>
          )}

          {/* Search Results */}
          {!isLoading && query && results.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-400 pb-1">
                <span>Matching Devices ({results.length})</span>
                <button
                  onClick={handleSearchSubmit}
                  className="text-blue-400 hover:underline flex items-center gap-1 font-semibold text-[11px]"
                >
                  View all results <ChevronRight className="w-3 h-3" />
                </button>
              </div>

              <div className="space-y-2">
                {results.map((product) => {
                  const primaryImage =
                    product.images?.find((img) => img.is_primary)?.image_path ||
                    product.images?.[0]?.image_path;
                  const price = product.sale_price ?? product.base_price;

                  return (
                    <div
                      key={product.id}
                      onClick={() => handleSelectProduct(product.slug)}
                      className="group flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-blue-500/40 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 p-1.5 border border-slate-800 shrink-0 flex items-center justify-center overflow-hidden group-hover:scale-105 transition-transform">
                          <img
                            src={getImageUrl(primaryImage)}
                            alt={product.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            {product.brand && (
                              <BrandLogo
                                name={product.brand.name}
                                slug={product.brand.slug}
                                className="w-3.5 h-3.5 !rounded-sm shrink-0"
                              />
                            )}
                            <span className="text-xs font-medium text-slate-400">
                              {product.brand?.name}
                            </span>
                          </div>
                          <p className="text-sm font-bold text-slate-100 group-hover:text-blue-400 transition-colors truncate">
                            {product.name}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0 pl-3">
                        <span className="text-sm font-bold text-white block">
                          {formatPrice(price)}
                        </span>
                        {product.sale_price && product.base_price > product.sale_price && (
                          <span className="text-[10px] text-emerald-400 font-semibold">
                            Special Deal
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Empty Results */}
          {!isLoading && query && results.length === 0 && (
            <div className="py-10 text-center space-y-3">
              <Sparkles className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No smartphones found for "{query}"</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Try searching by brand name like "Apple", "Samsung", or feature keywords like "OLED" or "Pro Max".
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 bg-slate-950/60 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">↵</kbd> Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">ESC</kbd> Close
            </span>
          </div>
          <button
            onClick={handleSearchSubmit}
            className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
          >
            Explore all catalog <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
