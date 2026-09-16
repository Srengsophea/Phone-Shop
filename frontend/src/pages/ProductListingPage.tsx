import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X, SlidersHorizontal, ArrowUpDown, Smartphone, RotateCcw } from 'lucide-react';
import api from '../api/axios';
import { Product, Brand, Category } from '../types';
import { ProductCard } from '../components/ProductCard';
import { QuickViewModal } from '../components/QuickViewModal';
import { BrandLogo } from '../components/BrandLogo';
import { useFilterStore } from '../stores/filterStore';

export const ProductListingPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterStore = useFilterStore();

  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  // Sync URL query params with filterStore on initial mount
  useEffect(() => {
    const brandParam = searchParams.get('brand');
    const catParam = searchParams.get('category');
    const searchParam = searchParams.get('search');
    const onSaleParam = searchParams.get('on_sale');

    if (brandParam) filterStore.setBrand(brandParam);
    if (catParam) filterStore.setCategory(catParam);
    if (searchParam) filterStore.setSearch(searchParam);
    if (onSaleParam === '1') filterStore.setOnSale(true);
  }, []);

  // Fetch brands and categories for sidebar filter
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [brandRes, catRes] = await Promise.all([
          api.get('/brands'),
          api.get('/categories'),
        ]);
        setBrands(brandRes.data.data);
        setCategories(catRes.data.data);
      } catch (err) {
        console.error('Failed to load filter metadata', err);
      }
    };
    fetchMetadata();
  }, []);

  // Fetch products whenever filterStore changes
  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const params: Record<string, any> = {
          page: filterStore.page,
          per_page: 12,
          sort: filterStore.sort,
        };

        if (filterStore.search) params.search = filterStore.search;
        if (filterStore.brand) params.brand = filterStore.brand;
        if (filterStore.category) params.category = filterStore.category;
        if (filterStore.minPrice !== '') params.min_price = filterStore.minPrice;
        if (filterStore.maxPrice !== '') params.max_price = filterStore.maxPrice;
        if (filterStore.ram) params.ram = filterStore.ram;
        if (filterStore.storage) params.storage = filterStore.storage;
        if (filterStore.inStock) params.in_stock = 1;
        if (filterStore.onSale) params.on_sale = 1;

        const response = await api.get('/products', { params });
        setProducts(response.data.data);
        setPagination(response.data.meta);
      } catch (err) {
        console.error('Failed to fetch filtered products', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [
    filterStore.search,
    filterStore.brand,
    filterStore.category,
    filterStore.minPrice,
    filterStore.maxPrice,
    filterStore.ram,
    filterStore.storage,
    filterStore.sort,
    filterStore.inStock,
    filterStore.onSale,
    filterStore.page,
  ]);

  const storageOptions = ['128GB', '256GB', '512GB', '1TB'];
  const ramOptions = ['8GB', '12GB', '16GB'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Sort Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Flagship Smartphones Catalog
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Showing <strong className="text-blue-400">{pagination.total}</strong> certified genuine smartphones
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-3">
          {/* Mobile filter toggle */}
          <button
            onClick={() => setIsMobileFilterOpen(!isMobileFilterOpen)}
            className="lg:hidden flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300"
          >
            <SlidersHorizontal className="w-4 h-4 text-blue-400" />
            <span>Filters</span>
          </button>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs">
            <ArrowUpDown className="w-4 h-4 text-slate-400" />
            <span className="text-slate-400">Sort by:</span>
            <select
              value={filterStore.sort}
              onChange={(e) => filterStore.setSort(e.target.value)}
              className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer"
            >
              <option value="featured" className="bg-slate-900">Featured</option>
              <option value="newest" className="bg-slate-900">Newest Releases</option>
              <option value="price_asc" className="bg-slate-900">Price: Low to High</option>
              <option value="price_desc" className="bg-slate-900">Price: High to Low</option>
              <option value="best_selling" className="bg-slate-900">Best Selling</option>
              <option value="highest_rated" className="bg-slate-900">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Filter Sidebar + Products Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* Filter Sidebar (Desktop) */}
        <aside className={`lg:block ${isMobileFilterOpen ? 'block' : 'hidden'} space-y-6 bg-slate-900/40 p-6 rounded-3xl border border-slate-800/80`}>
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-400" />
              <span>Filters</span>
            </h3>
            <button
              onClick={() => filterStore.resetFilters()}
              className="text-xs text-slate-400 hover:text-blue-400 flex items-center gap-1 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          </div>

          {/* Brand Filter */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Brand</h4>
            <div className="flex flex-col space-y-2 max-h-48 overflow-y-auto pr-2">
              {brands.map((b) => (
                <label
                  key={b.id}
                  className="flex items-center justify-between text-xs text-slate-300 hover:text-white cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <input
                      type="radio"
                      name="brand_filter"
                      checked={filterStore.brand === b.slug}
                      onChange={() => filterStore.setBrand(filterStore.brand === b.slug ? '' : b.slug)}
                      className="rounded border-slate-700 text-blue-600 focus:ring-0"
                    />
                    <BrandLogo name={b.name} slug={b.slug} className="w-5 h-5 !rounded-md shrink-0" />
                    <span>{b.name}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">({b.products_count || 0})</span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Price Range ($)</h4>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Min"
                value={filterStore.minPrice}
                onChange={(e) => filterStore.setPriceRange(e.target.value ? Number(e.target.value) : '', filterStore.maxPrice)}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <input
                type="number"
                placeholder="Max"
                value={filterStore.maxPrice}
                onChange={(e) => filterStore.setPriceRange(filterStore.minPrice, e.target.value ? Number(e.target.value) : '')}
                className="px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
            </div>
          </div>

          {/* Storage Capacity */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Storage</h4>
            <div className="flex flex-wrap gap-2">
              {storageOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => filterStore.setStorage(filterStore.storage === opt ? '' : opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    filterStore.storage === opt
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* RAM Memory */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">RAM</h4>
            <div className="flex flex-wrap gap-2">
              {ramOptions.map((opt) => (
                <button
                  key={opt}
                  onClick={() => filterStore.setRam(filterStore.ram === opt ? '' : opt)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                    filterStore.ram === opt
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles: In Stock & On Sale */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterStore.inStock}
                onChange={(e) => filterStore.setInStock(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>In Stock Only</span>
            </label>

            <label className="flex items-center gap-2.5 text-xs text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={filterStore.onSale}
                onChange={(e) => filterStore.setOnSale(e.target.checked)}
                className="rounded border-slate-700 text-blue-600 focus:ring-0"
              />
              <span>Discounted Deals Only</span>
            </label>
          </div>

        </aside>

        {/* Product Grid Area */}
        <main className="lg:col-span-3 space-y-8">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="aspect-[3/4] rounded-2xl bg-slate-900/60 animate-pulse border border-slate-800" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="p-16 rounded-3xl bg-slate-900/30 border border-slate-800 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mx-auto">
                <Smartphone className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-white">No smartphones found</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                We couldn't find any products matching your specific filters. Try resetting filters or adjusting your search term.
              </p>
              <button
                onClick={() => filterStore.resetFilters()}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onQuickView={setQuickViewProduct}
                />
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-6">
              <button
                onClick={() => filterStore.setPage(Math.max(1, filterStore.page - 1))}
                disabled={filterStore.page === 1}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-xs text-slate-400 px-3">
                Page <strong className="text-white">{pagination.current_page}</strong> of {pagination.last_page}
              </span>
              <button
                onClick={() => filterStore.setPage(Math.min(pagination.last_page, filterStore.page + 1))}
                disabled={filterStore.page === pagination.last_page}
                className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </main>

      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={quickViewProduct}
        onClose={() => setQuickViewProduct(null)}
      />

    </div>
  );
};
