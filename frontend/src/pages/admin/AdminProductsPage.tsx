import React, { useEffect, useState, useRef } from 'react';
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
  AlertCircle,
  ExternalLink,
  Cpu,
  FileText,
  Info,
  Upload,
  Star,
  Sparkles,
  Check,
  Eye,
  Tag
} from 'lucide-react';
import api from '../../api/axios';
import { Product, Brand, Category, ProductVariant, ProductImage } from '../../types';
import { formatPrice, getImageUrl } from '../../utils/formatters';

interface FormVariant {
  id?: number;
  name: string;
  sku: string;
  storage: string;
  ram: string;
  color: string;
  color_hex: string;
  price: string;
  sale_price: string;
  stock: number;
}

interface FormSpec {
  group_name: string;
  name: string;
  value: string;
}

interface FormImage {
  image_path: string;
  is_primary: boolean;
}

const PRESET_GALLERY_IMAGES = [
  { name: 'iPhone 16 Pro Max', path: '/images/products/iphone-16-pro-max.jpg' },
  { name: 'Galaxy S25 Ultra', path: '/images/products/samsung-galaxy-s25-ultra.jpg' },
  { name: 'Pixel 9 Pro XL', path: '/images/products/google-pixel-9-pro-xl.jpg' },
  { name: 'Xiaomi 15 Pro', path: '/images/products/xiaomi-15-pro.jpg' },
  { name: 'OnePlus 13', path: '/images/products/oneplus-13.jpg' },
  { name: 'OPPO Find X8 Pro', path: '/images/products/oppo-find-x8-pro.jpg' },
  { name: 'Vivo X100 Pro', path: '/images/products/vivo-x100-pro.jpg' },
  { name: 'Realme GT 6 5G', path: '/images/products/realme-gt-6-5g.jpg' },
  { name: 'Galaxy Z Fold6', path: '/images/products/samsung-galaxy-z-fold6.jpg' },
  { name: 'iPhone 16 Blue', path: '/images/products/iphone-16.jpg' },
];

