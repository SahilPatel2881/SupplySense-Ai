'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { PurchaseOrder, Supplier, Warehouse, Product } from '../../types';
import { ShoppingCart, Plus, CheckCircle, PackageCheck } from 'lucide-react';

export default function PurchaseOrdersPage() {
  const { isAdmin } = useAuth();
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [poForm, setPoForm] = useState({
    supplier_id: '',
    warehouse_id: '',
    items: [{ product_id: '', quantity: 10, unit_price: 5.0 }]
  });

  useEffect(() => {
    fetchPOData();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showCreateModal) {
        setShowCreateModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showCreateModal]);

  const fetchPOData = async () => {
    try {
      const [poRes, supRes, whRes, prodRes] = await Promise.all([
        api.get('/purchase-orders/'),
        api.get('/suppliers/'),
        api.get('/warehouses/'),
        api.get('/products/')
      ]);
      setPurchaseOrders(poRes.data);
      setSuppliers(supRes.data);
      setWarehouses(whRes.data);
      setProducts(prodRes.data);
      setLoading(false);
      if (supRes.data.length > 0 && whRes.data.length > 0 && prodRes.data.length > 0) {
        setPoForm({
          supplier_id: supRes.data[0].id,
          warehouse_id: whRes.data[0].id,
          items: [{ product_id: prodRes.data[0].id, quantity: 50, unit_price: prodRes.data[0].cost_price }]
        });
      }
    } catch (err) {
      console.error('Failed to load purchase orders:', err);
      setLoading(false);
    }
  };

  const handleApprovePO = async (poId: string) => {
    try {
      await api.post(`/purchase-orders/${poId}/approve/`);
      fetchPOData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to approve PO');
    }
  };

  const handleReceivePO = async (poId: string) => {
    try {
      await api.post(`/purchase-orders/${poId}/receive/`);
      fetchPOData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to receive PO items');
    }
  };

  const handleCreatePO = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/purchase-orders/', poForm);
      setShowCreateModal(false);
      fetchPOData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create PO');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <ShoppingCart className="w-6 h-6 text-blue-600" /> Purchase Orders & Procurement
              </h2>
              <p className="text-slate-500 text-xs mt-1">Create procurement orders, route for Admin approval, and receive items directly into inventory.</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create Purchase Order
            </button>
          </div>

          {/* PO Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <th className="p-4">PO Number & Date</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Destination Warehouse</th>
                  <th className="p-4">Total Amount ($)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Procurement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {purchaseOrders.map((po) => (
                  <tr key={po.id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{po.po_number}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{po.created_at?.slice(0, 10)}</span>
                    </td>
                    <td className="p-4 font-medium">{po.supplier_name}</td>
                    <td className="p-4">{po.warehouse_name}</td>
                    <td className="p-4 font-mono font-bold text-slate-900">${po.total_amount?.toFixed(2)}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${po.status === 'RECEIVED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : po.status === 'APPROVED' ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                        {po.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      {po.status === 'PENDING' && isAdmin && (
                        <button
                          onClick={() => handleApprovePO(po.id)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg text-[11px] shadow-sm flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Approve PO
                        </button>
                      )}

                      {po.status === 'APPROVED' && (
                        <button
                          onClick={() => handleReceivePO(po.id)}
                          className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] shadow-sm flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <PackageCheck className="w-3.5 h-3.5" /> Receive Stock
                        </button>
                      )}

                      {po.status === 'RECEIVED' && (
                        <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 justify-end">
                          <CheckCircle className="w-3.5 h-3.5" /> Received
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Create Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Draft New Purchase Order</h3>

                <form onSubmit={handleCreatePO} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Select Supplier</label>
                    <select
                      value={poForm.supplier_id}
                      onChange={(e) => setPoForm({ ...poForm, supplier_id: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name} ({s.code})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Destination Warehouse</label>
                    <select
                      value={poForm.warehouse_id}
                      onChange={(e) => setPoForm({ ...poForm, warehouse_id: e.target.value })}
                      className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <label className="block font-bold text-slate-700">Item Details</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={poForm.items[0].product_id}
                        onChange={(e) => {
                          const selectedProd = products.find(p => p.id === e.target.value);
                          setPoForm({
                            ...poForm,
                            items: [{ ...poForm.items[0], product_id: e.target.value, unit_price: selectedProd?.cost_price || 5.0 }]
                          });
                        }}
                        className="col-span-2 p-2 border border-slate-200 rounded-xl"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={poForm.items[0].quantity}
                        onChange={(e) => setPoForm({ ...poForm, items: [{ ...poForm.items[0], quantity: parseInt(e.target.value) || 1 }] })}
                        className="p-2 border border-slate-200 rounded-xl font-bold"
                        placeholder="Qty"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      Submit Order
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
