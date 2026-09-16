import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  CreditCard,
  Printer,
  ChevronRight,
  ArrowRight,
  ShieldCheck,
  Search,
  Phone,
  Radio,
  BadgeCheck,
  AlertCircle,
  ExternalLink,
  Navigation
} from 'lucide-react';
import api from '../api/axios';
import { Order, OrderStatus } from '../types';
import { formatPrice, formatDate, getImageUrl } from '../utils/formatters';

const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Order Placed', desc: 'Received & awaiting verification' },
  { key: 'confirmed', label: 'Confirmed', desc: 'KHQR/Card payment verified' },
  { key: 'processing', label: 'IMEI Registered', desc: 'Quality inspected & IMEI logged' },
  { key: 'packed', label: 'Sealed & Packed', desc: 'Tamper-proof box with warranty' },
  { key: 'shipped', label: 'Dispatched', desc: 'Departed Phnom Penh Hub' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Courier rider en route to you' },
  { key: 'delivered', label: 'Delivered', desc: 'Handed over & warranty active' },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const navigate = useNavigate();

  const [order, setOrder] = useState<Order | null>(null);
  const [searchInput, setSearchInput] = useState(orderNumber || '');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Live courier simulation state
  const [simulatedMinutes, setSimulatedMinutes] = useState(22);

  const fetchOrder = async (num: string) => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const response = await api.get(`/orders/track/${num.trim()}`);
      setOrder(response.data.data);
    } catch (err: any) {
      console.error('Failed to fetch tracking details', err);
      setOrder(null);
      setErrorMsg(err.response?.data?.message || `Order #${num} not found. Please verify your order number.`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (orderNumber) {
      setSearchInput(orderNumber);
      fetchOrder(orderNumber);
    } else {
      // Default try the demo order
      fetchOrder('PH-2026-8891');
    }
  }, [orderNumber]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/track-order/${searchInput.trim()}`);
      fetchOrder(searchInput.trim());
    }
  };

  // Determine active step index
  const activeStepIndex = order ? statusSteps.findIndex((s) => s.key === order.status) : 0;
  const currentStep = activeStepIndex === -1 ? 0 : activeStepIndex;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Search Header Bar */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold mb-2">
              <Radio className="w-3.5 h-3.5 animate-pulse text-blue-400" />
              <span>Live Telemetry & Courier Dispatch</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Track Your Smartphone Delivery
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Enter your order number (e.g. PH-2026-8891) for real-time dispatch checkpoints and IMEI registry.
            </p>
          </div>

          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full sm:w-auto">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Order number (e.g. PH-2026-8891)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700/80 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-95 text-white text-xs font-bold transition-all shrink-0 shadow-md shadow-blue-500/20"
            >
              Track
            </button>
          </form>
        </div>

        {/* Demo Fast-Track Pill */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-800/80 text-xs text-slate-400">
          <span>Quick Demo:</span>
          <button
            type="button"
            onClick={() => {
              setSearchInput('PH-2026-8891');
              navigate('/track-order/PH-2026-8891');
              fetchOrder('PH-2026-8891');
            }}
            className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 font-mono text-[11px] font-bold transition-colors"
          >
            #PH-2026-8891 (Out for Delivery)
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="p-16 text-center space-y-3 bg-slate-900/30 rounded-3xl border border-slate-800">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-slate-400">Connecting to PhoneHub express courier gateway...</p>
        </div>
      )}

      {errorMsg && !isLoading && (
        <div className="p-8 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-rose-400 mx-auto" />
          <h3 className="text-base font-bold text-white">Order Reference Not Found</h3>
          <p className="text-xs text-rose-300 max-w-md mx-auto">{errorMsg}</p>
          <button
            type="button"
            onClick={() => {
              setSearchInput('PH-2026-8891');
              fetchOrder('PH-2026-8891');
            }}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold"
          >
            Load Sample Order (#PH-2026-8891)
          </button>
        </div>
      )}

      {order && !isLoading && (
        <div className="space-y-8 animate-in fade-in duration-300">
          
          {/* Order Summary Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <span className="px-3.5 py-1.5 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold font-mono border border-blue-500/30">
                  #{order.order_number}
                </span>
                <span className="px-3.5 py-1.5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  {order.status.replace(/_/g, ' ')}
                </span>
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
                  Express Courier
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-3">
                Courier Transit & Device Authentication
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Ordered on {formatDate(order.created_at)} • Payment: <strong className="uppercase text-slate-200">{order.payment_method}</strong> ({order.payment_status})
              </p>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print Invoice</span>
              </button>
            </div>
          </div>

          {/* Live Courier Radar Dispatch Banner */}
          {order.status === 'out_for_delivery' && (
            <div className="p-6 rounded-3xl bg-gradient-to-r from-blue-900/30 via-slate-900 to-indigo-900/30 border border-blue-500/40 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-600/30 border border-blue-500/50 flex items-center justify-center text-blue-400 shrink-0 shadow-lg shadow-blue-500/20">
                    <Truck className="w-7 h-7" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-400">Live Courier En Route</span>
                      <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
                    </div>
                    <h3 className="text-lg font-bold text-white mt-0.5">Rider Sokha V. is ~{simulatedMinutes} mins away</h3>
                    <p className="text-xs text-slate-300">
                      Vehicle: Electric Courier Fleet Van #PP-2026 • Driver Contact: +855 12 999 111
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="tel:+85512999111"
                    className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-blue-500/25 transition-all"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Driver</span>
                  </a>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex justify-between text-[11px] text-slate-400 font-semibold">
                  <span>Phnom Penh Central Distribution Hub</span>
                  <span className="text-blue-400">85% of Route Completed</span>
                  <span>Destination: {order.shipping_address_snapshot?.district || 'Doun Penh'}</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-[85%] animate-pulse" />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Timeline */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Courier Delivery Progression
            </h3>

            <div className="relative">
              <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
                {statusSteps.map((step, idx) => {
                  const isPastOrCurrent = idx <= currentStep;
                  const isCurrent = idx === currentStep;

                  return (
                    <div key={step.key} className="flex md:flex-col items-center md:items-start gap-3">
                      <div
                        className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 transition-all ${
                          isCurrent
                            ? 'bg-blue-600 text-white ring-4 ring-blue-500/30 scale-110 shadow-lg shadow-blue-500/30'
                            : isPastOrCurrent
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                            : 'bg-slate-800 text-slate-500'
                        }`}
                      >
                        {isPastOrCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                      </div>
                      <div>
                        <p className={`text-xs font-bold ${isCurrent ? 'text-blue-400' : isPastOrCurrent ? 'text-white' : 'text-slate-500'}`}>
                          {step.label}
                        </p>
                        <p className="text-[10px] text-slate-400 mt-0.5 leading-snug hidden md:block">
                          {step.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Device Authentication & IMEI Verification Card */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900/80 to-slate-950 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <BadgeCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                  Device Authentication & Warranty Registration
                </h3>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold">
                Certified Genuine
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Device Serial / IMEI</span>
                <p className="text-slate-200 font-mono font-bold mt-1">356789123456789</p>
                <p className="text-[10px] text-emerald-400 mt-0.5">● Logged to Manufacturer Database</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Warranty Status</span>
                <p className="text-slate-200 font-bold mt-1">1 Year Official Regional Care</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Active upon courier delivery</p>
              </div>
              <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold uppercase">Packaging Seal</span>
                <p className="text-slate-200 font-bold mt-1">Tamper-Evident Hologram #PH-9821</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Checked by QA Lead</p>
              </div>
            </div>
          </div>

          {/* Two Column Breakdown: Purchased Items & Delivery Details */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Purchased Items */}
            <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                Purchased Smartphones & Tech
              </h3>

              <div className="divide-y divide-slate-800">
                {order.items?.map((item) => (
                  <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-slate-950 p-2 border border-slate-800 shrink-0 flex items-center justify-center overflow-hidden">
                      <img
                        src={getImageUrl(item.product?.images?.[0]?.image_path)}
                        alt={item.product_name}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                    <div className="flex-1 text-xs">
                      <h4 className="font-bold text-white text-sm">{item.product_name}</h4>
                      {item.variant_name && <p className="text-slate-400 mt-0.5">{item.variant_name}</p>}
                      <p className="text-slate-500 font-mono mt-1">SKU: {item.sku}</p>
                    </div>
                    <div className="text-right text-xs">
                      <p className="font-bold text-white text-sm">{formatPrice(item.subtotal)}</p>
                      <p className="text-slate-400 text-[11px]">{item.quantity} × {formatPrice(item.unit_price)}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Price Breakdown */}
              <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-white">{formatPrice(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Coupon ({order.coupon_code || 'Promo'})</span>
                    <span>-{formatPrice(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Shipping ({order.shipping_method})</span>
                  <span className="text-white">{order.shipping_fee === 0 ? 'FREE' : formatPrice(order.shipping_fee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-800 text-base font-extrabold text-white">
                  <span>Grand Total</span>
                  <span className="text-blue-400">{formatPrice(order.total_amount)}</span>
                </div>
              </div>
            </div>

            {/* Delivery Destination & Checkpoint Log */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Delivery Address */}
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3 text-xs">
                <h3 className="font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-blue-400" />
                  <span>Delivery Address</span>
                </h3>
                
                <div className="space-y-1 text-slate-300">
                  <p className="font-bold text-white text-sm">{order.shipping_address_snapshot?.full_name}</p>
                  <p className="text-blue-400">{order.shipping_address_snapshot?.phone}</p>
                  <p className="text-slate-400 pt-1">
                    {order.shipping_address_snapshot?.address_line_1}
                  </p>
                  <p className="text-slate-400">
                    {order.shipping_address_snapshot?.commune}, {order.shipping_address_snapshot?.district}
                  </p>
                  <p className="text-slate-400">
                    {order.shipping_address_snapshot?.province}, {order.shipping_address_snapshot?.country}
                  </p>
                  {order.shipping_address_snapshot?.delivery_notes && (
                    <p className="text-amber-400/90 text-[11px] pt-2 italic">
                      Note: "{order.shipping_address_snapshot.delivery_notes}"
                    </p>
                  )}
                </div>
              </div>

              {/* Courier Checkpoint Activity Log */}
              {((order.status_histories || order.statusHistories) && (order.status_histories || order.statusHistories)!.length > 0) && (
                <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Checkpoint Activity</span>
                  </h3>

                  <div className="space-y-3">
                    {(order.status_histories || order.statusHistories)!.map((hist: any, i: number) => (
                      <div key={hist.id || i} className="text-xs flex gap-3 items-start">
                        <span className="w-2 h-2 rounded-full bg-blue-400 shrink-0 mt-1.5" />
                        <div>
                          <p className="font-semibold text-slate-200 capitalize">
                            {hist.status.replace(/_/g, ' ')}
                          </p>
                          {hist.notes && <p className="text-slate-400 text-[11px] mt-0.5">{hist.notes}</p>}
                          <p className="text-[10px] text-slate-500 mt-0.5">{formatDate(hist.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* VIP Concierge Support */}
              <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs text-slate-400">
                <h4 className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>24/7 PhoneHub Concierge</span>
                </h4>
                <p>Have questions about your delivery or need to update courier instructions?</p>
                <p className="text-slate-200 font-semibold pt-1">Direct Hotline: +855 23 888 999</p>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
