'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import {
  BrainCircuit,
  Lock,
  User as UserIcon,
  ArrowRight,
  ShieldCheck,
  Building2,
  Boxes,
  Truck,
  Receipt,
  UserCheck,
  Package
} from 'lucide-react';

export default function LoginPage() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const { login, loading, error } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await login(username, password);
    if (result.success) {
      router.push('/dashboard');
    }
  };

  const handleQuickLogin = (userStr: string, passStr: string) => {
    setUsername(userStr);
    setPassword(passStr);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Glows */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Brand */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3.5 bg-blue-600 rounded-2xl text-white shadow-xl shadow-blue-500/30 mb-3">
            <BrainCircuit className="w-9 h-9 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SupplySense AI</h1>
          <p className="text-xs text-slate-400 mt-1">Enterprise Supply Chain & 7-Role Hierarchy Management</p>
        </div>

        {/* Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-7 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="mb-5 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Username / Email</label>
              <div className="relative">
                <UserIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-medium transition-all"
                  placeholder="Enter username"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-xs font-medium transition-all"
                  placeholder="Enter password"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center gap-2 text-xs disabled:opacity-50 cursor-pointer"
            >
              {loading ? 'Authenticating...' : 'Sign In to Console'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Role Selectors */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
            <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold text-center mb-2">Test Enterprise Roles (One-Click Preset)</p>
            
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="p-2 bg-slate-800 hover:bg-amber-500/20 hover:border-amber-500/40 text-amber-400 rounded-xl font-semibold border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 shrink-0 text-amber-400" />
                <div className="text-left min-w-0">
                  <p className="font-bold leading-none">Admin</p>
                  <span className="text-[9px] text-slate-400 font-normal">Full System Access</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('manager1', 'manager123')}
                className="p-2 bg-slate-800 hover:bg-blue-500/20 hover:border-blue-500/40 text-blue-400 rounded-xl font-semibold border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Building2 className="w-4 h-4 shrink-0 text-blue-400" />
                <div className="text-left min-w-0">
                  <p className="font-bold leading-none">Warehouse Mgr</p>
                  <span className="text-[9px] text-slate-400 font-normal">CDC Site Operations</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('inv_manager', 'manager123')}
                className="p-2 bg-slate-800 hover:bg-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 rounded-xl font-semibold border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Boxes className="w-4 h-4 shrink-0 text-emerald-400" />
                <div className="text-left min-w-0">
                  <p className="font-bold leading-none">Inventory Mgr</p>
                  <span className="text-[9px] text-slate-400 font-normal">Audits & Accuracy</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('stock_manager', 'manager123')}
                className="p-2 bg-slate-800 hover:bg-purple-500/20 hover:border-purple-500/40 text-purple-400 rounded-xl font-semibold border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Package className="w-4 h-4 shrink-0 text-purple-400" />
                <div className="text-left min-w-0">
                  <p className="font-bold leading-none">Stock Manager</p>
                  <span className="text-[9px] text-slate-400 font-normal">Stock In/Out & Transfers</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('purchase_mgr', 'manager123')}
                className="p-2 bg-slate-800 hover:bg-cyan-500/20 hover:border-cyan-500/40 text-cyan-400 rounded-xl font-semibold border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Truck className="w-4 h-4 shrink-0 text-cyan-400" />
                <div className="text-left min-w-0">
                  <p className="font-bold leading-none">Purchase Mgr</p>
                  <span className="text-[9px] text-slate-400 font-normal">Suppliers & PO Track</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sales_mgr', 'manager123')}
                className="p-2 bg-slate-800 hover:bg-teal-500/20 hover:border-teal-500/40 text-teal-400 rounded-xl font-semibold border border-slate-700/80 flex items-center gap-2 transition-all cursor-pointer"
              >
                <Receipt className="w-4 h-4 shrink-0 text-teal-400" />
                <div className="text-left min-w-0">
                  <p className="font-bold leading-none">Sales Manager</p>
                  <span className="text-[9px] text-slate-400 font-normal">Sales, Invoices & Customers</span>
                </div>
              </button>
            </div>

            <button
              type="button"
              onClick={() => handleQuickLogin('employee1', 'manager123')}
              className="w-full p-2 bg-slate-800 hover:bg-indigo-500/20 hover:border-indigo-500/40 text-indigo-400 rounded-xl font-semibold border border-slate-700/80 flex items-center justify-center gap-2 transition-all cursor-pointer mt-1"
            >
              <UserCheck className="w-4 h-4 text-indigo-400" />
              <span>Warehouse Employee (Daily Floor Operations & Picking)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
