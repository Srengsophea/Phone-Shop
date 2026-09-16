import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftRight, X, Smartphone, Trash2 } from 'lucide-react';
import { useCompareStore } from '../stores/compareStore';
import { getImageUrl } from '../utils/formatters';

export const CompareFloatingDock: React.FC = () => {
  const { items, removeFromCompare, clearCompare } = useCompareStore();
  const location = useLocation();

  // Hide the floating dock on the compare page itself or if no items selected
  if (items.length === 0 || location.pathname === '/compare') {
    return null;
  }

  const maxSlots = 4;
  const emptySlots = Math.max(0, maxSlots - items.length);

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-xl w-[92%] sm:w-auto animate-in slide-in-from-bottom-5 duration-300">
      <div className="p-3 sm:p-4 rounded-3xl bg-slate-900/90 border border-slate-700/80 shadow-2xl shadow-blue-500/10 backdrop-blur-xl ring-1 ring-white/10 flex items-center justify-between gap-4 sm:gap-6">
        
        {/* Left: Device Thumbnails & Slots */}
        <div className="flex items-center gap-2">
          {items.map((product) => {
            const primaryImg = product.images?.find((img) => img.is_primary)?.image_path || product.images?.[0]?.image_path;
            return (
              <div
                key={product.id}
                className="relative group w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-950 border border-slate-800 p-1 flex items-center justify-center shrink-0"
              >
                <img
                  src={getImageUrl(primaryImg)}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    removeFromCompare(product.id);
                  }}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-md hover:bg-rose-600 transition-colors"
                  title="Remove from comparison"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}

          {/* Empty Placeholders */}
          {[...Array(emptySlots)].map((_, i) => (
            <div
              key={`empty-${i}`}
              className="hidden sm:flex w-12 h-12 rounded-2xl border border-dashed border-slate-800 bg-slate-950/40 items-center justify-center text-slate-600"
              title="Add another phone to compare"
            >
              <Smartphone className="w-4 h-4 opacity-40" />
            </div>
          ))}
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={clearCompare}
            className="p-2.5 rounded-2xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Clear comparison tray"
          >
            <Trash2 className="w-4 h-4" />
          </button>

          <Link
            to="/compare"
            className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 flex items-center gap-2 transition-all active:scale-95"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Compare ({items.length})</span>
          </Link>
        </div>

      </div>
    </div>
  );
};
