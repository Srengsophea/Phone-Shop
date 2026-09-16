import React, { useEffect, useState } from 'react';
import { Layers, AlertTriangle, Search, PlusCircle, History, X } from 'lucide-react';
import api from '../../api/axios';
import { InventoryTransaction } from '../../types';
import { formatDate } from '../../utils/formatters';

export const AdminInventoryPage: React.FC = () => {
  const [variants, setVariants] = useState<any[]>([]);
  const [history, setHistory] = useState<InventoryTransaction[]>([]);
  const [activeTab, setActiveTab] = useState<'monitor' | 'ledger'>('monitor');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Adjustment Modal
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState<any | null>(null);
  const [adjustQty, setAdjustQty] = useState('');
  const [adjustType, setAdjustType] = useState('adjustment');
  const [adjustNotes, setAdjustNotes] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadInventory = async () => {
    setIsLoading(true);
    try {
      const [vRes, hRes] = await Promise.all([
        api.get('/admin/inventory', { params: { low_stock_only: lowStockOnly ? 1 : 0, search } }),
        api.get('/admin/inventory/history'),
      ]);

      setVariants(vRes.data.data);
      setHistory(hRes.data.data);
    } catch (err) {
      console.error('Error loading inventory', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInventory();
  }, [lowStockOnly, search]);

  const handleOpenAdjust = (variant: any) => {
    setSelectedVariant(variant);
    setAdjustQty('');
    setAdjustType('adjustment');
    setAdjustNotes('');
    setFeedback(null);
    setIsAdjustModalOpen(true);
  };

  const handleSaveAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVariant) return;

    try {
      await api.post('/admin/inventory/adjust', {
        variant_id: selectedVariant.id,
        quantity_change: Number(adjustQty),
        type: adjustType,
        notes: adjustNotes,
      });

      setFeedback('Stock adjusted successfully.');
      setTimeout(() => {
        setIsAdjustModalOpen(false);
        loadInventory();
      }, 1000);
    } catch (err: any) {
      setFeedback(err.response?.data?.message || 'Adjustment failed.');
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Inventory Ledger & Stock Monitor</h1>
        <p className="text-xs text-slate-400 mt-1">
          Pessimistic locking prevents negative inventory. All changes recorded in audit ledger.
        </p>
      </div>

      {/* Tabs Switcher */}
      <div className="flex border-b border-slate-800 gap-6 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('monitor')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'monitor' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Stock Monitoring</span>
        </button>
        <button
          onClick={() => setActiveTab('ledger')}
          className={`pb-3 border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === 'ledger' ? 'border-blue-500 text-blue-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <History className="w-4 h-4" />
          <span>Transaction Audit History</span>
        </button>
      </div>

      {activeTab === 'monitor' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
            <div className="relative flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search variants by model or SKU..."
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-2.5" />
            </div>

            <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
                className="rounded border-slate-700 text-rose-500 focus:ring-0"
              />
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Low Stock Only (&le; 5 units)
              </span>
            </label>
          </div>

          {/* Variants Table */}
          <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
                <tr>
                  <th className="py-3 px-4">Smartphone Model</th>
                  <th className="py-3 px-4">Edition / Variant</th>
                  <th className="py-3 px-4">SKU</th>
                  <th className="py-3 px-4">Stock Level</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {variants.map((v) => {
                  const isLow = v.stock <= 5 && v.stock > 0;
                  const isOut = v.stock <= 0;

                  return (
                    <tr key={v.id} className="hover:bg-slate-800/20 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white">{v.product?.name}</td>
                      <td className="py-3.5 px-4 text-slate-300">{v.name || `${v.color} - ${v.storage}`}</td>
                      <td className="py-3.5 px-4 font-mono text-slate-400">{v.sku}</td>
                      <td className="py-3.5 px-4 font-extrabold text-white text-sm">{v.stock} units</td>
                      <td className="py-3.5 px-4">
                        {isOut ? (
                          <span className="px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-400 font-bold text-[10px]">
                            OUT OF STOCK
                          </span>
                        ) : isLow ? (
                          <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 font-bold text-[10px]">
                            LOW STOCK ({v.stock})
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-400 font-semibold text-[10px]">
                            IN STOCK
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(v)}
                          className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-1.5 ml-auto"
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          <span>Adjust Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'ledger' && (
        <div className="rounded-3xl bg-slate-900/50 border border-slate-800 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider bg-slate-950/40">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Product & Variant</th>
                <th className="py-3 px-4">Quantity Change</th>
                <th className="py-3 px-4">Balance After</th>
                <th className="py-3 px-4">Logged By / Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {history.map((tx: any) => (
                <tr key={tx.id} className="hover:bg-slate-800/20 transition-colors">
                  <td className="py-3.5 px-4 text-slate-400">{formatDate(tx.created_at)}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 font-bold uppercase text-[9px]">
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-white">{tx.product?.name}</p>
                    <p className="text-[11px] text-slate-400">{tx.variant?.name}</p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`font-mono font-bold ${tx.quantity_change > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.quantity_change > 0 ? `+${tx.quantity_change}` : tx.quantity_change}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-white">{tx.balance_after} units</td>
                  <td className="py-3.5 px-4 text-slate-400">
                    <p className="text-white">{tx.user?.name || 'System'}</p>
                    <p className="text-[11px] text-slate-500 italic">{tx.notes || 'N/A'}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Manual Stock Adjustment Modal */}
      {isAdjustModalOpen && selectedVariant && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <div onClick={() => setIsAdjustModalOpen(false)} className="fixed inset-0 bg-slate-950/80 backdrop-blur-md" />

            <div className="relative w-full max-w-md rounded-3xl bg-slate-900 border border-slate-800 p-8 shadow-2xl z-10 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white">Adjust Stock Level</h3>
                <button onClick={() => setIsAdjustModalOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 text-xs text-slate-300 space-y-1">
                <p><strong>Device:</strong> {selectedVariant.product?.name}</p>
                <p><strong>Variant:</strong> {selectedVariant.name}</p>
                <p><strong>Current Stock:</strong> <span className="text-blue-400 font-bold">{selectedVariant.stock} units</span></p>
              </div>

              {feedback && (
                <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs">
                  {feedback}
                </div>
              )}

              <form onSubmit={handleSaveAdjustment} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Adjustment Type</label>
                  <select
                    value={adjustType}
                    onChange={(e) => setAdjustType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  >
                    <option value="purchase">Purchase / Restock (+)</option>
                    <option value="adjustment">Manual Adjustment (+ or -)</option>
                    <option value="damage">Damaged / Written-off (-)</option>
                    <option value="return">Customer Return (+)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity Change (e.g. +10 or -3)</label>
                  <input
                    type="number"
                    required
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(e.target.value)}
                    placeholder="+10 or -2"
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Audit Reason / Notes</label>
                  <textarea
                    rows={2}
                    required
                    value={adjustNotes}
                    onChange={(e) => setAdjustNotes(e.target.value)}
                    placeholder="e.g. Batch arrival from regional distributor..."
                    className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdjustModalOpen(false)}
                    className="flex-1 py-2.5 rounded-xl bg-slate-800 text-slate-300 text-xs font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25"
                  >
                    Commit Adjustment
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
