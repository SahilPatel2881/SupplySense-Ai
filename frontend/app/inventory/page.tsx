'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import BarcodeScannerModal from '../../components/BarcodeScannerModal';
import { TableSkeleton } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { Product, Warehouse, StockMovement } from '../../types';
import {
  Boxes,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Search,
  CheckCircle2,
  AlertTriangle,
  Scan,
  History,
  X
} from 'lucide-react';

export default function InventoryPage() {
  const { user } = useAuth();
  const role = user?.role || '';
  const canStockIn = ['Founder', 'Admin', 'InventoryManager', 'WarehouseManager', 'StockManager', 'PurchaseManager'].includes(role);
  const canStockOutOrTransfer = ['Founder', 'Admin', 'InventoryManager', 'WarehouseManager', 'StockManager'].includes(role);

  const [products, setProducts] = useState<Product[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'stock' | 'movements'>('stock');
  const [showScanner, setShowScanner] = useState(false);

  // Per Product Stock History Modal State
  const [selectedProductHistory, setSelectedProductHistory] = useState<Product | null>(null);

  // Modal State
  const [modalType, setModalType] = useState<'IN' | 'OUT' | 'TRANSFER' | null>(null);
  const [formData, setFormData] = useState({
    product_id: '',
    warehouse_id: '',
    source_warehouse_id: '',
    target_warehouse_id: '',
    quantity: 10,
    reference_doc: '',
    note: ''
  });
  const [submitMsg, setSubmitMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (modalType) setModalType(null);
        if (showScanner) setShowScanner(false);
        if (selectedProductHistory) setSelectedProductHistory(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [modalType, showScanner, selectedProductHistory]);

  const fetchInventoryData = async () => {
    try {
      const [prodRes, whRes, movRes] = await Promise.all([
        api.get('/products/'),
        api.get('/warehouses/'),
        api.get('/inventory/movements/')
      ]);
      setProducts(prodRes.data);
      setWarehouses(whRes.data);
      setMovements(movRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load inventory data:', err);
      setLoading(false);
    }
  };

  const handleModalOpen = (type: 'IN' | 'OUT' | 'TRANSFER', defaultProdId: string = '') => {
    setModalType(type);
    setSubmitMsg(null);
    setFormData({
      product_id: defaultProdId || (products[0]?.id || ''),
      warehouse_id: warehouses[0]?.id || '',
      source_warehouse_id: warehouses[0]?.id || '',
      target_warehouse_id: warehouses[1]?.id || warehouses[0]?.id || '',
      quantity: 10,
      reference_doc: type === 'IN' ? 'Stock In Receipt' : type === 'OUT' ? 'Dispatched' : 'Inter-Warehouse Transfer',
      note: ''
    });
  };

  const handleScanComplete = (scannedProduct: Product) => {
    if (scannedProduct && scannedProduct.id) {
      handleModalOpen('IN', scannedProduct.id);
    }
  };

  const handleActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg(null);
    try {
      let endpoint = '/inventory/stock-in/';
      if (modalType === 'OUT') endpoint = '/inventory/stock-out/';
      if (modalType === 'TRANSFER') endpoint = '/inventory/transfer/';

      const res = await api.post(endpoint, formData);
      setSubmitMsg({ type: 'success', text: res.data.message });
      fetchInventoryData();
      setTimeout(() => {
        setModalType(null);
      }, 1500);
    } catch (err: any) {
      setSubmitMsg({ type: 'error', text: err.response?.data?.error || 'Action failed' });
    }
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2">
                <Boxes className="w-6 h-6 text-blue-600" /> Real-time Warehouse Inventory
              </h2>
              <p className="text-slate-500 text-xs mt-1">Manage stock in/out operations, inter-warehouse transfers, and movement logs.</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {canStockIn && (
                <>
                  {/* <button
                    onClick={() => setShowScanner(true)}
                    className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold text-xs shadow-sm flex items-center gap-1.5 cursor-pointer"
                  >
                    <Scan className="w-4 h-4 text-blue-400" /> Scan Barcode
                  </button> */}
                  <button
                    onClick={() => handleModalOpen('IN')}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowDownLeft className="w-4 h-4" /> Stock In
                  </button>
                </>
              )}
              {canStockOutOrTransfer && (
                <>
                  <button
                    onClick={() => handleModalOpen('OUT')}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-md shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowUpRight className="w-4 h-4" /> Stock Out
                  </button>
                  <button
                    onClick={() => handleModalOpen('TRANSFER')}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-xs shadow-md shadow-purple-600/20 flex items-center gap-1.5 cursor-pointer"
                  >
                    <ArrowRightLeft className="w-4 h-4" /> Transfer Stock
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex items-center justify-between border-b border-slate-200 pb-2">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('stock')}
                className={`pb-2 text-sm font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'stock' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Warehouse Stock Levels ({filteredProducts.length})
              </button>
              <button
                onClick={() => setActiveTab('movements')}
                className={`pb-2 text-sm font-bold border-b-2 cursor-pointer transition-colors ${activeTab === 'movements' ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-800'}`}
              >
                Stock Movement History ({movements.length})
              </button>
            </div>

            {activeTab === 'stock' && (
              <div className="relative w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search product or SKU..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            )}
          </div>

          {/* Stock Table or Skeleton */}
          {loading ? (
            <TableSkeleton rows={7} cols={6} />
          ) : (
            <>
              {/* Stock Table */}
              {activeTab === 'stock' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
                        <th className="p-4">Product Name & SKU</th>
                        <th className="p-4">Category</th>
                        <th className="p-4">Supplier</th>
                        <th className="p-4">Available Stock</th>
                        <th className="p-4">Min Threshold</th>
                        <th className="p-4">Stock Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="p-4 font-bold text-slate-900">
                            <div>{p.name}</div>
                            <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                          </td>
                          <td className="p-4"><span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{p.category_name}</span></td>
                          <td className="p-4 font-medium">{p.supplier_name}</td>
                          <td className="p-4 font-extrabold text-slate-900">{p.total_stock} {p.unit}</td>
                          <td className="p-4">{p.min_stock_level} {p.unit}</td>
                          <td className="p-4">
                            {p.is_low_stock ? (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-50 text-amber-700 border border-amber-200">
                                <AlertTriangle className="w-3 h-3" /> Low Stock
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <CheckCircle2 className="w-3 h-3" /> Adequate
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => setSelectedProductHistory(p)}
                              title="View Product Stock History"
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold rounded-lg text-[11px] mr-1.5 transition-colors cursor-pointer inline-flex items-center gap-1"
                            >
                              <History className="w-3.5 h-3.5" /> History
                            </button>
                            <button
                              onClick={() => handleModalOpen('IN', p.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-[11px] mr-1.5 transition-colors cursor-pointer"
                            >
                              + Add
                            </button>
                            <button
                              onClick={() => handleModalOpen('OUT', p.id)}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-rose-50 text-rose-600 font-bold rounded-lg text-[11px] transition-colors cursor-pointer"
                            >
                              - Deduct
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Movements Table */}
              {activeTab === 'movements' && (
                <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
                        <th className="p-4">Timestamp</th>
                        <th className="p-4">Type</th>
                        <th className="p-4">Product</th>
                        <th className="p-4">Source / Target Warehouse</th>
                        <th className="p-4">Qty</th>
                        <th className="p-4">Reference Doc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                      {movements.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-50/80">
                          <td className="p-4 text-slate-400 font-mono">{m.timestamp?.slice(0, 16)}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${m.movement_type === 'IN' ? 'bg-emerald-100 text-emerald-800' : m.movement_type === 'OUT' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'}`}>
                              {m.movement_type}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-900">{m.product_name}</td>
                          <td className="p-4">{m.source_warehouse_name} → {m.target_warehouse_name}</td>
                          <td className="p-4 font-bold text-slate-900">{m.quantity}</td>
                          <td className="p-4 text-slate-500 font-mono">{m.reference_doc}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {/* Barcode Scanner Modal */}
          <BarcodeScannerModal
            isOpen={showScanner}
            onClose={() => setShowScanner(false)}
            onScanComplete={handleScanComplete}
            products={products}
          />

          {/* Action Modal */}
          {modalType && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-extrabold text-slate-900 border-b border-slate-100 pb-3">
                  Execute {modalType === 'IN' ? 'Stock In' : modalType === 'OUT' ? 'Stock Out' : 'Inter-Warehouse Stock Transfer'}
                </h3>

                {submitMsg && (
                  <div className={`p-3 rounded-xl text-xs font-bold ${submitMsg.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                    {submitMsg.text}
                  </div>
                )}

                <form onSubmit={handleActionSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Target Product</label>
                    <select
                      value={formData.product_id}
                      onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                    >
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
                      ))}
                    </select>
                  </div>

                  {modalType !== 'TRANSFER' ? (
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Warehouse</label>
                      <select
                        value={formData.warehouse_id}
                        onChange={(e) => setFormData({ ...formData, warehouse_id: e.target.value })}
                        className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:border-blue-500"
                      >
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Source Warehouse</label>
                        <select
                          value={formData.source_warehouse_id}
                          onChange={(e) => setFormData({ ...formData, source_warehouse_id: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Target Warehouse</label>
                        <select
                          value={formData.target_warehouse_id}
                          onChange={(e) => setFormData({ ...formData, target_warehouse_id: e.target.value })}
                          className="w-full p-2 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                        >
                          {warehouses.map(w => (
                            <option key={w.id} value={w.id}>{w.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Quantity</label>
                    <input
                      type="number"
                      min="1"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500 font-bold"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Reference Doc / Note</label>
                    <input
                      type="text"
                      value={formData.reference_doc}
                      onChange={(e) => setFormData({ ...formData, reference_doc: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                      placeholder="PO # or Reference ID"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setModalType(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      Confirm Operation
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          {/* Product Stock Movement History Modal */}
          {selectedProductHistory && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-2xl shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100">
                      {selectedProductHistory.sku}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">
                      Stock History: {selectedProductHistory.name}
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedProductHistory(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 text-slate-500 uppercase text-[10px] font-bold tracking-wider border-b border-slate-200">
                        <th className="p-3">Timestamp</th>
                        <th className="p-3">Type</th>
                        <th className="p-3">Warehouse Route</th>
                        <th className="p-3">Qty Change</th>
                        <th className="p-3">Reference Doc</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {movements.filter(m => m.product_name === selectedProductHistory.name || m.product_id === selectedProductHistory.id).length === 0 ? (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-slate-400 font-medium">
                            No movement records found for this product yet.
                          </td>
                        </tr>
                      ) : (
                        movements
                          .filter(m => m.product_name === selectedProductHistory.name || m.product_id === selectedProductHistory.id)
                          .map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50">
                              <td className="p-3 font-mono text-slate-500">{m.timestamp?.slice(0, 16)}</td>
                              <td className="p-3">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${m.movement_type === 'IN' ? 'bg-emerald-100 text-emerald-800' : m.movement_type === 'OUT' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'}`}>
                                  {m.movement_type}
                                </span>
                              </td>
                              <td className="p-3 font-medium text-slate-700">{m.source_warehouse_name} → {m.target_warehouse_name}</td>
                              <td className="p-3 font-bold text-slate-900">{m.quantity} {selectedProductHistory.unit}</td>
                              <td className="p-3 font-mono text-slate-500">{m.reference_doc}</td>
                            </tr>
                          ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end pt-2 border-t border-slate-100">
                  <button
                    onClick={() => setSelectedProductHistory(null)}
                    className="px-4 py-2 bg-slate-900 text-white font-bold text-xs rounded-xl cursor-pointer"
                  >
                    Close History
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