export const AdminProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedBrandFilter, setSelectedBrandFilter] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'description' | 'variants' | 'specs' | 'media'>('basic');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    brand_id: '',
    category_id: '',
    base_price: '',
    sale_price: '',
    short_description: '',
    description: '',
    warranty_info: '1-Year Official Local & Global Warranty',
    is_featured: false,
    is_bestseller: false,
    is_active: true,
  });

  const [formVariants, setFormVariants] = useState<FormVariant[]>([]);
  const [formSpecs, setFormSpecs] = useState<FormSpec[]>([]);
  const [formImages, setFormImages] = useState<FormImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');

  // Load products list
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const [prodRes, brandRes, catRes] = await Promise.all([
        api.get('/admin/products', {
          params: {
            search: search || undefined,
            brand_id: selectedBrandFilter || undefined,
          }
        }),
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
  }, [search, selectedBrandFilter]);

  // Open modal to Create New Smartphone
  const handleOpenCreateModal = () => {
    setIsEditing(null);
    setActiveTab('basic');
    setFeedback(null);

    const generatedSku = 'PH-' + Math.floor(1000 + Math.random() * 9000);
    setFormData({
      name: '',
      sku: generatedSku,
      brand_id: brands[0]?.id ? String(brands[0].id) : '',
      category_id: categories[0]?.id ? String(categories[0].id) : '',
      base_price: '999.00',
      sale_price: '',
      short_description: 'Next-generation flagship smartphone with ultra-vibrant display and pro-grade camera system.',
      description: 'Engineered for exceptional mobile performance, featuring state-of-the-art processor architecture, cinematic video recording capabilities, all-day battery efficiency, and sleek aerospace-grade industrial design.',
      warranty_info: '1-Year Official Local & Global Warranty',
      is_featured: true,
      is_bestseller: false,
      is_active: true,
    });

    setFormVariants([
      { name: '256GB / Titanium Black', sku: `${generatedSku}-256-BLK`, storage: '256GB', ram: '12GB', color: 'Titanium Black', color_hex: '#1e293b', price: '999.00', sale_price: '', stock: 25 },
      { name: '512GB / Titanium Silver', sku: `${generatedSku}-512-SLV`, storage: '512GB', ram: '12GB', color: 'Titanium Silver', color_hex: '#94a3b8', price: '1099.00', sale_price: '', stock: 15 },
    ]);

    setFormSpecs([
      { group_name: 'Display', name: 'Screen Size', value: '6.8-inch LTPO AMOLED' },
      { group_name: 'Display', name: 'Refresh Rate', value: '120Hz ProMotion (1-120Hz adaptive)' },
      { group_name: 'Display', name: 'Peak Brightness', value: '2,600 nits' },
      { group_name: 'Performance', name: 'Processor', value: 'Octa-Core Flagship Processor (3nm)' },
      { group_name: 'Performance', name: 'Operating System', value: 'Latest Flagship OS with 7-Year Updates' },
      { group_name: 'Camera', name: 'Main Camera', value: '50MP OIS Wide + 50MP Ultra-Wide + 50MP Telephoto' },
      { group_name: 'Camera', name: 'Zoom Capability', value: '5x Optical Zoom, 100x Space Zoom' },
      { group_name: 'Battery', name: 'Battery Capacity', value: '5,000 mAh' },
      { group_name: 'Battery', name: 'Charging Speed', value: '45W Wired, 15W Wireless Qi2' },
      { group_name: 'Connectivity', name: 'Network', value: '5G Dual SIM (Nano-SIM + eSIM), Wi-Fi 7' },
      { group_name: 'Build', name: 'Water Resistance', value: 'IP68 Dust & Water Resistant (6m up to 30 mins)' },
    ]);

    setFormImages([
      { image_path: '/images/products/iphone-16-pro-max.jpg', is_primary: true },
    ]);

    setIsModalOpen(true);
  };

  // Open modal to Edit Existing Smartphone
  const handleOpenEditModal = async (product: Product) => {
    setIsEditing(product.id);
    setActiveTab('basic');
    setFeedback(null);

    try {
      const response = await api.get(`/admin/products/${product.id}`);
      const p: Product = response.data.data;

      setFormData({
        name: p.name,
        sku: p.sku,
        brand_id: p.brand_id ? String(p.brand_id) : '',
        category_id: p.category_id ? String(p.category_id) : '',
        base_price: String(p.base_price),
        sale_price: p.sale_price ? String(p.sale_price) : '',
        short_description: p.short_description || '',
        description: p.description || '',
        warranty_info: p.warranty_info || '1-Year Official Local & Global Warranty',
        is_featured: !!p.is_featured,
        is_bestseller: !!p.is_bestseller,
        is_active: p.is_active !== undefined ? !!p.is_active : true,
      });

      if (p.variants && p.variants.length > 0) {
        setFormVariants(
          p.variants.map((v) => ({
            id: v.id,
            name: v.name,
            sku: v.sku,
            storage: v.storage || '',
            ram: v.ram || '',
            color: v.color || '',
            color_hex: v.color_hex || '#1e293b',
            price: String(v.price),
            sale_price: v.sale_price ? String(v.sale_price) : '',
            stock: v.stock,
          }))
        );
      } else {
        setFormVariants([
          { name: 'Standard Edition', sku: `${p.sku}-STD`, storage: '256GB', ram: '8GB', color: 'Black', color_hex: '#1e293b', price: String(p.base_price), sale_price: '', stock: 10 }
        ]);
      }

      if (p.specifications && Array.isArray(p.specifications) && p.specifications.length > 0) {
        setFormSpecs(
          p.specifications.map((s: any) => ({
            group_name: s.group_name || 'General',
            name: s.name,
            value: s.value,
          }))
        );
      } else {
        setFormSpecs([]);
      }

      if (p.images && p.images.length > 0) {
        setFormImages(
          p.images.map((img) => ({
            image_path: img.image_path,
            is_primary: !!img.is_primary,
          }))
        );
      } else {
        setFormImages([]);
      }

      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching product for edit', err);
      alert('Failed to load product details.');
    }
  };

  // Generate SKU helper
  const handleGenerateSku = () => {
    const brandName = brands.find((b) => String(b.id) === formData.brand_id)?.name.substring(0, 3).toUpperCase() || 'PH';
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    setFormData((prev) => ({ ...prev, sku: `${brandName}-${randomCode}` }));
  };

  // Variant Helpers
  const handleAddVariant = () => {
    const nextIdx = formVariants.length + 1;
    setFormVariants([
      ...formVariants,
      {
        name: `Edition ${nextIdx}`,
        sku: `${formData.sku}-V${nextIdx}`,
        storage: '256GB',
        ram: '12GB',
        color: 'Dark Titanium',
        color_hex: '#1e293b',
        price: formData.base_price || '999.00',
        sale_price: '',
        stock: 15,
      },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (formVariants.length <= 1) {
      alert('A smartphone must have at least one variant.');
      return;
    }
    setFormVariants(formVariants.filter((_, i) => i !== index));
  };

  const handleUpdateVariant = (index: number, field: keyof FormVariant, value: any) => {
    const updated = [...formVariants];
    updated[index] = { ...updated[index], [field]: value };
    setFormVariants(updated);
  };

  // Specification Helpers
  const handleAddSpec = () => {
    setFormSpecs([
      ...formSpecs,
      { group_name: 'General', name: 'Specification', value: 'Value' },
    ]);
  };

  const handleRemoveSpec = (index: number) => {
    setFormSpecs(formSpecs.filter((_, i) => i !== index));
  };

  const handleUpdateSpec = (index: number, field: keyof FormSpec, value: string) => {
    const updated = [...formSpecs];
    updated[index] = { ...updated[index], [field]: value };
    setFormSpecs(updated);
  };

  // Auto-populate Flagship Template Specs
  const handleInsertFlagshipTemplateSpecs = () => {
    setFormSpecs([
      { group_name: 'Display', name: 'Screen Size', value: '6.82-inch Dynamic LTPO AMOLED 2X' },
      { group_name: 'Display', name: 'Resolution', value: '3120 x 1440 pixels (Quad HD+), 505 ppi' },
      { group_name: 'Display', name: 'Refresh Rate', value: '1-120Hz Adaptive ProMotion' },
      { group_name: 'Display', name: 'Glass Protection', value: 'Corning Gorilla Armor / Ceramic Shield' },
      { group_name: 'Performance', name: 'Processor', value: 'Snapdragon 8 Elite / Apple A18 Pro (3nm)' },
      { group_name: 'Performance', name: 'Neural Engine / NPU', value: 'Dedicated 45 TOPS On-Device AI NPU' },
      { group_name: 'Camera', name: 'Main Camera', value: '200MP Wide (f/1.7, OIS, Super Quad Pixel)' },
      { group_name: 'Camera', name: 'Telephoto Lens', value: '50MP Periscope (5x Optical Zoom, 100x AI Space Zoom)' },
      { group_name: 'Camera', name: 'Ultra-Wide', value: '50MP Ultra-Wide (120° FoV, Macro Focus)' },
      { group_name: 'Camera', name: 'Video Recording', value: '8K @ 30fps, 4K @ 120fps Dolby Vision HDR' },
      { group_name: 'Battery & Power', name: 'Battery Capacity', value: '5,000 mAh High-Density Silicon-Carbon' },
      { group_name: 'Battery & Power', name: 'Fast Charging', value: '65W SuperVOOC / 45W Wired, 15W Wireless' },
      { group_name: 'Connectivity', name: '5G & Cellular', value: 'Sub-6GHz + mmWave 5G, Dual eSIM / Dual SIM' },
      { group_name: 'Connectivity', name: 'Wireless', value: 'Wi-Fi 7 (802.11be), Bluetooth 5.4, Ultra-Wideband (UWB)' },
      { group_name: 'Durability', name: 'Ingress Protection', value: 'IP68 Certified (Submersible up to 6m for 30m)' },
    ]);
  };

  // Media Helpers
  const handleAddImageUrl = () => {
    if (!newImageUrl.trim()) return;
    setFormImages([
      ...formImages,
      { image_path: newImageUrl.trim(), is_primary: formImages.length === 0 },
    ]);
    setNewImageUrl('');
  };

  const handleSetPrimaryImage = (index: number) => {
    setFormImages(
      formImages.map((img, i) => ({
        ...img,
        is_primary: i === index,
      }))
    );
  };

  const handleRemoveImage = (index: number) => {
    const updated = formImages.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((img) => img.is_primary)) {
      updated[0].is_primary = true;
    }
    setFormImages(updated);
  };

  // Image File Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    const uploadData = new FormData();
    uploadData.append('image', file);

    try {
      const response = await api.post('/admin/products/upload-image', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      const uploadedPath = response.data.image_path || response.data.url;
      setFormImages((prev) => [
        ...prev,
        { image_path: uploadedPath, is_primary: prev.length === 0 },
      ]);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Image upload failed.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedback(null);

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
        is_active: formData.is_active,
        images: formImages.length > 0 ? formImages : [
          { image_path: '/images/products/iphone-16-pro-max.jpg', is_primary: true }
        ],
        variants: formVariants.map((v, i) => ({
          ...(v.id ? { id: v.id } : {}),
          name: v.name,
          sku: v.sku || `${formData.sku}-V${i + 1}`,
          storage: v.storage,
          ram: v.ram,
          color: v.color,
          color_hex: v.color_hex,
          price: Number(v.price || formData.base_price),
          sale_price: v.sale_price ? Number(v.sale_price) : null,
          stock: Number(v.stock),
        })),
        specifications: formSpecs,
      };

      if (isEditing) {
        await api.put(`/admin/products/${isEditing}`, payload);
        setFeedback('Smartphone updated successfully!');
      } else {
        await api.post('/admin/products', payload);
        setFeedback('New smartphone added successfully!');
      }

      setTimeout(() => {
        setIsModalOpen(false);
        setFeedback(null);
        loadProducts();
      }, 1000);
    } catch (err: any) {
      setFeedback(err.response?.data?.message || 'Failed to save smartphone.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete product
  const handleDelete = async (id: number, name: string) => {
    if (confirm(`Are you sure you want to permanently delete "${name}"?`)) {
      try {
        await api.delete(`/admin/products/${id}`);
        loadProducts();
      } catch (err) {
        alert('Failed to delete product.');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Smartphone className="w-7 h-7 text-blue-500" />
            <span>Smartphone Management</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your store catalog with complete customization: multi-variants, tech specifications, and high-res media.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Smartphone</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search phones by model name or SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedBrandFilter}
            onChange={(e) => setSelectedBrandFilter(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
          >
            <option value="">All Brands</option>
            {brands.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Products Data Table */}
      <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/60">
              <tr>
                <th className="py-3.5 px-4">Smartphone</th>
                <th className="py-3.5 px-4">Brand</th>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Base Price</th>
                <th className="py-3.5 px-4">Variants & Stock</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Loading smartphone database...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 space-y-2">
                    <Smartphone className="w-10 h-10 mx-auto text-slate-600" />
                    <p className="font-semibold text-white">No smartphones found</p>
                    <p className="text-xs text-slate-400">Try adjusting your search query or add a new smartphone.</p>
                  </td>
                </tr>
              ) : (
                products.map((p) => {
                  const totalStock = p.variants?.reduce((sum, v) => sum + v.stock, 0) ?? 0;
                  const primaryImg = p.images?.find((img) => img.is_primary)?.image_path || p.images?.[0]?.image_path;

                  return (
                    <tr key={p.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3.5 px-4 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-slate-950 p-1 border border-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
                          <img src={getImageUrl(primaryImg)} alt="" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div>
                          <p className="font-bold text-white text-sm hover:text-blue-400 transition-colors">{p.name}</p>
                          <p className="text-[11px] text-slate-400">{p.category?.name || 'Smartphones'}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-semibold text-[10px]">
                          {p.brand?.name}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-slate-300 font-medium">{p.sku}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-white text-sm">{formatPrice(p.base_price)}</div>
                        {p.sale_price && (
                          <div className="text-[10px] text-emerald-400 font-semibold">Sale: {formatPrice(p.sale_price)}</div>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] inline-flex items-center gap-1.5 ${
                          totalStock <= 5 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${totalStock <= 5 ? 'bg-rose-400' : 'bg-emerald-400'}`} />
                          {totalStock} in stock ({p.variants?.length || 1} variants)
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex gap-1.5">
                          {p.is_featured && <span className="px-2 py-0.5 rounded-md bg-blue-600/30 border border-blue-500/30 text-blue-400 text-[9px] font-bold">FEATURED</span>}
                          {p.is_bestseller && <span className="px-2 py-0.5 rounded-md bg-amber-500/30 border border-amber-500/30 text-amber-400 text-[9px] font-bold">BESTSELLER</span>}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <a
                            href={`/products/${p.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                            title="View on Live Store"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                          <button
                            onClick={() => handleOpenEditModal(p)}
                            className="p-2 rounded-xl text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                            title="Edit Smartphone"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(p.id, p.name)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Smartphone"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Comprehensive Add / Edit Smartphone Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 sm:p-6">
            <div onClick={() => setIsModalOpen(false)} className="fixed inset-0 bg-slate-950/85 backdrop-blur-md transition-opacity" />

            <div className="relative w-full max-w-4xl rounded-3xl bg-slate-900 border border-slate-700/80 p-6 sm:p-8 shadow-2xl z-10 space-y-6">
              
              {/* Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-blue-500" />
                    <span>{isEditing ? 'Edit Smartphone' : 'Add New Smartphone'}</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Customize models, storage editions, camera and display specs, and product photos
                  </p>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Feedback Banner */}
              {feedback && (
                <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
                  feedback.includes('success')
                    ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400'
                    : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'
                }`}>
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span className="font-semibold">{feedback}</span>
                </div>
              )}

              {/* Navigation Tabs */}
              <div className="flex p-1 rounded-2xl bg-slate-950 border border-slate-800 overflow-x-auto gap-1">
                <button
                  type="button"
                  onClick={() => setActiveTab('basic')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'basic' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Info className="w-3.5 h-3.5" />
                  <span>1. Basic & Pricing</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('description')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'description' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>2. Description</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('variants')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'variants' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>3. Variants & Stock ({formVariants.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('specs')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'specs' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Cpu className="w-3.5 h-3.5" />
                  <span>4. Tech Specs ({formSpecs.length})</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab('media')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                    activeTab === 'media' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>5. Photos ({formImages.length})</span>
                </button>
              </div>

              {/* Form Contents */}
              <form onSubmit={handleSaveProduct} className="space-y-6">
                
                {/* TAB 1: BASIC INFORMATION & PRICING */}
                {activeTab === 'basic' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Model Name *</label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="e.g. Galaxy S25 Ultra 5G"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="block text-xs font-bold text-slate-300">Base SKU *</label>
                          <button
                            type="button"
                            onClick={handleGenerateSku}
                            className="text-[10px] text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <Sparkles className="w-3 h-3" /> Auto-Gen SKU
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          value={formData.sku}
                          onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                          placeholder="SAM-S25U"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Brand *</label>
                        <select
                          value={formData.brand_id}
                          onChange={(e) => setFormData({ ...formData, brand_id: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          {brands.map((b) => (
                            <option key={b.id} value={b.id}>{b.name}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Category *</label>
                        <select
                          value={formData.category_id}
                          onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-blue-500"
                        >
                          {categories.map((c) => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Base Price ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          value={formData.base_price}
                          onChange={(e) => setFormData({ ...formData, base_price: e.target.value })}
                          placeholder="1199.00"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Sale Price ($) (Optional)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.sale_price}
                          onChange={(e) => setFormData({ ...formData, sale_price: e.target.value })}
                          placeholder="1099.00"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-300 mb-1.5">Warranty Info</label>
                        <input
                          type="text"
                          value={formData.warranty_info}
                          onChange={(e) => setFormData({ ...formData, warranty_info: e.target.value })}
                          placeholder="1-Year Official Warranty"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {/* Status Checkboxes */}
                    <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_active}
                          onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                        />
                        <span>Active / Published</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                        />
                        <span>Featured Flagship Badge</span>
                      </label>

                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-200 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.is_bestseller}
                          onChange={(e) => setFormData({ ...formData, is_bestseller: e.target.checked })}
                          className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0"
                        />
                        <span>Bestseller Badge</span>
                      </label>
                    </div>
                  </div>
                )}

                {/* TAB 2: DESCRIPTION & MARKETING */}
                {activeTab === 'description' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Short Tagline / Teaser</label>
                      <p className="text-[11px] text-slate-500 mb-2">Appears in catalog cards, quick view, and preview cards.</p>
                      <textarea
                        rows={2}
                        value={formData.short_description}
                        onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                        placeholder="Next-generation flagship smartphone with titanium frame and Pro camera system."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-1.5">Full Detailed Description</label>
                      <p className="text-[11px] text-slate-500 mb-2">Displays on the main product specification page.</p>
                      <textarea
                        rows={6}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Detailed overview of smartphone features, display capabilities, camera array, battery performance, and warranty guarantees."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 leading-relaxed"
                      />
                    </div>
                  </div>
                )}

                {/* TAB 3: VARIANTS & STOCK MANAGER */}
                {activeTab === 'variants' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Smartphone Storage & Color Editions</h4>
                        <p className="text-[11px] text-slate-400">Configure multiple storage sizes, RAM, color hex swatches, and stock.</p>
                      </div>
                      <button
                        type="button"
                        onClick={handleAddVariant}
                        className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Variant</span>
                      </button>
                    </div>

                    <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                      {formVariants.map((variant, index) => (
                        <div key={index} className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-blue-400">Variant #{index + 1}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveVariant(index)}
                              className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                              title="Remove Variant"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Edition Name *</label>
                              <input
                                type="text"
                                required
                                value={variant.name}
                                onChange={(e) => handleUpdateVariant(index, 'name', e.target.value)}
                                placeholder="256GB / Titanium Black"
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Storage</label>
                              <input
                                type="text"
                                value={variant.storage}
                                onChange={(e) => handleUpdateVariant(index, 'storage', e.target.value)}
                                placeholder="256GB"
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">RAM</label>
                              <input
                                type="text"
                                value={variant.ram}
                                onChange={(e) => handleUpdateVariant(index, 'ram', e.target.value)}
                                placeholder="12GB"
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Variant SKU *</label>
                              <input
                                type="text"
                                required
                                value={variant.sku}
                                onChange={(e) => handleUpdateVariant(index, 'sku', e.target.value)}
                                placeholder="S25U-256-BLK"
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                              />
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Color Name & Hex</label>
                              <div className="flex gap-2">
                                <input
                                  type="text"
                                  value={variant.color}
                                  onChange={(e) => handleUpdateVariant(index, 'color', e.target.value)}
                                  placeholder="Titanium Gray"
                                  className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                                />
                                <input
                                  type="color"
                                  value={variant.color_hex || '#1e293b'}
                                  onChange={(e) => handleUpdateVariant(index, 'color_hex', e.target.value)}
                                  className="w-8 h-8 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer shrink-0 p-0.5"
                                  title="Color swatch picker"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Price ($) *</label>
                              <input
                                type="number"
                                step="0.01"
                                required
                                value={variant.price}
                                onChange={(e) => handleUpdateVariant(index, 'price', e.target.value)}
                                placeholder="999.00"
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Sale Price ($)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={variant.sale_price}
                                onChange={(e) => handleUpdateVariant(index, 'sale_price', e.target.value)}
                                placeholder="949.00"
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Stock Units *</label>
                              <input
                                type="number"
                                required
                                min="0"
                                value={variant.stock}
                                onChange={(e) => handleUpdateVariant(index, 'stock', Number(e.target.value))}
                                className="w-full px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-bold"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB 4: TECHNICAL SPECIFICATIONS */}
                {activeTab === 'specs' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">Smartphone Technical Specs</h4>
                        <p className="text-[11px] text-slate-400">Add grouped specs like Display, Camera, Processor, and Battery.</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleInsertFlagshipTemplateSpecs}
                          className="px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/25 text-amber-400 hover:bg-amber-500 hover:text-black text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Insert Flagship Template</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleAddSpec}
                          className="px-3 py-1.5 rounded-xl bg-blue-600/20 border border-blue-500/30 text-blue-400 hover:bg-blue-600 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Spec Row</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {formSpecs.length === 0 ? (
                        <div className="p-8 text-center bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-400 text-xs">
                          No specifications defined yet. Click "Insert Flagship Template" above to instantly populate all smartphone specs!
                        </div>
                      ) : (
                        formSpecs.map((spec, index) => (
                          <div key={index} className="flex items-center gap-2 p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                            <input
                              type="text"
                              value={spec.group_name}
                              onChange={(e) => handleUpdateSpec(index, 'group_name', e.target.value)}
                              placeholder="Group (e.g. Display)"
                              className="w-32 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-blue-400 font-semibold"
                            />
                            <input
                              type="text"
                              value={spec.name}
                              onChange={(e) => handleUpdateSpec(index, 'name', e.target.value)}
                              placeholder="Spec Name (e.g. Main Camera)"
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white"
                            />
                            <input
                              type="text"
                              value={spec.value}
                              onChange={(e) => handleUpdateSpec(index, 'value', e.target.value)}
                              placeholder="Value (e.g. 200MP OIS)"
                              className="flex-1 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-white font-medium"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveSpec(index)}
                              className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}

                {/* TAB 5: PHOTOS & MEDIA GALLERY */}
                {activeTab === 'media' && (
                  <div className="space-y-5 animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider">Smartphone Image Gallery</h4>
                      <p className="text-[11px] text-slate-400">Upload new images, enter an image URL, or pick from our studio smartphone photos library.</p>
                    </div>

                    {/* Image Upload & URL input */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Direct Upload Box */}
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                            <Upload className="w-3.5 h-3.5 text-blue-400" /> Upload from Computer
                          </p>
                          <p className="text-[11px] text-slate-400 mb-3">Supported formats: JPG, PNG, WEBP, SVG (up to 5MB).</p>
                        </div>

                        <div>
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className="hidden"
                            id="product-file-upload"
                          />
                          <label
                            htmlFor="product-file-upload"
                            className={`w-full py-2.5 px-4 rounded-xl border border-dashed border-slate-700 hover:border-blue-500 text-xs font-bold text-center block cursor-pointer transition-all ${
                              isUploadingImage ? 'bg-blue-600/10 text-blue-400' : 'bg-slate-900 text-slate-300 hover:text-white'
                            }`}
                          >
                            {isUploadingImage ? 'Uploading image to server...' : 'Choose Image File'}
                          </label>
                        </div>
                      </div>

                      {/* URL Adder */}
                      <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-1.5 mb-1">
                            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" /> Add by URL or Path
                          </p>
                          <p className="text-[11px] text-slate-400 mb-3">e.g. /images/products/samsung-s25-ultra.jpg</p>
                        </div>

                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={newImageUrl}
                            onChange={(e) => setNewImageUrl(e.target.value)}
                            placeholder="/images/products/phone.jpg"
                            className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                          />
                          <button
                            type="button"
                            onClick={handleAddImageUrl}
                            className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shrink-0"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Flagship Preset Library Picker */}
                    <div className="space-y-2">
                      <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Or Quick-Pick Authentic Studio Smartphone Photo:</p>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                        {PRESET_GALLERY_IMAGES.map((preset, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => {
                              setFormImages((prev) => [
                                ...prev,
                                { image_path: preset.path, is_primary: prev.length === 0 }
                              ]);
                            }}
                            className="p-2 rounded-xl bg-slate-950/60 border border-slate-800/80 hover:border-blue-500/50 text-left transition-all group flex items-center gap-2"
                          >
                            <img src={preset.path} alt="" className="w-8 h-8 rounded-lg object-contain bg-slate-900 p-0.5 shrink-0" />
                            <span className="text-[10px] text-slate-300 group-hover:text-white truncate font-medium">{preset.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Attached Images Grid */}
                    <div className="space-y-2 pt-2 border-t border-slate-800">
                      <p className="text-xs font-bold text-white">Attached Product Images ({formImages.length})</p>
                      {formImages.length === 0 ? (
                        <p className="text-xs text-slate-500">No images attached yet.</p>
                      ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {formImages.map((img, i) => (
                            <div
                              key={i}
                              className={`relative rounded-2xl bg-slate-950 border p-2 flex flex-col items-center justify-between group ${
                                img.is_primary ? 'border-blue-500 shadow-md shadow-blue-500/20' : 'border-slate-800'
                              }`}
                            >
                              <div className="aspect-square w-full rounded-xl overflow-hidden bg-slate-900/50 p-2 flex items-center justify-center mb-2">
                                <img src={getImageUrl(img.image_path)} alt="" className="max-h-full max-w-full object-contain" />
                              </div>

                              <div className="w-full flex items-center justify-between gap-1 pt-1 border-t border-slate-800/60">
                                <button
                                  type="button"
                                  onClick={() => handleSetPrimaryImage(i)}
                                  className={`px-2 py-1 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-all ${
                                    img.is_primary ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                                  }`}
                                >
                                  <Star className={`w-3 h-3 ${img.is_primary ? 'fill-current text-amber-300' : ''}`} />
                                  <span>{img.is_primary ? 'Primary' : 'Set Primary'}</span>
                                </button>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveImage(i)}
                                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                                  title="Delete Image"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Modal Footer Controls */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                  >
                    Cancel
                  </button>

                  <div className="flex items-center gap-2">
                    {activeTab !== 'media' && (
                      <button
                        type="button"
                        onClick={() => {
                          if (activeTab === 'basic') setActiveTab('description');
                          else if (activeTab === 'description') setActiveTab('variants');
                          else if (activeTab === 'variants') setActiveTab('specs');
                          else if (activeTab === 'specs') setActiveTab('media');
                        }}
                        className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                      >
                        Next Tab →
                      </button>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          <span>Saving...</span>
                        </>
                      ) : (
                        <span>{isEditing ? 'Update Smartphone' : 'Publish Smartphone'}</span>
                      )}
                    </button>
                  </div>
                </div>

              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
