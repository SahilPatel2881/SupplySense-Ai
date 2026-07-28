'use client';

import React, { useState } from 'react';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { Settings, ShieldCheck, Database, Sliders, CheckCircle2, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { user, isAdmin } = useAuth();
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
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const roleMatrix = [
    { role: 'Admin', scope: 'All System Modules', reportsTo: 'Executive Board', focus: 'Company KPIs, Executive Dashboard, Users, System Config' },
    { role: 'Warehouse Manager', scope: 'Assigned Warehouse', reportsTo: 'Admin', focus: 'Site Telemetry, Inventory, PO Stock Intake, Invoices' },
    { role: 'Inventory Manager', scope: 'Inventory Records', reportsTo: 'Warehouse Manager', focus: 'Stock Levels, Audit Records, Minimum Stock Thresholds' },
    { role: 'Stock Manager', scope: 'Physical Stock Floor', reportsTo: 'Inventory Manager', focus: 'Stock In/Out, Inter-Warehouse Transfers, Barcode Scanning' },
    { role: 'Purchase Manager', scope: 'Procurement Pipeline', reportsTo: 'Admin', focus: 'Suppliers, Purchase Orders, Quotations & Delivery Track' },
    { role: 'Sales Manager', scope: 'Revenue & Billing', reportsTo: 'Admin', focus: 'Point-of-Sale Transactions, PDF Invoices, Customer Records' },
    { role: 'Warehouse Employee', scope: 'Floor Operations', reportsTo: 'Warehouse Manager', focus: 'Receiving Goods, Order Picking, Packing & Scanner Checks' }
  ];

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
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Service Level Confidence Z-Factor (EOQ Safety Stock)</label>
              <input
                type="number"
                step="0.05"
                value={config.serviceLevelZ}
                onChange={(e) => setConfig({ ...config, serviceLevelZ: parseFloat(e.target.value) || 1.65 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-mono"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Default Low Stock Threshold (Units)</label>
              <input
                type="number"
                value={config.lowStockThresholdDefault}
                onChange={(e) => setConfig({ ...config, lowStockThresholdDefault: parseInt(e.target.value) || 20 })}
                className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
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
