'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { DashboardStats } from '../../types';
import {
  TrendingUp,
  DollarSign,
  AlertTriangle,
  Zap,
  Building2,
  Boxes,
  Truck,
  Receipt,
  PackageCheck,
  Package,
  ShoppingCart,
  ArrowUpRight,
  Award,
  Users
} from 'lucide-react';

export default function DashboardPage() {
  const { user, isAdmin, isWarehouseManager, isInventoryManager, isStockManager, isPurchaseManager, isSalesManager } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const res = await api.get('/dashboard/stats/');
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setLoading(false);
    }
  };

  const getRoleHeader = () => {
    if (isAdmin) return { title: 'Executive Command Center', subtitle: 'Company-wide KPIs, Total Revenue, System Telemetry, and User Management', icon: Zap };
    if (isWarehouseManager) return { title: 'Warehouse Operations Console', subtitle: 'Site Telemetry, Inventory Levels, Stock Intake, and Invoices', icon: Building2 };
    if (isInventoryManager) return { title: 'Inventory Accuracy & Audit Hub', subtitle: 'Stock Level Accuracy, Audit Records, and Reorder Threshold Monitoring', icon: Boxes };
    if (isStockManager) return { title: 'Physical Stock Handling Console', subtitle: 'Daily Stock In/Out, Inter-Warehouse Transfers, and Scanning Operations', icon: Boxes };
    if (isPurchaseManager) return { title: 'Procurement & Supplier Center', subtitle: 'Supplier Performance, Purchase Orders, Quotations, and Delivery Tracking', icon: Truck };
    if (isSalesManager) return { title: 'Sales & Revenue Console', subtitle: 'Outward Transactions, Customer Billing, Order Tracking, and Invoices', icon: Receipt };
    return { title: "Daily Warehouse Floor Console", subtitle: "Assigned Receiving, Product Picking, Packing, and Barcode Scanning", icon: PackageCheck };
  };

  const roleHeader = getRoleHeader();
  const HeaderIcon = roleHeader.icon;
  const kpis = stats?.summary_kpis;

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
              <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">Total Revenue</p>
              <p className="text-2xl font-black text-emerald-400">
                {kpis?.total_revenue ? `₹${kpis.total_revenue.toLocaleString('en-IN')}` : "No Sales Recorded Yet"}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Role-Specific KPI Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
            <p className="text-xl font-extrabold text-slate-900">{kpis?.total_products || "No Products"}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building2 className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warehouses</p>
            <p className="text-xl font-extrabold text-slate-900">{kpis?.total_warehouses || "No Warehouses"}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Truck className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suppliers</p>
            <p className="text-xl font-extrabold text-slate-900">{kpis?.total_suppliers || "No Suppliers"}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Boxes className="w-5 h-5" /></div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Units</p>
            <p className="text-xl font-extrabold text-slate-900">
              {kpis?.total_inventory ? kpis.total_inventory.toLocaleString('en-IN') : "No Stock Available"}
            </p>
          </div>
        </div>
      </div>

      {/* Business Performance Highlights */}
      {(isAdmin || isWarehouseManager || isSalesManager) && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Most Sold Product</span>
              <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><TrendingUp className="w-5 h-5" /></div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {stats?.best_selling_product?.name || 'No Sales Recorded Yet'}
            </h3>
            <p className="text-xs text-blue-600 font-semibold mt-1">
              {stats?.best_selling_product?.qty ? `${stats.best_selling_product.qty} Units Sold` : 'No Sales Data'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Top Revenue Product</span>
              <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><DollarSign className="w-5 h-5" /></div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {stats?.highest_revenue_product?.name || 'No Sales Recorded Yet'}
            </h3>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {stats?.highest_revenue_product?.revenue ? `₹${stats.highest_revenue_product.revenue.toLocaleString('en-IN')}` : 'No Revenue Data'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Best Warehouse</span>
              <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Building2 className="w-5 h-5" /></div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {stats?.best_warehouse?.name || 'No Warehouse Sales Yet'}
            </h3>
            <p className="text-xs text-purple-600 font-semibold mt-1">
              {stats?.best_warehouse?.revenue ? `₹${stats.best_warehouse.revenue.toLocaleString('en-IN')}` : 'No Sales Recorded'}
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between text-slate-500 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Fast Moving Category</span>
              <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Award className="w-5 h-5" /></div>
            </div>
            <h3 className="text-lg font-bold text-slate-900 truncate">
              {stats?.fast_moving_category || 'No Category Sales Yet'}
            </h3>
            <p className="text-xs text-amber-600 font-semibold mt-1">High Velocity Category</p>
          </div>
        </div>
      )}

      {/* Main Content Grid: Low Stock Reorder Table & Recent Activity Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Reorder Table */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="font-bold text-slate-900 flex items-center gap-2 text-base">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Low Stock Reorder Alerts ({stats?.low_stock_items?.length || 0})
            </h3>
            <a href="/inventory" className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">
              Manage Stock <ArrowUpRight className="w-4 h-4" />
            </a>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-3 rounded-l-lg">Product</th>
                  <th className="p-3">SKU</th>
                  <th className="p-3">Current Stock</th>
                  <th className="p-3">Reorder Point</th>
                  <th className="p-3 rounded-r-lg">Supplier</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {!stats?.low_stock_items || stats.low_stock_items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">All inventory stock levels are healthy.</td>
                  </tr>
                ) : (
                  stats.low_stock_items.map((item) => (
                    <tr key={item.product_id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3 font-bold text-slate-900">{item.product_name}</td>
                      <td className="p-3 font-mono text-slate-500">{item.sku}</td>
                      <td className="p-3 font-bold text-rose-600">{item.current_stock} {item.unit}</td>
                      <td className="p-3 text-slate-500">{item.reorder_point} {item.unit}</td>
                      <td className="p-3 text-slate-600 font-medium">{item.supplier_name}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Operational Activity Lists */}
        <div className="space-y-6">
          {/* Purchase Orders List */}
          {(isAdmin || isPurchaseManager || isWarehouseManager) && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <ShoppingCart className="w-4 h-4 text-blue-600" /> Recent Purchase Orders
                </h3>
                <a href="/purchase-orders" className="text-[11px] font-bold text-blue-600 hover:underline">View All</a>
              </div>
              <div className="space-y-2.5">
                {!stats?.recent_purchase_orders || stats.recent_purchase_orders.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No Purchase Orders Created Yet</p>
                ) : (
                  stats.recent_purchase_orders.map((po) => (
                    <div key={po.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-800">{po.po_number}</p>
                        <p className="text-[10px] text-slate-500">{po.supplier_name}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-slate-900 block">₹{po.total_amount?.toLocaleString('en-IN')}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                          po.status === 'APPROVED' || po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                        }`}>{po.status}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Sales Invoices List */}
          {(isAdmin || isSalesManager || isWarehouseManager) && (
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                <h3 className="font-bold text-slate-900 flex items-center gap-2 text-sm">
                  <Receipt className="w-4 h-4 text-emerald-600" /> Recent Sales Invoices
                </h3>
                <a href="/sales" className="text-[11px] font-bold text-blue-600 hover:underline">View All</a>
              </div>
              <div className="space-y-2.5">
                {!stats?.recent_sales || stats.recent_sales.length === 0 ? (
                  <p className="text-xs text-slate-400 py-4 text-center">No Sales Invoices Recorded Yet</p>
                ) : (
                  stats.recent_sales.map((sale) => (
                    <div key={sale.id} className="flex justify-between items-center text-xs p-2.5 bg-slate-50 rounded-xl">
                      <div>
                        <p className="font-bold text-slate-800">{sale.invoice_number}</p>
                        <p className="text-[10px] text-slate-500">{sale.customer_name}</p>
                      </div>
                      <span className="font-bold text-emerald-600">₹{sale.total_amount?.toLocaleString('en-IN')}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
