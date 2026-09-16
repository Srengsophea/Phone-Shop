import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag, Trash2, Smartphone } from 'lucide-react';
import { useWishlistStore } from '../stores/wishlistStore';
import { useCartStore } from '../stores/cartStore';
import { formatPrice, getImageUrl } from '../utils/formatters';

export const WishlistPage: React.FC = () => {
  const { items, fetchWishlist, toggleWishlist, isLoading } = useWishlistStore();
  const { addItem } = useCartStore();

  useEffect(() => {
    fetchWishlist();
  }, [fetchWishlist]);

  const handleMoveToCart = async (productId: number, variantId?: number | null) => {
    await addItem(productId, variantId, 1);
    await toggleWishlist(productId);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Heart className="w-7 h-7 text-rose-500 fill-current" />
          <span>My Saved Smartphones</span>
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Review saved products and transfer them directly into your shopping cart.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="p-16 rounded-3xl bg-slate-900/30 border border-slate-800 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-rose-400 mx-auto">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">Your wishlist is empty</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Browse our smartphone catalog and tap the heart icon on any device to save it for later.
          </p>
          <Link
            to="/products"
            className="inline-block px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold"
          >
            Explore Phones
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {items.map((item) => {
            const product = item.product;
            if (!product) return null;

            const primaryImage = product.images?.[0]?.image_path;
            const price = product.sale_price || product.base_price;

            return (
              <div
                key={item.id}
                className="rounded-3xl bg-slate-900/50 border border-slate-800 p-5 flex flex-col justify-between group hover:border-blue-500/40 transition-all"
              >
                <div>
                  <div className="aspect-[4/3] rounded-2xl bg-slate-950 p-4 flex items-center justify-center relative mb-4">
                    <img
                      src={getImageUrl(primaryImage)}
                      alt={product.name}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform"
                    />
                    <button
                      onClick={() => toggleWishlist(product.id)}
                      className="absolute top-3 right-3 p-2 rounded-xl bg-slate-900/80 text-rose-400 hover:bg-rose-500 hover:text-white transition-colors"
                      title="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                    {product.brand?.name}
                  </span>
                  <Link to={`/products/${product.slug}`}>
                    <h3 className="text-sm font-bold text-white line-clamp-1 hover:text-blue-400 transition-colors">
                      {product.name}
                    </h3>
                  </Link>
                  <p className="text-sm font-extrabold text-white mt-2">{formatPrice(price)}</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-800/80">
                  <button
                    onClick={() => handleMoveToCart(product.id, product.variants?.[0]?.id)}
                    className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
                  >
                    <ShoppingBag className="w-3.5 h-3.5" />
                    <span>Move to Cart</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
