'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Product, Category, Supplier } from '../../types';
import { Package, Plus, Search } from 'lucide-react';

export default function ProductsPage() {
  const { isAdmin } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    barcode: '',
    description: '',
    category_id: '',
    supplier_id: '',
    unit: 'pcs',
    cost_price: 10.0,
    selling_price: 25.0,
    min_stock_level: 20,
    reorder_point: 35
  });

  useEffect(() => {
    fetchProductCatalog();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showAddModal) {
        setShowAddModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal]);

  const fetchProductCatalog = async () => {
    try {
      const [prodRes, catRes, supRes] = await Promise.all([
        api.get('/products/'),
        api.get('/categories/'),
        api.get('/suppliers/')
      ]);
      setProducts(prodRes.data);
      setCategories(catRes.data);
      setSuppliers(supRes.data);
      setLoading(false);
      if (catRes.data.length > 0 && supRes.data.length > 0) {
        setFormData(prev => ({
          ...prev,
          category_id: catRes.data[0].id,
          supplier_id: supRes.data[0].id
        }));
      }
    } catch (err) {
      console.error('Failed to load product catalog:', err);
      setLoading(false);
    }
  };

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products/', formData);
      setShowAddModal(false);
      fetchProductCatalog();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create product');
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
              <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-6 h-6 text-blue-600" /> Master Product Catalog
              </h2>
              <p className="text-slate-500 text-xs mt-1">Manage SKUs, barcodes, unit prices, minimum threshold metrics, and supplier mapping.</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Product
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by product name, SKU, or barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <th className="p-4">SKU / Product Name</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Supplier</th>
                  <th className="p-4">Cost Price (₹)</th>
                  <th className="p-4">Selling Price (₹)</th>
                  <th className="p-4">Margin (₹)</th>
                  <th className="p-4">Min Stock</th>
                  <th className="p-4">Reorder Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {filteredProducts.map((p) => {
                  const margin = (p.selling_price - p.cost_price).toLocaleString('en-IN');
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="p-4 font-bold text-slate-900">
                        <div>{p.name}</div>
                        <span className="text-[10px] text-slate-400 font-mono">{p.sku} | Barcode: {p.barcode || 'N/A'}</span>
                      </td>
                      <td className="p-4"><span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">{p.category_name}</span></td>
                      <td className="p-4 font-medium">{p.supplier_name}</td>
                      <td className="p-4 font-mono">₹{p.cost_price?.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono font-bold text-slate-900">₹{p.selling_price?.toLocaleString('en-IN')}</td>
                      <td className="p-4 font-mono font-bold text-emerald-600">+₹{margin}</td>
                      <td className="p-4">{p.min_stock_level} {p.unit}</td>
                      <td className="p-4 font-bold text-blue-600">{p.reorder_point} {p.unit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Create New Master Product</h3>

                <form onSubmit={handleAddProduct} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Product Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">SKU Code</label>
                      <input
                        type="text"
                        required
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Category</label>
                      <select
                        value={formData.category_id}
                        onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Supplier</label>
                      <select
                        value={formData.supplier_id}
                        onChange={(e) => setFormData({ ...formData, supplier_id: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      >
                        {suppliers.map(s => (
                          <option key={s.id} value={s.id}>{s.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Cost Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.cost_price}
                        onChange={(e) => setFormData({ ...formData, cost_price: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Selling Price ($)</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.selling_price}
                        onChange={(e) => setFormData({ ...formData, selling_price: parseFloat(e.target.value) || 0 })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Unit</label>
                      <input
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Min Stock Threshold</label>
                      <input
                        type="number"
                        value={formData.min_stock_level}
                        onChange={(e) => setFormData({ ...formData, min_stock_level: parseInt(e.target.value) || 1 })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Reorder Point</label>
                      <input
                        type="number"
                        value={formData.reorder_point}
                        onChange={(e) => setFormData({ ...formData, reorder_point: parseInt(e.target.value) || 1 })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setShowAddModal(false)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      Create Product
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
