import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Star, Eye } from 'lucide-react';
import { Product } from '../types';
import { formatPrice, getImageUrl } from '../utils/formatters';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';

interface ProductCardProps {
  product: Product;
  onQuickView?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onQuickView }) => {
  const { addItem, isLoading: isCartLoading } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const isFavorite = isInWishlist(product.id);
  const primaryImage = product.images?.find((img) => img.is_primary)?.image_path || product.images?.[0]?.image_path;

  // Variant options preview
  const defaultVariant = product.variants?.[0];
  const currentPrice = defaultVariant?.sale_price || defaultVariant?.price || product.sale_price || product.base_price;
  const originalPrice = (defaultVariant?.sale_price ? defaultVariant.price : null) || product.base_price;
  const hasDiscount = originalPrice && currentPrice < originalPrice;
  const discountPercent = hasDiscount ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await addItem(product.id, defaultVariant?.id || null, 1);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product.id);
  };

  return (
    <div className="group relative rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-blue-500/40 hover:shadow-xl hover:shadow-blue-500/10 transition-all duration-300 flex flex-col overflow-hidden">
      
      {/* Top badges & Wishlist */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-950/60 flex items-center justify-center p-2.5 sm:p-3">
        <Link to={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center overflow-hidden rounded-xl">
          <img
            src={getImageUrl(primaryImage)}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </Link>

        {/* Badges Container */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 pointer-events-none">
          {hasDiscount && (
            <span className="px-2 py-0.5 rounded-md bg-rose-500 text-white text-xs font-bold shadow-md shadow-rose-500/25">
              -{discountPercent}%
            </span>
          )}
          {product.is_featured && (
            <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white text-[11px] font-semibold tracking-wide">
              FEATURED
            </span>
          )}
          {product.is_bestseller && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-black text-[11px] font-bold">
              BESTSELLER
            </span>
          )}
        </div>

        {/* Action Buttons: Wishlist & Quick View */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <button
            onClick={handleToggleWishlist}
            className={`p-2 rounded-xl transition-all shadow-md ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-rose-500/30'
                : 'bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
          </button>

          {onQuickView && (
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onQuickView(product);
              }}
              className="p-2 rounded-xl bg-slate-900/80 backdrop-blur-md text-slate-400 hover:text-white hover:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
              title="Quick view"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Details Body */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Stock */}
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
            <span className="font-medium uppercase tracking-wider text-blue-400">
              {product.brand?.name || 'Flagship'}
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              In Stock
            </span>
          </div>

          {/* Title */}
          <Link to={`/products/${product.slug}`} className="block group-hover:text-blue-400 transition-colors">
            <h3 className="font-semibold text-slate-100 text-base leading-snug line-clamp-1">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1.5 mt-2">
            <div className="flex items-center text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="text-xs font-semibold text-slate-200">
              {product.rating_cache ? Number(product.rating_cache).toFixed(1) : '4.9'}
            </span>
            <span className="text-xs text-slate-400">
              ({product.reviews_count || 18})
            </span>
          </div>

          {/* Quick Specs / Storage Pills */}
          {product.variants && product.variants.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.variants.slice(0, 3).map((v) => (
                <span
                  key={v.id}
                  className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                >
                  {v.storage || v.name}
                </span>
              ))}
              {product.variants.length > 3 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                  +{product.variants.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-white tracking-tight">
                {formatPrice(currentPrice)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-400">Official Warranty</span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isCartLoading}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-semibold shadow-md shadow-blue-500/20 transition-all"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>

      </div>
    </div>
  );
};
