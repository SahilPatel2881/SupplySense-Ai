'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Settings, ShieldCheck, Database, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
  const isFounderOrAdmin = ['Founder', 'Admin'].includes(user?.role || '');
  const [saved, setSaved] = useState(false);
  const [config, setConfig] = useState({
    defaultReorderDays: 30,
    serviceLevelZ: 1.65,
    enableAutoNotifications: true,
    enableBarcodeScans: true,
    currencySymbol: '₹',
    lowStockThresholdDefault: 20
  });

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFounderOrAdmin) {
      alert('Only Founder and Admins can update system settings.');
      return;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roleMatrix = [
    { role: 'Founder / Admin', scope: 'All Modules', reportsTo: 'Executive Board', focus: 'Full system control across all 13 modules' },
    { role: 'Warehouse Manager', scope: 'Assigned Warehouse', reportsTo: 'Founder / Admin', focus: 'Dashboard, Assigned WH, Categories (View), Products (View), Suppliers (View), Inventory, POs (View/Receive), Sales, WH Reports, Low Stock AI' },
    { role: 'Inventory Manager', scope: 'Inventory System-wide', reportsTo: 'Founder / Admin', focus: 'Dashboard, Categories (View), Product Catalog, Inventory, POs (View), Inventory Reports, Low Stock AI' },
    { role: 'Stock Manager', scope: 'Physical Floor Stock', reportsTo: 'Inventory Manager', focus: 'Daily Stock In/Out, Inter-Warehouse Transfers, Barcode Scans & Stock Movements' },
    { role: 'Purchase Manager', scope: 'Procurement Pipeline', reportsTo: 'Founder / Admin', focus: 'Dashboard, Products (View), Suppliers, Inventory (Receive), Purchase Orders, Purchase Reports' },
    { role: 'Sales Manager', scope: 'Revenue & Sales', reportsTo: 'Founder / Admin', focus: 'Dashboard, Categories (View), Products (View), Inventory (View), Sales Management, Sales Reports, Sales Summary AI' },
    { role: 'Warehouse Employee', scope: 'Assigned Floor', reportsTo: 'Warehouse Manager', focus: 'Dashboard, Assigned WH Inventory (Limited), Notifications' },
  ];

  if (!isFounderOrAdmin) {
    return (
      <DashboardLayout>
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center space-y-3 my-12 max-w-xl mx-auto">
          <ShieldCheck className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-slate-900">Access Restricted</h2>
          <p className="text-xs text-slate-500">System Settings is restricted strictly to Founder and Admin users. Your role ({user?.role}) does not have permission to modify system configuration.</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" /> System Settings & 7-Role Matrix
          </h2>
          <p className="text-slate-500 text-xs mt-1">Configure global supply chain rules, threshold parameters, and review active role permission matrix.</p>
        </div>
        <span className="px-3 py-1 bg-slate-100 text-slate-700 font-mono font-bold text-xs rounded-lg border border-slate-200">
          User Role: {user?.role}
        </span>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Settings updated successfully!
        </div>
      )}

      {/* Configuration Form */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
            <Sliders className="w-5 h-5 text-blue-600" /> Supply Chain Algorithm Parameters
          </h3>

          <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Forecast Horizon (Days)</label>
              <input
                type="number"
                value={config.defaultReorderDays}
                onChange={(e) => setConfig({ ...config, defaultReorderDays: parseInt(e.target.value) || 30 })}
                style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a', opacity: 1, fontWeight: 700 }}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Service Level Confidence Z-Factor (EOQ Safety Stock)</label>
              <input
                type="number"
                step="0.05"
                value={config.serviceLevelZ}
                onChange={(e) => setConfig({ ...config, serviceLevelZ: parseFloat(e.target.value) || 1.65 })}
                style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a', opacity: 1, fontWeight: 700 }}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Low Stock Threshold (Units)</label>
              <input
                type="number"
                value={config.lowStockThresholdDefault}
                onChange={(e) => setConfig({ ...config, lowStockThresholdDefault: parseInt(e.target.value) || 20 })}
                style={{ color: '#0f172a', backgroundColor: '#ffffff', WebkitTextFillColor: '#0f172a', opacity: 1, fontWeight: 700 }}
                className="w-full p-2.5 border border-slate-300 rounded-xl font-extrabold focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
              />
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableAutoNotifications}
                  onChange={(e) => setConfig({ ...config, enableAutoNotifications: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Automated Low-Stock System Notifications</span>
              </label>

              <label className="flex items-center gap-2 font-bold text-slate-800 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.enableBarcodeScans}
                  onChange={(e) => setConfig({ ...config, enableBarcodeScans: e.target.checked })}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
                />
                <span>Enable Optical Barcode Laser Scanner Simulation</span>
              </label>
            </div>

            {isAdmin ? (
              <button
                type="submit"
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                Save System Parameters
              </button>
            ) : (
              <div className="p-3 bg-amber-50 text-amber-800 rounded-xl border border-amber-200 font-semibold text-[11px] flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" /> Configuration parameters can only be saved by System Administrators.
              </div>
            )}
          </form>
        </div>

        {/* Database & MongoDB Details */}
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Database Engine Infrastructure</span>
          <h3 className="text-xl font-extrabold flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" /> MongoEngine ODM Telemetry
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Database Target:</span>
              <span className="font-mono font-bold text-emerald-400">supplysense_db (MongoDB)</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
              <span className="text-slate-400 font-medium">JWT Secret Protocol:</span>
              <span className="font-mono text-blue-400 font-bold">SimpleJWT + MongoUserProxy</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
              <span className="text-slate-400 font-medium">ML Engine Framework:</span>
              <span className="font-mono text-purple-400 font-bold">Scikit-learn + Pandas</span>
            </div>
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 flex justify-between items-center">
              <span className="text-slate-400 font-medium">Frontend Framework:</span>
              <span className="font-mono text-amber-400 font-bold">Next.js 14+ App Router & TS</span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Role Permission Matrix Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" /> Enterprise 7-Role Access Matrix
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase text-[11px] font-extrabold tracking-wider border-b border-slate-200">
                <th className="p-3">Role Name</th>
                <th className="p-3">Access Scope</th>
                <th className="p-3">Reports To</th>
                <th className="p-3">Primary Focus & Operational Responsibilities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {roleMatrix.map((r, idx) => (
                <tr key={idx} className="hover:bg-slate-50/80">
                  <td className="p-3 font-bold text-slate-900 flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${r.role === 'Admin' ? 'bg-amber-500' : r.role.includes('Manager') ? 'bg-blue-500' : 'bg-emerald-500'}`} />
                    {r.role}
                  </td>
                  <td className="p-3 font-medium text-blue-600">{r.scope}</td>
                  <td className="p-3 font-medium text-slate-500">{r.reportsTo}</td>
                  <td className="p-3 text-slate-600 font-medium">{r.focus}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
