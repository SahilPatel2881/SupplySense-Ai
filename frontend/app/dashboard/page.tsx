'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import DemandLineChart from '../../components/charts/DemandLineChart';
import { useAuth } from '../../context/AuthContext';
import { BusinessInsightsData, ForecastData } from '../../types';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Award,
  Zap,
  Building2,
  BrainCircuit,
  ArrowUpRight,
  Boxes,
  Truck,
  Receipt,
  PackageCheck
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAdmin, isWarehouseManager, isInventoryManager, isStockManager, isPurchaseManager, isSalesManager } = useAuth();
  const [insights, setInsights] = useState<BusinessInsightsData | null>(null);
  const [forecast, setForecast] = useState<ForecastData | null>(null);
  const [lowStockList, setLowStockList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [insightsRes, forecastRes, lowStockRes] = await Promise.all([
        api.get('/ai/business-insights/'),
        api.get('/ai/forecast-demand/?model=random_forest&days=30'),
        api.get('/ai/low-stock-predict/')
      ]);
      setInsights(insightsRes.data);
      setForecast(forecastRes.data);
      setLowStockList(lowStockRes.data.filter((i: any) => i.is_low_stock));
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setLoading(false);
    }
  };

  const getRoleHeader = () => {
    if (isAdmin) return { title: 'Executive Command Center', subtitle: 'Company-wide KPIs, AI Insights, Total Revenue, and System Administration', icon: Zap };
    if (isWarehouseManager) return { title: 'Warehouse Operations Console', subtitle: 'Site Telemetry, Inventory Levels, Stock Intake, and Invoices', icon: Building2 };
    if (isInventoryManager) return { title: 'Inventory Accuracy & Audit Hub', subtitle: 'Stock Level Accuracy, Audit Records, and Reorder Threshold Monitoring', icon: Boxes };
    if (isStockManager) return { title: 'Physical Stock Handling Console', subtitle: 'Daily Stock In/Out, Inter-Warehouse Transfers, and Scanning Operations', icon: Boxes };
    if (isPurchaseManager) return { title: 'Procurement & Supplier Center', subtitle: 'Supplier Performance, Purchase Orders, Quotations, and Delivery Tracking', icon: Truck };
    if (isSalesManager) return { title: 'Sales & Revenue Console', subtitle: 'Outward Transactions, Customer Billing, Order Tracking, and PDF Invoices', icon: Receipt };
    return { title: "Daily Warehouse Floor Console", subtitle: "Assigned Receiving, Product Picking, Packing, and Barcode Scanning", icon: PackageCheck };
  };

  const roleHeader = getRoleHeader();
  const HeaderIcon = roleHeader.icon;

  return (
    <DashboardLayout>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30 mb-2">
            <HeaderIcon className="w-3.5 h-3.5 text-blue-400" /> Role Scope: {user?.role || 'Guest'}
          </span>
          <h2 className="text-2xl font-extrabold tracking-tight">{roleHeader.title}</h2>
          <p className="text-slate-300 text-sm mt-1">{roleHeader.subtitle}</p>
        </div>
        
        {(isAdmin || isSalesManager || isWarehouseManager) && (
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
            <div>
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Total Company Revenue</p>
              <p className="text-2xl font-black text-emerald-400">${insights?.total_company_revenue?.toLocaleString() || '0.00'}</p>
            </div>
          </div>
        )}
      </div>

      {/* AI Insights / Focus Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Most Sold Product</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 truncate">{insights?.most_sold_product?.name || 'N/A'}</h3>
          <p className="text-xs text-blue-600 font-semibold mt-1">{insights?.most_sold_product?.qty || 0} Units Sold</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Revenue Product</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 truncate">{insights?.highest_revenue_product?.name || 'N/A'}</h3>
          <p className="text-xs text-emerald-600 font-semibold mt-1">${insights?.highest_revenue_product?.revenue?.toLocaleString() || '0.00'} Generated</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Best Warehouse</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Building2 className="w-5 h-5" /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 truncate">{insights?.best_warehouse?.name || 'N/A'}</h3>
          <p className="text-xs text-purple-600 font-semibold mt-1">${insights?.best_warehouse?.revenue?.toLocaleString() || '0.00'} Revenue</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fast Moving Category</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Award className="w-5 h-5" /></div>
          </div>
          <h3 className="text-lg font-bold text-slate-900 truncate">{insights?.fast_moving_category || 'N/A'}</h3>
          <p className="text-xs text-amber-600 font-semibold mt-1">High Velocity Demand</p>
        </div>
      </div>

      {/* Main Grid: Forecast Chart & Low Stock Recommendations */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ML Demand Forecast Line Chart */}
        <div className="lg:col-span-2 space-y-4">
          <DemandLineChart
            historicalData={forecast?.historical}
            forecastData={forecast?.forecast}
            modelName="Random Forest Regressor"
          />
        </div>

        {/* Low Stock AI Alert Panel */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                AI Reorder Alerts ({lowStockList.length})
              </h3>
              <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                Action Required
              </span>
            </div>

            <div className="divide-y divide-slate-100 mt-2 max-h-[300px] overflow-y-auto">
              {lowStockList.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">All inventory stock levels are healthy.</p>
              ) : (
                lowStockList.map((item) => (
                  <div key={item.product_id} className="py-3 text-xs">
                    <div className="flex justify-between font-bold text-slate-800">
                      <span>{item.product_name}</span>
                      <span className="text-rose-600 font-semibold">{item.current_stock} {item.unit} left</span>
                    </div>
                    <div className="flex justify-between text-slate-500 mt-1">
                      <span>Reorder Point: {item.reorder_point}</span>
                      <span className="font-semibold text-blue-600">Rec. EOQ: +{item.recommended_reorder_qty}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-center">
            <a href="/inventory" className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700">
              Manage Inventory Stock <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
