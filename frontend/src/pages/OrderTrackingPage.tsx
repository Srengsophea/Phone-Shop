import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
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
  ShieldCheck
} from 'lucide-react';
import api from '../api/axios';
import { Order, OrderStatus } from '../types';
import { formatPrice, formatDate, getImageUrl } from '../utils/formatters';

const statusSteps: { key: OrderStatus; label: string; desc: string }[] = [
  { key: 'pending', label: 'Order Placed', desc: 'Received and awaiting confirmation' },
  { key: 'confirmed', label: 'Confirmed', desc: 'Order verified by store team' },
  { key: 'processing', label: 'Processing', desc: 'Device allocated from warehouse' },
  { key: 'packed', label: 'Packed', desc: 'Sealed with warranty card' },
  { key: 'shipped', label: 'Shipped', desc: 'Handed over to express courier' },
  { key: 'out_for_delivery', label: 'Out for Delivery', desc: 'Rider on the way to your address' },
  { key: 'delivered', label: 'Delivered', desc: 'Successfully received by customer' },
];

export const OrderTrackingPage: React.FC = () => {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await api.get(`/orders/track/${orderNumber}`);
        setOrder(response.data.data);
      } catch (err) {
        console.error('Failed to fetch tracking details', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-xs text-slate-400">Locating order in shipment system...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Order not found</h2>
        <p className="text-xs text-slate-400">Order #{orderNumber} does not exist or has invalid reference.</p>
        <Link to="/" className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-semibold">
          Return to Store
        </Link>
      </div>
    );
  }

  // Determine active step index
  const activeStepIndex = statusSteps.findIndex((s) => s.key === order.status);
  const currentStep = activeStepIndex === -1 ? 0 : activeStepIndex;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      
      {/* Top Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-blue-600/20 text-blue-400 text-xs font-bold font-mono">
              #{order.order_number}
            </span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold uppercase">
              {order.status.replace('_', ' ')}
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white mt-2">Order Tracking & Details</h1>
          <p className="text-xs text-slate-400 mt-1">
            Placed on {formatDate(order.created_at)} • Payment: <strong className="uppercase text-slate-200">{order.payment_method}</strong> ({order.payment_status})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </button>
        </div>
      </div>

      {/* Visual Tracking Progression Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Delivery Progression</h3>
        
        <div className="relative">
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {statusSteps.map((step, idx) => {
              const isPastOrCurrent = idx <= currentStep;
              const isCurrent = idx === currentStep;

              return (
                <div key={step.key} className="flex md:flex-col items-center md:items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                    isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/25 animate-pulse'
                      : isPastOrCurrent
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-500'
                  }`}>
                    {isPastOrCurrent ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                  </div>
                  <div>
                    <p className={`text-xs font-bold ${isPastOrCurrent ? 'text-white' : 'text-slate-500'}`}>
                      {step.label}
                    </p>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-tight hidden md:block">
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Breakdown: Items & Delivery Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Order Items with Immutable Purchase Prices */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Purchased Items</h3>

          <div className="divide-y divide-slate-800">
            {order.items?.map((item) => (
              <div key={item.id} className="py-4 first:pt-0 last:pb-0 flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-slate-950 p-2 border border-slate-800 shrink-0 flex items-center justify-center">
                  <img
                    src={getImageUrl(item.product?.images?.[0]?.image_path)}
                    alt=""
                    className="max-h-full max-w-full object-contain"
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

          <div className="pt-4 border-t border-slate-800 space-y-2 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-white">{formatPrice(order.subtotal)}</span>
            </div>
            {order.discount_amount > 0 && (
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({order.coupon_code || 'Promo'})</span>
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

        {/* Shipping Address Snapshot & Support */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">Delivery Address</h3>
            
            <div className="space-y-1 text-xs text-slate-300">
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

          <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800 space-y-2 text-xs text-slate-400">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Need help with this order?</span>
            </h4>
            <p>Our dedicated phone shop support team is available 24/7 at +855 23 888 999 or support@phonehub.com.</p>
          </div>
        </div>

      </div>

    </div>
  );
};
