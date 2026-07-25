'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Warehouse, User } from '../../types';
import { Building2, MapPin, Users, Plus } from 'lucide-react';

export default function WarehousesPage() {
  const { isAdmin } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    capacity: 20000,
    manager_id: '',
    contact_number: ''
  });

  useEffect(() => {
    fetchWarehouses();
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

  const fetchWarehouses = async () => {
    try {
      const res = await api.get('/warehouses/');
      setWarehouses(res.data);
      if (isAdmin) {
        const usersRes = await api.get('/users/');
        setManagers(usersRes.data.filter((u: User) => u.role === 'WarehouseManager'));
      }
      setLoading(false);
    } catch (err) {
      console.error('Failed to load warehouses:', err);
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/warehouses/', formData);
      setShowAddModal(false);
      fetchWarehouses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create warehouse');
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
                <Building2 className="w-6 h-6 text-blue-600" /> Multi-Warehouse Network
              </h2>
              <p className="text-slate-500 text-xs mt-1">Monitor storage capacity limits, active warehouse managers, and site telemetry.</p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add New Warehouse
              </button>
            )}
          </div>

          {/* Warehouse Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {warehouses.map((wh) => (
              <div key={wh.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{wh.code}</span>
                    <h3 className="font-bold text-lg text-slate-900 mt-1">{wh.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {wh.location}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${wh.status === 'Active' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-600'}`}>
                    {wh.status}
                  </span>
                </div>

                {/* Capacity Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>Capacity Usage</span>
                    <span>{wh.capacity_usage_pct}% ({wh.current_stock_qty?.toLocaleString()} / {wh.capacity?.toLocaleString()} units)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${(wh.capacity_usage_pct || 0) > 85 ? 'bg-rose-500' : (wh.capacity_usage_pct || 0) > 65 ? 'bg-amber-500' : 'bg-blue-600'}`}
                      style={{ width: `${Math.min(100, wh.capacity_usage_pct || 0)}%` }}
                    />
                  </div>
                </div>

                {/* Manager Details */}
                <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-600">
                  <span className="flex items-center gap-1.5 font-medium">
                    <Users className="w-4 h-4 text-slate-400" /> Assigned Manager:
                  </span>
                  <span className="font-bold text-slate-900">{wh.manager_name}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Register New Site Warehouse</h3>

                <form onSubmit={handleCreateWarehouse} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Warehouse Name</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
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
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Max Capacity (Units)</label>
                      <input
                        type="number"
                        required
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) || 10000 })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Location Address</label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assign Manager</label>
                    <select
                      value={formData.manager_id}
                      onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Unassigned</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name || m.username}</option>
                      ))}
                    </select>
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
                      Save Warehouse
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
