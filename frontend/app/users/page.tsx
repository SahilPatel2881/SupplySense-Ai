'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { User, Warehouse } from '../../types';
import { Users, Plus } from 'lucide-react';

export default function UsersPage() {
  const { isAdmin } = useAuth();
  const [usersList, setUsersList] = useState<User[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    full_name: '',
    role: 'WarehouseManager',
    assigned_warehouse_id: ''
  });

  useEffect(() => {
    fetchUsers();
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

  const fetchUsers = async () => {
    try {
      const [uRes, whRes] = await Promise.all([
        api.get('/users/'),
        api.get('/warehouses/')
      ]);
      setUsersList(uRes.data);
      setWarehouses(whRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load users:', err);
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users/', formData);
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Failed to create user');
    }
  };

  if (!isAdmin && !loading) {
    return (
      <div className="flex min-h-screen bg-slate-50">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Navbar />
          <main className="flex-1 overflow-y-auto p-6 flex items-center justify-center max-w-7xl mx-auto w-full">
            <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-md text-center max-w-md space-y-4">
              <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto font-black text-xl">
                403
              </div>
              <h3 className="text-lg font-extrabold text-slate-900">Admin Privileges Required</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                User management and system-wide RBAC controls are restricted to System Administrators. As a Warehouse Manager, you have operational access to your assigned warehouse.
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                <Users className="w-6 h-6 text-blue-600" /> User & RBAC Access Management
              </h2>
              <p className="text-slate-500 text-xs mt-1">Manage system user credentials, role assignments (Admin / Warehouse Manager), and site scope.</p>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Create User Account
            </button>
          </div>

          {/* Users Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-bold tracking-wider border-b border-slate-200">
                  <th className="p-4">User Details</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">System Role</th>
                  <th className="p-4">Assigned Warehouse</th>
                  <th className="p-4">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {usersList.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/80">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{u.full_name || u.username}</div>
                      <span className="text-[10px] text-slate-400 font-mono">@{u.username}</span>
                    </td>
                    <td className="p-4">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border ${u.role === 'Admin' ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="p-4 font-medium">{u.assigned_warehouse_name || 'System Wide'}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${u.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'}`}>
                        {u.is_active ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Add Modal */}
          {showAddModal && (
            <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in">
              <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl border border-slate-200 space-y-4">
                <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">Create User Credentials</h3>

                <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Username</label>
                      <input
                        type="text"
                        required
                        value={formData.username}
                        onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Password</label>
                      <input
                        type="password"
                        required
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Role</label>
                      <select
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500 font-bold"
                      >
                        <option value="WarehouseManager">Warehouse Manager</option>
                        <option value="Admin">Admin</option>
                      </select>
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Assigned Warehouse</label>
                      <select
                        value={formData.assigned_warehouse_id}
                        onChange={(e) => setFormData({ ...formData, assigned_warehouse_id: e.target.value })}
                        className="w-full p-2 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                      >
                        <option value="">System Wide (All)</option>
                        {warehouses.map(w => (
                          <option key={w.id} value={w.id}>{w.name}</option>
                        ))}
                      </select>
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
                      Create User
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
