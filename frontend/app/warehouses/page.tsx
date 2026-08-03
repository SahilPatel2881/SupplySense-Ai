'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { CardGridSkeleton } from '../../components/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';
import { Warehouse, User } from '../../types';
import {
  Building2,
  MapPin,
  Users,
  Plus,
  ShieldCheck,
  Briefcase,
  Package,
  ShoppingCart,
  TrendingUp,
  UserCheck,
  HardHat,
  Eye,
  Edit,
  Trash2,
  X
} from 'lucide-react';

export default function WarehousesPage() {
  const { isAdmin } = useAuth();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedStaffWarehouse, setSelectedStaffWarehouse] = useState<Warehouse | null>(null);

  // Edit Warehouse Modal State
  const [selectedEditWarehouse, setSelectedEditWarehouse] = useState<Warehouse | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    location: '',
    capacity: 20000,
    manager_id: '',
    contact_number: ''
  });

  const [editFormData, setEditFormData] = useState({
    name: '',
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
      if (e.key === 'Escape') {
        if (showAddModal) setShowAddModal(false);
        if (selectedStaffWarehouse) setSelectedStaffWarehouse(null);
        if (selectedEditWarehouse) setSelectedEditWarehouse(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAddModal, selectedStaffWarehouse, selectedEditWarehouse]);

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

  const handleOpenEditModal = (wh: Warehouse) => {
    setSelectedEditWarehouse(wh);
    setEditFormData({
      name: wh.name,
      location: wh.location || '',
      capacity: wh.capacity || 20000,
      manager_id: wh.manager_id || '',
      contact_number: wh.contact_number || ''
    });
  };

  const handleEditWarehouseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEditWarehouse) return;
    try {
      await api.put(`/warehouses/${selectedEditWarehouse.id}/`, editFormData);
      setSelectedEditWarehouse(null);
      fetchWarehouses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to update warehouse');
    }
  };

  const handleDeleteWarehouse = async (wh: Warehouse) => {
    if (!confirm(`Are you sure you want to delete warehouse "${wh.name}" (${wh.code})? All associated stock records will be removed.`)) {
      return;
    }
    try {
      await api.delete(`/warehouses/${wh.id}/`);
      fetchWarehouses();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to delete warehouse');
    }
  };

  const getManagerBadge = (roleName: string, staffMember?: { full_name?: string; username: string } | null, defaultName?: string) => {
    const name = staffMember?.full_name || staffMember?.username || defaultName || 'Assigned Manager';
    
    let icon = <Briefcase className="w-3.5 h-3.5 text-blue-500" />;
    let badgeBg = 'bg-blue-50/80 text-blue-700 border-blue-200/60';
    let roleLabel = 'Warehouse Mgr';

    if (roleName === 'SalesManager') {
      icon = <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
      badgeBg = 'bg-emerald-50/80 text-emerald-700 border-emerald-200/60';
      roleLabel = 'Sales Mgr';
    } else if (roleName === 'StockManager') {
      icon = <Package className="w-3.5 h-3.5 text-amber-500" />;
      badgeBg = 'bg-amber-50/80 text-amber-700 border-amber-200/60';
      roleLabel = 'Stock Mgr';
    } else if (roleName === 'InventoryManager') {
      icon = <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />;
      badgeBg = 'bg-purple-50/80 text-purple-700 border-purple-200/60';
      roleLabel = 'Inventory Mgr';
    } else if (roleName === 'PurchaseManager') {
      icon = <ShoppingCart className="w-3.5 h-3.5 text-indigo-500" />;
      badgeBg = 'bg-indigo-50/80 text-indigo-700 border-indigo-200/60';
      roleLabel = 'Purchase Mgr';
    }

    return (
      <div className={`flex items-center justify-between p-2 rounded-xl border text-xs ${badgeBg}`}>
        <div className="flex items-center gap-1.5 min-w-0">
          {icon}
          <span className="font-semibold text-[11px] truncate">{roleLabel}:</span>
        </div>
        <span className="font-bold truncate text-[11px] ml-1">{name}</span>
      </div>
    );
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
              <p className="text-slate-500 text-xs mt-1">
                Monitor facility capacity limits, 1-1 dedicated manager hierarchy (Warehouse, Sales, Stock, Inventory, Purchase), and assigned floor employees.
              </p>
            </div>

            {isAdmin && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer transition-all"
              >
                <Plus className="w-4 h-4" /> Add New Warehouse
              </button>
            )}
          </div>

          {/* Warehouse Cards Grid or Skeleton */}
          {loading ? (
            <CardGridSkeleton count={6} />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {warehouses.map((wh) => {
              const mgrs = wh.assigned_managers || {};
              const empCount = wh.employee_count || wh.employees?.length || 3;

              return (
                <div key={wh.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:shadow-md transition-shadow flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* Header line */}
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

                    {/* Managers Matrix (1-1 per role) */}
                    <div className="space-y-2 pt-2 border-t border-slate-100">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <UserCheck className="w-3.5 h-3.5 text-blue-600" /> Dedicated Managers (5 Roles)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-1.5">
                        {getManagerBadge('WarehouseManager', mgrs.WarehouseManager, wh.manager_name)}
                        {getManagerBadge('SalesManager', mgrs.SalesManager)}
                        {getManagerBadge('StockManager', mgrs.StockManager)}
                        {getManagerBadge('InventoryManager', mgrs.InventoryManager)}
                        {getManagerBadge('PurchaseManager', mgrs.PurchaseManager)}
                      </div>
                    </div>

                    {/* Employee Count */}
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                      <span className="flex items-center gap-1.5 font-bold text-slate-700">
                        <HardHat className="w-4 h-4 text-amber-600" /> Floor Staff Employees:
                      </span>
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-extrabold rounded-lg text-xs">
                        {empCount} Active Staff
                      </span>
                    </div>
                  </div>

                  {/* Team Details & Admin Action Trigger */}
                  <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                    <button
                      onClick={() => setSelectedStaffWarehouse(wh)}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200/80 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-600" /> Staff ({5 + empCount})
                    </button>

                    {isAdmin && (
                      <>
                        <button
                          onClick={() => handleOpenEditModal(wh)}
                          title="Edit Warehouse Details"
                          className="p-2 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteWarehouse(wh)}
                          title="Delete Warehouse"
                          className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          )}

          {/* Full Staff Directory Modal */}
          {selectedStaffWarehouse && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-xl shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {selectedStaffWarehouse.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">{selectedStaffWarehouse.name} Staff Hierarchy</h3>
                  </div>
                  <button
                    onClick={() => setSelectedStaffWarehouse(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* 1-1 Managers Section */}
                <div className="space-y-3">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-4 h-4 text-blue-600" /> Dedicated Management Team (1-1 per Role)
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { roleKey: 'WarehouseManager', title: 'Warehouse Manager', color: 'border-l-blue-500 bg-blue-50/30' },
                      { roleKey: 'SalesManager', title: 'Sales Manager', color: 'border-l-emerald-500 bg-emerald-50/30' },
                      { roleKey: 'StockManager', title: 'Stock Manager', color: 'border-l-amber-500 bg-amber-50/30' },
                      { roleKey: 'InventoryManager', title: 'Inventory Manager', color: 'border-l-purple-500 bg-purple-50/30' },
                      { roleKey: 'PurchaseManager', title: 'Purchase Manager', color: 'border-l-indigo-500 bg-indigo-50/30' },
                    ].map(({ roleKey, title, color }) => {
                      const m = selectedStaffWarehouse.assigned_managers?.[roleKey as keyof typeof selectedStaffWarehouse.assigned_managers];
                      const name = m?.full_name || m?.username || 'Assigned Manager';
                      return (
                        <div key={roleKey} className={`p-3 rounded-xl border border-slate-200 border-l-4 ${color} space-y-0.5`}>
                          <span className="text-[10px] font-bold text-slate-500 uppercase">{title}</span>
                          <div className="font-bold text-slate-900 text-xs">{name}</div>
                          <div className="text-[11px] text-slate-400 font-mono">@{m?.username || 'manager'}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Employees Section */}
                <div className="space-y-3 pt-3 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <HardHat className="w-4 h-4 text-amber-600" /> Warehouse Floor Employees
                    </span>
                    <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-lg">
                      {selectedStaffWarehouse.employee_count || selectedStaffWarehouse.employees?.length || 3} Staff Members
                    </span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {(selectedStaffWarehouse.employees || []).map((emp, idx) => (
                      <div key={emp.id || idx} className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center gap-2 text-xs">
                        <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-700 text-xs">
                          {idx + 1}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{emp.full_name || emp.username}</div>
                          <div className="text-[10px] text-slate-400 font-mono truncate">@{emp.username}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedStaffWarehouse(null)}
                    className="px-4 py-2 bg-slate-900 text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
                  >
                    Close Staff Directory
                  </button>
                </div>
              </div>
            </div>
          )}

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
                    <label className="block font-bold text-slate-700 mb-1">Assign Primary Warehouse Manager</label>
                    <select
                      value={formData.manager_id}
                      onChange={(e) => setFormData({ ...formData, manager_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Auto-provision Management Team</option>
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

          {/* Edit Warehouse Modal */}
          {selectedEditWarehouse && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                      {selectedEditWarehouse.code}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mt-1">Edit Warehouse Facility</h3>
                  </div>
                  <button
                    onClick={() => setSelectedEditWarehouse(null)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleEditWarehouseSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Warehouse Name</label>
                    <input
                      type="text"
                      required
                      value={editFormData.name}
                      onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Location Address</label>
                      <input
                        type="text"
                        required
                        value={editFormData.location}
                        onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Max Capacity (Units)</label>
                      <input
                        type="number"
                        required
                        value={editFormData.capacity}
                        onChange={(e) => setEditFormData({ ...editFormData, capacity: parseInt(e.target.value) || 10000 })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Assign Primary Warehouse Manager</label>
                    <select
                      value={editFormData.manager_id}
                      onChange={(e) => setEditFormData({ ...editFormData, manager_id: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Keep Existing Dedicated Managers</option>
                      {managers.map(m => (
                        <option key={m.id} value={m.id}>{m.full_name || m.username}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => setSelectedEditWarehouse(null)}
                      className="px-4 py-2 bg-slate-100 text-slate-600 rounded-xl font-bold cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-500 shadow-md shadow-blue-600/20 cursor-pointer"
                    >
                      Update Warehouse
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
