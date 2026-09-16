import React, { useState } from 'react';
import { X, Star, ShoppingBag, Heart, Check, ShieldCheck } from 'lucide-react';
import { Product, ProductVariant } from '../types';
import { formatPrice, getImageUrl } from '../utils/formatters';
import { useCartStore } from '../stores/cartStore';
import { useWishlistStore } from '../stores/wishlistStore';
import { useAuthStore } from '../stores/authStore';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
}

export const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, onClose }) => {
  const { addItem, isLoading } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { isAuthenticated, openAuthModal } = useAuthStore();

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product?.variants?.[0] || null
  );
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const isFavorite = isInWishlist(product.id);
  const activeVariant = selectedVariant || product.variants?.[0];
  const price = activeVariant?.sale_price ?? activeVariant?.price ?? product.sale_price ?? product.base_price;
  const originalPrice = (activeVariant?.sale_price ? activeVariant.price : null) || product.base_price;
  const hasDiscount = originalPrice && price < originalPrice;
  const primaryImage = product.images?.[0]?.image_path;

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      onClose();
      openAuthModal('Please sign in to add phones to your cart.');
      return;
    }
    await addItem(product.id, activeVariant?.id || null, quantity);
    onClose();
  };

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      onClose();
      openAuthModal('Please sign in to save phones to your wishlist.');
      return;
    }
    await toggleWishlist(product.id);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div onClick={onClose} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

        <div className="relative w-full max-w-3xl rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl z-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Product Image */}
          <div className="aspect-square rounded-2xl bg-slate-950/60 p-2 sm:p-3 flex items-center justify-center border border-slate-800 overflow-hidden">
            <img
              src={getImageUrl(primaryImage)}
              alt={product.name}
              className="w-full h-full object-cover rounded-xl"
            />
          </div>

          {/* Right: Details */}
          <div className="flex flex-col justify-between">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                  {product.brand?.name}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-white mt-1">
                  {product.name}
                </h2>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex items-center text-amber-400">
                    <Star className="w-4 h-4 fill-current" />
                  </div>
                  <span className="text-sm font-semibold text-slate-200">
                    {product.rating_cache ? Number(product.rating_cache).toFixed(1) : '4.9'}
                  </span>
                  <span className="text-xs text-slate-400">
                    ({product.reviews_count || 24} reviews)
                  </span>
                </div>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2 pt-2 border-t border-slate-800/80">
                <span className="text-2xl font-extrabold text-white">
                  {formatPrice(price)}
                </span>
                {hasDiscount && (
                  <span className="text-sm text-slate-400 line-through">
                    {formatPrice(originalPrice)}
                  </span>
                )}
              </div>

              {/* Description */}
              <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                {product.short_description || product.description}
              </p>

              {/* Variant selector */}
              {product.variants && product.variants.length > 0 && (
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-2">
                    Select Edition / Storage
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant.id}
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          activeVariant?.id === variant.id
                            ? 'bg-blue-600/20 border-blue-500 text-blue-400'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                        }`}
                      >
                        {variant.storage || variant.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-6 border-t border-slate-800/80 flex items-center gap-3">
              <div className="flex items-center border border-slate-800 rounded-xl bg-slate-950 p-1">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-2.5 py-1 text-slate-400 hover:text-white font-bold text-sm"
                >
                  -
                </button>
                <span className="px-3 text-xs font-semibold text-white">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-2.5 py-1 text-slate-400 hover:text-white font-bold text-sm"
                >
                  +
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isLoading}
                className="flex-1 py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={handleToggleWishlist}
                className={`p-3 rounded-xl border transition-all ${
                  isFavorite
                    ? 'bg-rose-500 text-white border-rose-500'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
