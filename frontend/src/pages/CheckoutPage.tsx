import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  CheckCircle2,
  CreditCard,
  Building,
  Banknote,
  Truck,
  ArrowRight,
  ArrowLeft,
  QrCode,
  AlertCircle
} from 'lucide-react';
import api from '../api/axios';
import { useCartStore } from '../stores/cartStore';
import { useAuthStore } from '../stores/authStore';
import { formatPrice, getImageUrl } from '../utils/formatters';

export const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { cart, fetchCart, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();

  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Address fields (Cambodia-friendly + international support)
  const [shippingAddress, setShippingAddress] = useState({
    full_name: user?.name || '',
    phone: user?.phone || '',
    address_line_1: '',
    address_line_2: '',
    village: 'Phum 3',
    commune: 'Tonle Bassac',
    district: 'Chamkar Mon',
    province: 'Phnom Penh',
    country: 'Cambodia',
    delivery_notes: '',
  });

  // Shipping & Payment selections
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express' | 'pickup'>('standard');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bank_transfer' | 'stripe'>('cod');
  const [cardData, setCardData] = useState({
    cardholder: '',
    card_number: '',
    expiry: '',
    cvc: '',
  });

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  useEffect(() => {
    if (user) {
      setShippingAddress((prev) => ({
        ...prev,
        full_name: user.name,
        phone: user.phone || prev.phone,
      }));
    }
  }, [user]);

  if (cart.items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Your cart is empty</h2>
        <p className="text-xs text-slate-400">Add smartphones to your cart before proceeding to checkout.</p>
        <Link to="/products" className="inline-block px-6 py-3 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Explore Phones
        </Link>
      </div>
    );
  }

  const shippingCost = shippingMethod === 'express' ? 25 : (cart.subtotal >= 500 ? 0 : 15);
  const grandTotal = Math.max(0, cart.subtotal - cart.discount_amount + shippingCost);

  const handlePlaceOrder = async () => {
    if (!isAuthenticated) {
      setErrorMessage('Please sign in to complete your checkout.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const payload = {
        shipping_address: shippingAddress,
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        customer_notes: shippingAddress.delivery_notes,
        payment_data: paymentMethod === 'stripe' ? {
          card_brand: 'visa',
          card_last4: cardData.card_number.slice(-4) || '4242',
        } : {},
      };

      const response = await api.post('/checkout', payload);
      const { order } = response.data.data;

      // Navigate to order confirmation and live tracking
      navigate(`/orders/track/${order.order_number}`);
    } catch (err: any) {
      setErrorMessage(err.response?.data?.message || 'Checkout failed. Please check your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Checkout Steps Progress Header */}
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between relative">
          <div className="w-full absolute top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 -z-0" />
          
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              1
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Shipping</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              2
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Payment</span>
          </div>

          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs ${
              currentStep >= 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-slate-800 text-slate-400'
            }`}>
              3
            </div>
            <span className="text-[11px] font-semibold text-slate-300">Confirm</span>
          </div>
        </div>
      </div>

      {errorMessage && (
        <div className="max-w-3xl mx-auto p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Form & Summary Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* Left Form Area (Steps 1, 2, 3) */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* STEP 1: Shipping Address & Delivery Method */}
          {currentStep === 1 && (
            <div className="space-y-6 rounded-3xl bg-slate-900/50 p-6 sm:p-8 border border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Truck className="w-5 h-5 text-blue-500" />
                <span>Shipping & Delivery Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Recipient Full Name *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.full_name}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, full_name: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Contact Phone Number *</label>
                  <input
                    type="tel"
                    required
                    value={shippingAddress.phone}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, phone: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Street Address / House No. *</label>
                  <input
                    type="text"
                    required
                    value={shippingAddress.address_line_1}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, address_line_1: e.target.value })}
                    placeholder="#123, Street 271"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                {/* Cambodia Structure Fields */}
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Province / City *</label>
                  <select
                    value={shippingAddress.province}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, province: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="Phnom Penh">Phnom Penh</option>
                    <option value="Siem Reap">Siem Reap</option>
                    <option value="Battambang">Battambang</option>
                    <option value="Sihanoukville">Sihanoukville</option>
                    <option value="Kampong Cham">Kampong Cham</option>
                    <option value="Kandal">Kandal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Khan / District</label>
                  <input
                    type="text"
                    value={shippingAddress.district}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, district: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Sangkat / Commune</label>
                  <input
                    type="text"
                    value={shippingAddress.commune}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, commune: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Phum / Village</label>
                  <input
                    type="text"
                    value={shippingAddress.village}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, village: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Special Delivery Instructions</label>
                  <textarea
                    rows={2}
                    value={shippingAddress.delivery_notes}
                    onChange={(e) => setShippingAddress({ ...shippingAddress, delivery_notes: e.target.value })}
                    placeholder="e.g. Call before delivery, deliver to security lobby..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>
              </div>

              {/* Shipping Speed Options */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">Delivery Method</h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div
                    onClick={() => setShippingMethod('standard')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'standard' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">Standard Delivery</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">2-3 Business Days</p>
                    <p className="text-xs font-semibold text-blue-400 mt-1">{cart.subtotal >= 500 ? 'FREE' : '$15.00'}</p>
                  </div>

                  <div
                    onClick={() => setShippingMethod('express')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'express' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">Same-Day Express</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Delivered in 4-6 Hours</p>
                    <p className="text-xs font-semibold text-blue-400 mt-1">$25.00</p>
                  </div>

                  <div
                    onClick={() => setShippingMethod('pickup')}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                      shippingMethod === 'pickup' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950 border-slate-800'
                    }`}
                  >
                    <p className="text-xs font-bold text-white">Store Pickup</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">Phnom Penh Flagship</p>
                    <p className="text-xs font-semibold text-emerald-400 mt-1">FREE</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!shippingAddress.full_name || !shippingAddress.phone || !shippingAddress.address_line_1}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 disabled:opacity-40"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Payment Gateway Selection */}
          {currentStep === 2 && (
            <div className="space-y-6 rounded-3xl bg-slate-900/50 p-6 sm:p-8 border border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" />
                <span>Select Payment Method</span>
              </h3>

              <div className="space-y-3">
                {/* Cash on Delivery */}
                <label
                  onClick={() => setPaymentMethod('cod')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'cod' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Banknote className="w-5 h-5 text-blue-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Cash on Delivery (COD)</p>
                      <p className="text-[11px] text-slate-400">Pay cash in USD upon receiving and inspecting device</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === 'cod'}
                    onChange={() => setPaymentMethod('cod')}
                    className="text-blue-600"
                  />
                </label>

                {/* ABA Bank KHQR Transfer */}
                <label
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'bank_transfer' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <QrCode className="w-5 h-5 text-emerald-400" />
                    <div>
                      <p className="text-xs font-bold text-white">ABA Bank / KHQR Instant Pay</p>
                      <p className="text-[11px] text-slate-400">Scan KHQR directly using any Cambodian Mobile Banking App</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === 'bank_transfer'}
                    onChange={() => setPaymentMethod('bank_transfer')}
                    className="text-blue-600"
                  />
                </label>

                {/* Stripe Card */}
                <label
                  onClick={() => setPaymentMethod('stripe')}
                  className={`p-4 rounded-2xl border flex items-center justify-between cursor-pointer transition-all ${
                    paymentMethod === 'stripe' ? 'bg-blue-600/15 border-blue-500' : 'bg-slate-950 border-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    <div>
                      <p className="text-xs font-bold text-white">Credit / Debit Card (Stripe Gateway)</p>
                      <p className="text-[11px] text-slate-400">Encrypted Visa, MasterCard, UnionPay</p>
                    </div>
                  </div>
                  <input
                    type="radio"
                    name="payment_choice"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="text-blue-600"
                  />
                </label>
              </div>

              {/* Conditional KHQR Preview Box */}
              {paymentMethod === 'bank_transfer' && (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-slate-300 space-y-2">
                  <p className="font-bold text-emerald-400">KHQR Bank Transfer Instructions:</p>
                  <p>Upon clicking Complete Order, a unique dynamic KHQR code with reference number will be generated for instant transfer verification.</p>
                </div>
              )}

              {/* Conditional Card Form */}
              {paymentMethod === 'stripe' && (
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Cardholder Name</label>
                    <input
                      type="text"
                      placeholder="JOHN DOE"
                      value={cardData.cardholder}
                      onChange={(e) => setCardData({ ...cardData, cardholder: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-400 mb-1">Card Number</label>
                    <input
                      type="text"
                      placeholder="4242 •••• •••• 4242"
                      value={cardData.card_number}
                      onChange={(e) => setCardData({ ...cardData, card_number: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">Expires (MM/YY)</label>
                      <input
                        type="text"
                        placeholder="12/28"
                        value={cardData.expiry}
                        onChange={(e) => setCardData({ ...cardData, expiry: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-400 mb-1">CVC Security Code</label>
                      <input
                        type="text"
                        placeholder="123"
                        value={cardData.cvc}
                        onChange={(e) => setCardData({ ...cardData, cvc: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Shipping</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2"
                >
                  <span>Review Order</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Review & Final Confirmation */}
          {currentStep === 3 && (
            <div className="space-y-6 rounded-3xl bg-slate-900/50 p-6 sm:p-8 border border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span>Confirm Your Order</span>
              </h3>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Deliver To:</span>
                  <strong>{shippingAddress.full_name} ({shippingAddress.phone})</strong>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Address:</span>
                  <span>{shippingAddress.address_line_1}, {shippingAddress.commune}, {shippingAddress.district}, {shippingAddress.province}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Delivery Speed:</span>
                  <span className="uppercase font-semibold text-blue-400">{shippingMethod}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span className="text-slate-500">Payment Method:</span>
                  <span className="uppercase font-semibold text-emerald-400">{paymentMethod}</span>
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="px-5 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold flex items-center gap-1.5"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Payment</span>
                </button>

                <button
                  type="button"
                  onClick={handlePlaceOrder}
                  disabled={isSubmitting}
                  className="px-8 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold shadow-xl shadow-blue-500/25 flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? 'Placing Order...' : `Place Order (${formatPrice(grandTotal)})`}
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Order Summary Card */}
        <div className="lg:col-span-5 rounded-3xl bg-slate-900/60 border border-slate-800 p-6 space-y-6">
          <h3 className="text-base font-bold text-white">Order Summary ({cart.items.length} Items)</h3>

          <div className="divide-y divide-slate-800/80 max-h-80 overflow-y-auto pr-2 space-y-3">
            {cart.items.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0 flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-slate-950 p-1.5 border border-slate-800 shrink-0 flex items-center justify-center">
                  <img
                    src={getImageUrl(item.product?.images?.[0]?.image_path)}
                    alt=""
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
                <div className="flex-1 text-xs">
                  <p className="font-bold text-white line-clamp-1">{item.product?.name}</p>
                  <p className="text-slate-400 text-[11px]">{item.variant?.storage || item.variant?.name || 'Standard'}</p>
                  <p className="text-slate-300 font-mono mt-0.5">{item.quantity} × {formatPrice(item.unit_price)}</p>
                </div>
                <span className="text-xs font-bold text-white">{formatPrice(item.subtotal)}</span>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white font-medium">{formatPrice(cart.subtotal)}</span>
            </div>
            {cart.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({cart.coupon?.code})</span>
                <span>-{formatPrice(cart.discount_amount)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Shipping ({shippingMethod})</span>
              <span className="text-white font-medium">
                {shippingCost === 0 ? 'FREE' : formatPrice(shippingCost)}
              </span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800 text-sm font-bold text-white">
              <span>Grand Total</span>
              <span className="text-base text-blue-400 font-extrabold">{formatPrice(grandTotal)}</span>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Safe & Secure Checkout</span>
            </div>
            <p>1-year official brand warranty and free return guarantee included.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
