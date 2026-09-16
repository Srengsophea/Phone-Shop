import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Trash2, Plus, Minus, ArrowRight, Tag, CheckCircle2 } from 'lucide-react';
import { useCartStore } from '../stores/cartStore';
import { formatPrice, getImageUrl } from '../utils/formatters';

export const CartDrawer: React.FC = () => {
  const navigate = useNavigate();
  const {
    cart,
    isCartOpen,
    toggleCart,
    updateQuantity,
    removeItem,
    applyCoupon,
    removeCoupon,
    couponError,
    isLoading
  } = useCartStore();

  const [couponInput, setCouponInput] = useState('');

  if (!isCartOpen) return null;

  const totalCount = cart.items.reduce((sum, item) => sum + item.quantity, 0);
  const freeShippingThreshold = 500;
  const progressToFreeShipping = Math.min(100, Math.round((cart.subtotal / freeShippingThreshold) * 100));
  const amountNeeded = Math.max(0, freeShippingThreshold - cart.subtotal);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput.trim());
    if (res.success) {
      setCouponInput('');
    }
  };

  const handleCheckoutClick = () => {
    toggleCart(false);
    navigate('/checkout');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        onClick={() => toggleCart(false)}
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col justify-between">
          
          {/* Drawer Header */}
          <div className="p-6 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-white">Your Cart ({totalCount})</h2>
            </div>
            <button
              onClick={() => toggleCart(false)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress */}
          <div className="px-6 py-3 bg-slate-950/60 border-b border-slate-800/80">
            <div className="flex justify-between text-xs mb-1.5">
              {amountNeeded > 0 ? (
                <span className="text-slate-300">
                  Add <strong className="text-blue-400">{formatPrice(amountNeeded)}</strong> for Free Express Delivery
                </span>
              ) : (
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Free Express Delivery unlocked!
                </span>
              )}
              <span className="text-slate-500 font-mono text-[11px]">{progressToFreeShipping}%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-emerald-500 transition-all duration-500"
                style={{ width: `${progressToFreeShipping}%` }}
              />
            </div>
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {cart.items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-4">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-white">Your cart is empty</h3>
                <p className="text-xs text-slate-400 mt-1 max-w-xs">
                  Browse our flagship phones and exclusive promotions to add items.
                </p>
                <button
                  onClick={() => {
                    toggleCart(false);
                    navigate('/products');
                  }}
                  className="mt-6 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-500/20"
                >
                  Explore Phones
                </button>
              </div>
            ) : (
              cart.items.map((item) => {
                const img = item.product?.images?.[0]?.image_path;
                return (
                  <div
                    key={item.id}
                    className="flex gap-4 p-3 rounded-2xl bg-slate-950/40 border border-slate-800/80"
                  >
                    {/* Item Image */}
                    <div className="w-20 h-20 rounded-xl bg-slate-900 p-2 flex items-center justify-center shrink-0 border border-slate-800">
                      <img
                        src={getImageUrl(img)}
                        alt={item.product?.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <h4 className="text-sm font-semibold text-white line-clamp-1">
                          {item.product?.name}
                        </h4>
                        {item.variant && (
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            {item.variant.color && <span className="mr-1.5">{item.variant.color}</span>}
                            {item.variant.storage && <span>{item.variant.storage}</span>}
                          </p>
                        )}
                        <p className="text-xs font-bold text-blue-400 mt-1">
                          {formatPrice(item.unit_price)}
                        </p>
                      </div>

                      {/* Quantity Selector & Remove */}
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 border border-slate-800 rounded-lg p-0.5 bg-slate-900">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                            disabled={isLoading}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-semibold text-white px-2 font-mono">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-slate-400 hover:text-white rounded"
                            disabled={isLoading}
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Drawer Footer: Coupon & Totals */}
          {cart.items.length > 0 && (
            <div className="p-6 border-t border-slate-800 bg-slate-950/60 space-y-4">
              
              {/* Coupon Form */}
              {cart.coupon ? (
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    <span>Coupon <strong>{cart.coupon.code}</strong> applied (-{formatPrice(cart.coupon.discount_amount)})</span>
                  </div>
                  <button
                    onClick={() => removeCoupon()}
                    className="text-slate-400 hover:text-rose-400 text-[11px] underline"
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <form onSubmit={handleApplyCoupon} className="space-y-1">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      placeholder="Discount Code (e.g. WELCOME10)"
                      className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 uppercase font-mono"
                    />
                    <button
                      type="submit"
                      disabled={isLoading || !couponInput.trim()}
                      className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white disabled:opacity-50"
                    >
                      Apply
                    </button>
                  </div>
                  {couponError && <p className="text-[11px] text-rose-400 mt-1">{couponError}</p>}
                </form>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white font-medium">{formatPrice(cart.subtotal)}</span>
                </div>
                {cart.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount</span>
                    <span>-{formatPrice(cart.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Estimated Shipping</span>
                  <span className="text-white font-medium">
                    {cart.shipping_fee === 0 ? 'FREE' : formatPrice(cart.shipping_fee)}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800/80 text-sm font-bold text-white">
                  <span>Total</span>
                  <span className="text-base text-blue-400 font-extrabold">{formatPrice(cart.total_amount)}</span>
                </div>
              </div>

              {/* Checkout CTA */}
              <button
                onClick={handleCheckoutClick}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-lg shadow-blue-500/25 transition-all"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
