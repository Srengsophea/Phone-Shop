import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Heart,
  Truck,
  ShieldCheck,
  RefreshCw,
  Share2,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import api from '../api/axios';
import { Product, ProductVariant, Review } from '../types';
import { formatPrice, formatDate, getImageUrl } from '../utils/formatters';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';
import { BrandLogo } from '../components/BrandLogo';

export const ProductDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { addItem, isLoading: isCartLoading } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated } = useAuthStore();

  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews'>('specs');
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal state
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewFeedback, setReviewFeedback] = useState<string | null>(null);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/products/${slug}`);
        const p: Product = response.data.data;
        setProduct(p);

        if (p.variants && p.variants.length > 0) {
          setSelectedVariant(p.variants[0]);
        }

        const primary = p.images?.find((img) => img.is_primary)?.image_path || p.images?.[0]?.image_path;
        setSelectedImage(primary || '');
      } catch (err) {
        console.error('Error fetching product details', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-slate-400">Loading smartphone specifications...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Smartphone not found</h2>
        <Link to="/products" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Back to Catalog
        </Link>
      </div>
    );
  }

  const isFavorite = isInWishlist(product.id);
  const activeVariant = selectedVariant || product.variants?.[0];
  const price = activeVariant?.sale_price ?? activeVariant?.price ?? product.sale_price ?? product.base_price;
  const originalPrice = (activeVariant?.sale_price ? activeVariant.price : null) || product.base_price;
  const hasDiscount = originalPrice && price < originalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const stockAvailable = activeVariant?.stock ?? 10;

  const handleAddToCart = async () => {
    await addItem(product.id, activeVariant?.id || null, quantity);
  };

  const handleBuyNow = async () => {
    await addItem(product.id, activeVariant?.id || null, quantity);
    navigate('/checkout');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: product.name, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Product link copied to clipboard!');
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewSubmitting(true);
    setReviewFeedback(null);
    try {
      await api.post('/reviews', {
        product_id: product.id,
        rating: reviewRating,
        title: reviewTitle,
        comment: reviewComment,
      });
      setReviewFeedback('Review submitted successfully!');
      setTimeout(() => {
        setIsReviewModalOpen(false);
        setReviewFeedback(null);
        // Refresh product
        window.location.reload();
      }, 1200);
    } catch (err: any) {
      setReviewFeedback(err.response?.data?.message || 'Review submission failed.');
    } finally {
      setReviewSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-xs text-slate-400">
        <Link to="/" className="hover:text-blue-400">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to="/products" className="hover:text-blue-400">Phones</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link to={`/products?brand=${product.brand?.slug}`} className="hover:text-blue-400">{product.brand?.name}</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-slate-200 font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square max-w-lg mx-auto rounded-3xl bg-slate-900/60 p-3 sm:p-4 flex items-center justify-center border border-slate-800 shadow-2xl overflow-hidden group">
            <img
              src={getImageUrl(selectedImage || product.images?.[0]?.image_path)}
              alt={product.name}
              className="w-full h-full object-cover rounded-2xl group-hover:scale-105 transition-transform duration-500"
            />
            {hasDiscount && (
              <span className="absolute top-5 left-5 px-3 py-1 rounded-xl bg-rose-500 text-white text-xs font-bold shadow-lg shadow-rose-500/25">
                -{discountPercent}% OFF
              </span>
            )}
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_path)}
                  className={`w-20 h-20 rounded-2xl p-2 bg-slate-900/80 border transition-all shrink-0 ${
                    selectedImage === img.image_path ? 'border-blue-500 shadow-md shadow-blue-500/20' : 'border-slate-800'
                  }`}
                >
                  <img
                    src={getImageUrl(img.image_path)}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buying Controls & Info */}
        <div className="lg:col-span-6 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {product.brand && (
                  <BrandLogo name={product.brand.name} slug={product.brand.slug} className="w-6 h-6 !rounded-lg" />
                )}
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400">
                  {product.brand?.name} Flagship
                </span>
              </div>
              <button
                onClick={handleShare}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
                title="Share product"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {product.name}
            </h1>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span>{product.rating_cache ? Number(product.rating_cache).toFixed(1) : '4.9'}</span>
              </div>
              <span className="text-xs text-slate-400">
                Based on <strong>{product.reviews_count || 32}</strong> verified reviews
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-xs text-slate-400 font-mono">SKU: {activeVariant?.sku || product.sku}</span>
            </div>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80 flex items-baseline justify-between">
            <div>
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-white">
                  {formatPrice(price)}
                </span>
                {hasDiscount && (
                  <span className="text-base text-slate-500 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> In Stock & Ready for Immediate Delivery ({stockAvailable} units)
              </p>
            </div>

            {hasDiscount && (
              <span className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                Save {formatPrice(originalPrice - price)}
              </span>
            )}
          </div>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-4 pt-2">
              {/* Storage options */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                  Select Storage & Edition
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {product.variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariant(v)}
                      className={`p-3 rounded-2xl border text-left transition-all ${
                        activeVariant?.id === v.id
                          ? 'bg-blue-600/15 border-blue-500 shadow-md shadow-blue-500/10'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <p className="text-xs font-bold text-white">{v.storage || v.name}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{formatPrice(v.sale_price ?? v.price)}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color swatches */}
              {activeVariant?.color && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Color: <span className="text-white font-medium">{activeVariant.color}</span>
                  </label>
                  <div className="flex gap-2.5">
                    {product.variants.map((v) => (
                      <button
                        key={v.id}
                        onClick={() => setSelectedVariant(v)}
                        className={`w-9 h-9 rounded-full border-2 transition-all flex items-center justify-center p-0.5 ${
                          activeVariant?.id === v.id ? 'border-blue-500 scale-110' : 'border-slate-800'
                        }`}
                        title={v.color || v.name}
                      >
                        <span
                          className="w-full h-full rounded-full"
                          style={{ backgroundColor: v.color_hex || '#334155' }}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-slate-800 rounded-2xl bg-slate-900 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1.5 text-slate-400 hover:text-white font-bold"
                >
                  -
                </button>
                <span className="px-4 text-sm font-semibold text-white font-mono">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(stockAvailable, quantity + 1))}
                  className="px-3.5 py-1.5 text-slate-400 hover:text-white font-bold"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isCartLoading || stockAvailable <= 0}
                className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-sm font-bold shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Shopping Cart</span>
              </button>

              <button
                onClick={() => toggleWishlist(product.id)}
                className={`p-4 rounded-2xl border transition-all ${
                  isFavorite
                    ? 'bg-rose-500 text-white border-rose-500 shadow-lg shadow-rose-500/25'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Save to wishlist"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={isCartLoading || stockAvailable <= 0}
              className="w-full py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white text-xs font-bold transition-all"
            >
              Buy Now with 1-Click Checkout
            </button>
          </div>

          {/* Warranty & Delivery Assurance */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
            <div className="space-y-1">
              <Truck className="w-5 h-5 text-blue-400 mx-auto" />
              <p className="font-semibold text-slate-200">Express Delivery</p>
              <p className="text-[10px]">Nationwide in 24h</p>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
              <p className="font-semibold text-slate-200">Official Warranty</p>
              <p className="text-[10px]">1 Year Local Service</p>
            </div>
            <div className="space-y-1">
              <RefreshCw className="w-5 h-5 text-amber-400 mx-auto" />
              <p className="font-semibold text-slate-200">7-Day Swap</p>
              <p className="text-[10px]">Defect Replacement</p>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs: Technical Specifications & Verified Customer Reviews */}
      <div className="pt-8 border-t border-slate-900">
        <div className="flex border-b border-slate-800 gap-8">
          <button
            onClick={() => setActiveTab('specs')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors ${
              activeTab === 'specs'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            Technical Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`pb-4 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'reviews'
                ? 'border-blue-500 text-blue-400'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <span>Customer Reviews</span>
            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs">
              {product.reviews?.length || 0}
            </span>
          </button>
        </div>

        {/* Tab 1: Specifications */}
        {activeTab === 'specs' && (
          <div className="py-8">
            <div className="rounded-3xl bg-slate-900/40 border border-slate-800/80 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-white mb-6">Full Hardware Specifications</h3>
              
              {product.specifications && product.specifications.length > 0 ? (
                <div className="divide-y divide-slate-800/80">
                  {product.specifications.map((spec: any, idx: number) => (
                    <div key={spec.id || spec.name || idx} className="py-3.5 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                      <div className="font-bold text-slate-400">{spec.name}</div>
                      <div className="sm:col-span-2 text-slate-200 font-medium">{spec.value}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400">Specifications details available upon request.</p>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Reviews */}
        {activeTab === 'reviews' && (
          <div className="py-8 space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Verified Customer Reviews</h3>
                <p className="text-xs text-slate-400">Reviews from verified purchasers</p>
              </div>

              {isAuthenticated && (
                <button
                  onClick={() => setIsReviewModalOpen(true)}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
                >
                  Write a Review
                </button>
              )}
            </div>

            {product.reviews && product.reviews.length > 0 ? (
              <div className="space-y-4">
                {product.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-xs">
                          {rev.user?.name ? rev.user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white flex items-center gap-2">
                            {rev.user?.name || 'Customer'}
                            {rev.is_verified_purchase && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-semibold">
                                Verified Purchase
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500">{formatDate(rev.created_at)}</p>
                        </div>
                      </div>

                      <div className="flex items-center text-amber-400">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-current" />
                        ))}
                      </div>
                    </div>

                    <h4 className="text-sm font-semibold text-slate-100">{rev.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{rev.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-12 rounded-3xl bg-slate-900/30 border border-slate-800 text-center space-y-2">
                <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
                <h4 className="text-sm font-semibold text-white">No reviews yet</h4>
                <p className="text-xs text-slate-400">Be the first to review this smartphone after purchasing.</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Review Modal Form */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div onClick={() => setIsReviewModalOpen(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

            <div className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl z-10 space-y-4">
              <h3 className="text-lg font-bold text-white">Write Review for {product.name}</h3>

              {reviewFeedback && (
                <p className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                  {reviewFeedback}
                </p>
              )}

              <form onSubmit={handleReviewSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Your Rating</label>
                  <div className="flex gap-2 text-amber-400 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1"
                      >
                        <Star className={`w-6 h-6 ${star <= reviewRating ? 'fill-current' : 'text-slate-600'}`} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Review Headline</label>
                  <input
                    type="text"
                    required
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    placeholder="e.g. Unbelievable battery life and camera!"
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Review Comments</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Share details about performance, delivery speed, and overall satisfaction..."
                    className="w-full px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={reviewSubmitting}
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 disabled:opacity-50"
                  >
                    {reviewSubmitting ? 'Submitting...' : 'Submit Review'}
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
