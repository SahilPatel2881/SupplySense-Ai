'use client';

import React from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import { FileText, Download, Table, FileSpreadsheet, ShieldAlert } from 'lucide-react';

import { API_BASE_URL } from '../../lib/api';

export default function ReportsPage() {
  const handleDownloadCSV = (reportType: string, filename: string) => {
    const url = `${API_BASE_URL}/reports/${reportType}/`;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => response.blob())
      .then(blob => {
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        link.remove();
      })
      .catch(() => alert('Failed to export CSV report'));
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Header */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" /> Enterprise Reports & CSV Exports
            </h2>
            <p className="text-slate-500 text-xs mt-1">Export raw Pandas inventory valuations, sales summaries, and supplier reliability audit logs.</p>
          </div>

          {/* Reports Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl w-fit mb-3">
                  <FileSpreadsheet className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Inventory Valuation Report</h3>
                <p className="text-xs text-slate-500 mt-1">Export complete inventory stock levels, unit costs, min thresholds, and valuation figures.</p>
              </div>
              <button
                onClick={() => handleDownloadCSV('inventory', 'Inventory_Valuation_Report.csv')}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Inventory CSV
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl w-fit mb-3">
                  <Table className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Sales Summary Export</h3>
                <p className="text-xs text-slate-500 mt-1">Export sales transaction audit logs, total revenues, dispatch warehouses, and billing statuses.</p>
              </div>
              <button
                onClick={() => handleDownloadCSV('sales', 'Sales_Summary_Report.csv')}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Sales CSV
              </button>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between">
              <div>
                <div className="p-3 bg-purple-50 text-purple-600 rounded-xl w-fit mb-3">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-slate-900">Supplier Reliability Report</h3>
                <p className="text-xs text-slate-500 mt-1">Export supplier scorecard metrics, lead times, defect rates, and reliability rankings.</p>
              </div>
              <button
                onClick={() => handleDownloadCSV('suppliers', 'Supplier_Reliability_Report.csv')}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Download className="w-4 h-4" /> Download Supplier CSV
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
