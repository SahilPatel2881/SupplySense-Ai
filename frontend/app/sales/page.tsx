'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Sale, Warehouse, Product } from '../../types';
import { Receipt, Plus, FileDown } from 'lucide-react';

export default function SalesPage() {
  const { assignedWarehouseId } = useAuth();
  const [sales, setSales] = useState<Sale[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [saleForm, setSaleForm] = useState({
    warehouse_id: '',
    customer_name: 'Walk-in Customer',
    items: [{ product_id: '', quantity: 2, unit_price: 15.0 }]
  });

  useEffect(() => {
    fetchSalesData();
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

  const fetchSalesData = async () => {
    try {
      const [salesRes, whRes, prodRes] = await Promise.all([
        api.get('/sales/'),
        api.get('/warehouses/'),
        api.get('/products/')
      ]);
      setSales(salesRes.data);
      setWarehouses(whRes.data);
      setProducts(prodRes.data);
      setLoading(false);

      if (whRes.data.length > 0 && prodRes.data.length > 0) {
        setSaleForm({
          warehouse_id: assignedWarehouseId || whRes.data[0].id,
          customer_name: 'Industrial Tech Corp',
          items: [{ product_id: prodRes.data[0].id, quantity: 2, unit_price: prodRes.data[0].selling_price }]
        });
      }
    } catch (err) {
      console.error('Failed to load sales data:', err);
      setLoading(false);
    }
  };

  const handleRecordSale = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/sales/', saleForm);
      setShowCreateModal(false);
      fetchSalesData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to record sale');
    }
  };

  const handleDownloadPDF = async (saleId: string, invoiceNum: string) => {
    try {
      const res = await api.get(`/sales/${saleId}/pdf/`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Invoice_${invoiceNum}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to download invoice PDF');
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
                <Receipt className="w-6 h-6 text-blue-600" /> Sales & Invoice Billing
              </h2>
              <p className="text-slate-500 text-xs mt-1">Record outward sales transactions, execute real-time stock deductions, and download PDF invoices.</p>
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Record New Sale
            </button>
          </div>

          {/* Sales Transactions Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <th className="p-4">Invoice # & Date</th>
                  <th className="p-4">Customer Name</th>
                  <th className="p-4">Dispatch Warehouse</th>
                  <th className="p-4">Items Count</th>
                  <th className="p-4">Total Revenue (₹)</th>
                  <th className="p-4 text-right">PDF Invoice</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {sales.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{s.invoice_number}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{s.created_at?.slice(0, 16)}</span>
                    </td>
                    <td className="p-4 font-medium text-slate-900">{s.customer_name}</td>
                    <td className="p-4">{s.warehouse_name}</td>
                    <td className="p-4 font-bold">{s.items?.length || 0} Products</td>
                    <td className="p-4 font-mono font-bold text-emerald-600">₹{s.total_amount?.toLocaleString('en-IN')}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDownloadPDF(s.id, s.invoice_number)}
                        className="px-3 py-1 bg-slate-100 hover:bg-blue-50 text-blue-600 font-bold rounded-lg text-[11px] flex items-center gap-1 ml-auto transition-colors cursor-pointer"
                      >
                        <FileDown className="w-3.5 h-3.5" /> PDF Invoice
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Record Sale Modal */}
          {showCreateModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Record Point-of-Sale Transaction</h3>

                <form onSubmit={handleRecordSale} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Customer / Client Name</label>
                    <input
                      type="text"
                      required
                      value={saleForm.customer_name}
                      onChange={(e) => setSaleForm({ ...saleForm, customer_name: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Dispatching Warehouse</label>
                    <select
                      value={saleForm.warehouse_id}
                      onChange={(e) => setSaleForm({ ...saleForm, warehouse_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      {warehouses.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2 border-t border-slate-100 pt-2">
                    <label className="block font-bold text-slate-700">Product Line Item</label>
                    <div className="grid grid-cols-3 gap-2">
                      <select
                        value={saleForm.items[0].product_id}
                        onChange={(e) => {
                          const selectedProd = products.find(p => p.id === e.target.value);
                          setSaleForm({
                            ...saleForm,
                            items: [{ ...saleForm.items[0], product_id: e.target.value, unit_price: selectedProd?.selling_price || 15.0 }]
                          });
                        }}
                        className="col-span-2 p-2 border border-slate-200 rounded-xl"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.name} (${p.selling_price})</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        min="1"
                        value={saleForm.items[0].quantity}
                        onChange={(e) => setSaleForm({ ...saleForm, items: [{ ...saleForm.items[0], quantity: parseInt(e.target.value) || 1 }] })}
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
                      Record & Generate Invoice
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
