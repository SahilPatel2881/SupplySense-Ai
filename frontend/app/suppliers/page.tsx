'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Supplier } from '../../types';
import { Truck, Plus } from 'lucide-react';

export default function SuppliersPage() {
  const { isAdmin } = useAuth();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contact_person: '',
    email: '',
    phone: '',
    lead_time_days: 7.0,
    defect_rate: 0.02,
    fulfillment_rate: 0.95
  });

  useEffect(() => {
    fetchSuppliers();
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

  const fetchSuppliers = async () => {
    try {
      const res = await api.get('/suppliers/');
      setSuppliers(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load suppliers:', err);
      setLoading(false);
    }
  };

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/suppliers/', formData);
      setShowAddModal(false);
      fetchSuppliers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to register supplier');
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
                <Truck className="w-6 h-6 text-blue-600" /> Supplier Directory & Performance
              </h2>
              <p className="text-slate-500 text-xs mt-1">Track lead time variance, fulfillment efficiency, defect percentages, and AI reliability scores.</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Register New Supplier
              </button>
            )}
          </div>

          {/* Supplier Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {suppliers.map((sup) => (
              <div key={sup.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">{sup.code}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${sup.reliability_score >= 90 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : sup.reliability_score >= 80 ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      Score: {sup.reliability_score}%
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900 mt-2">{sup.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{sup.contact_person} ({sup.email || sup.phone})</p>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Avg Lead Time:</span>
                    <span className="font-bold text-slate-900">{sup.lead_time_days} Days</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>On-Time Fulfillment:</span>
                    <span className="font-bold text-emerald-600">{(sup.fulfillment_rate * 100).toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Defect Rate:</span>
                    <span className="font-bold text-rose-600">{(sup.defect_rate * 100).toFixed(1)}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Register Supplier Account</h3>

                <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Company Name</label>
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Code</label>
                      <input
                        type="text"
                        required
                        value={formData.code}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-mono focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Contact Person</label>
                      <input
                        type="text"
                        value={formData.contact_person}
                        onChange={(e) => setFormData({ ...formData, contact_person: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Lead Time (d)</label>
                      <input
                        type="number"
                        step="0.5"
                        value={formData.lead_time_days}
                        onChange={(e) => setFormData({ ...formData, lead_time_days: parseFloat(e.target.value) || 1 })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Fulfillment (0-1)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.fulfillment_rate}
                        onChange={(e) => setFormData({ ...formData, fulfillment_rate: parseFloat(e.target.value) || 0.9 })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Defect Rate (0-1)</label>
                      <input
                        type="number"
                        step="0.001"
                        value={formData.defect_rate}
                        onChange={(e) => setFormData({ ...formData, defect_rate: parseFloat(e.target.value) || 0.01 })}
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
                      Register Supplier
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
