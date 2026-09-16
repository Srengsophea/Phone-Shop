import React, { useEffect, useState } from 'react';
import {
  Plus,
  Search,
  Smartphone,
  Trash2,
  Edit2,
  X,
  Layers,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import api from '../../api/axios';
import { Product, Brand, Category } from '../../types';
import { formatPrice, getImageUrl } from '../../utils/formatters';

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Create / Edit modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand_id: '',
    category_id: '',
    base_price: '',
    sale_price: '',
    short_description: '',
    description: '',
    warranty_info: '1-Year Official Local Warranty',
    is_featured: false,
    is_bestseller: false,
    image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
    variants: [
      { name: '256GB / Black', sku: '', storage: '256GB', ram: '8GB', color: 'Black', color_hex: '#1e293b', price: '', stock: 10 },
    ],
  });

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const [prodRes, brandRes, catRes] = await Promise.all([
        api.get('/admin/products', { params: { search } }),
        api.get('/brands'),
        api.get('/categories'),
      ]);

      setProducts(prodRes.data.data);
      setBrands(brandRes.data.data);
      setCategories(catRes.data.data);
    } catch (err) {
      console.error('Error loading products', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, [search]);

  const handleOpenCreateModal = () => {
    setIsEditing(null);
    setFormData({
      name: '',
      sku: 'PH-' + Math.floor(1000 + Math.random() * 9000),
      brand_id: brands[0]?.id ? String(brands[0].id) : '',
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      base_price: '',
      sale_price: '',
      short_description: '',
      description: '',
      warranty_info: '1-Year Official Local Warranty',
      is_featured: false,
      is_bestseller: false,
      image_url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      variants: [
        { name: '256GB / Black', sku: '', storage: '256GB', ram: '8GB', color: 'Black', color_hex: '#1e293b', price: '', stock: 10 },
      ],
    });
    setIsModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        name: formData.name,
        sku: formData.sku,
        brand_id: Number(formData.brand_id) || brands[0]?.id,
        category_id: Number(formData.category_id) || categories[0]?.id,
        base_price: Number(formData.base_price),
        sale_price: formData.sale_price ? Number(formData.sale_price) : null,
        short_description: formData.short_description,
        description: formData.description,
        warranty_info: formData.warranty_info,
        is_featured: formData.is_featured,
        is_bestseller: formData.is_bestseller,
        images: [{ image_path: formData.image_url, is_primary: true }],
        variants: formData.variants.map((v, i) => ({
          ...v,
          sku: v.sku || `${formData.sku}-V${i + 1}`,
          price: Number(v.price || formData.base_price),
          stock: Number(v.stock),
        })),
      };

      if (isEditing) {
        await api.put(`/admin/products/${isEditing}`, payload);
        setFeedback('Product updated successfully.');
      } else {
        await api.post('/admin/products', payload);
        setFeedback('New smartphone created successfully.');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
        loadProducts();
      }, 1000);
    } catch (err: any) {
      setFeedback(err.response?.data?.message || 'Error saving product.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await api.delete(`/admin/products/${id}`);
      loadProducts();
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">Product & Variant Management</h1>
          <p className="text-xs text-slate-400 mt-1">Manage smartphone catalog, pricing, variants, and specifications</p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Smartphone</span>
        </button>
      </div>

      {/* Search Filter Bar */}
      <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="relative flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phones by name or SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
        </div>
      </div>

      {/* Products Data Table */}
      <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Smartphone</th>
                <th className="py-3 px-4">Brand</th>
                <th className="py-3 px-4">SKU</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Variants & Stock</th>
                <th className="py-3 px-4">Badges</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    Loading smartphone database...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No products found.
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
                  const primaryImg = p.images?.[0]?.image_path;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0 flex items-center justify-center">
                          <img src={getImageUrl(primaryImg)} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.category?.name || 'Smartphones'}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-400 font-semibold text-[10px]">
                          {p.brand?.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300">{p.sku}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{formatPrice(p.base_price)}</td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                          totalStock <= 5 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/15 text-emerald-400'
                        }`}>
                          {totalStock} in stock ({p.variants?.length || 1} variants)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1">
                          {p.is_featured && <span className="px-1.5 py-0.5 rounded bg-blue-600/30 text-blue-400 text-[9px] font-bold">FEAT</span>}
                          {p.is_bestseller && <span className="px-1.5 py-0.5 rounded bg-amber-500/30 text-amber-400 text-[9px] font-bold">BEST</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

            <div className="relative w-full max-w-2xl rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl z-10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Add New Smartphone</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {feedback && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                  {feedback}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Model Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Galaxy S25 Ultra"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Base SKU *</label>
                    <input
                      type="text"
                      required
                      value={formData.sku}
                      onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                      placeholder="S25U-BASE"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Brand</label>
                    <select
                      value={formData.brand_id}
                      onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Base Price ($) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={formData.base_price}
                      onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                      placeholder="1199.00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Sale Price (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.sale_price}
                      onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                      placeholder="1149.00"
                      className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Image URL</label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Short Description</label>
                  <textarea
                    rows={2}
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    placeholder="Key highlights and standout features..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex items-center gap-6 pt-2">
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_featured}
                      onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600"
                    />
                    <span>Mark as Featured Flagship</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_bestseller}
                      onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                      className="rounded border-slate-700 text-blue-600"
                    />
                    <span>Mark as Bestseller</span>
                  </label>
                </div>

                <div className="flex gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
                  >
                    Save Smartphone
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
