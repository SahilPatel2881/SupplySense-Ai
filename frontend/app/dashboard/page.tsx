'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import DashboardLayout from '../../components/DashboardLayout';
import { KPIGridSkeleton, ChartGridSkeleton, TableSkeleton } from '../../components/SkeletonLoader';
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
  Users,
  PieChart,
  BarChart2,
  Plus,
  FileText,
  Sliders,
  Layers
} from 'lucide-react';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export default function DashboardPage() {
  const { user, isAdmin, isWarehouseManager, isInventoryManager, isStockManager, isPurchaseManager, isSalesManager, isWarehouseEmployee, assignedWarehouseName } = useAuth();
  const [stats, setStats] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string>('ALL');

  useEffect(() => {
    if (isAdmin) {
      api.get('/warehouses/').then((res) => {
        setWarehouses(Array.isArray(res.data) ? res.data : []);
      }).catch(console.error);
    }
  }, [isAdmin]);

  const fetchDashboardStats = async (whId = selectedWarehouseId) => {
    try {
      setLoading(true);
      const params = whId && whId !== 'ALL' ? { warehouse_id: whId } : {};
      const res = await api.get('/dashboard/stats/', { params });
      setStats(res.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats(selectedWarehouseId);
  }, [selectedWarehouseId]);

  const handleWarehouseFilterChange = (whId: string) => {
    setSelectedWarehouseId(whId);
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

  const getRoleQuickActions = () => {
    if (isAdmin) {
      return [
        { label: 'Manage Users', href: '/users', icon: Users, color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
        { label: 'System Settings', href: '/settings', icon: Sliders, color: 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300' },
        { label: 'Warehouses', href: '/warehouses', icon: Building2, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
        { label: 'Enterprise Reports', href: '/reports', icon: FileText, color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
      ];
    }
    if (isWarehouseManager) {
      return [
        { label: 'Assigned Warehouse', href: '/warehouses', icon: Building2, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
        { label: 'Manage Inventory', href: '/inventory', icon: Boxes, color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
        { label: 'Sales Invoices', href: '/sales', icon: Receipt, color: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200' },
        { label: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart, color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
      ];
    }
    if (isInventoryManager) {
      return [
        { label: 'Products Catalog', href: '/products', icon: Package, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
        { label: 'Categories', href: '/categories', icon: Layers, color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
        { label: 'Stock Audits', href: '/inventory', icon: Boxes, color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
        { label: 'Inventory Reports', href: '/reports', icon: FileText, color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
      ];
    }
    if (isStockManager) {
      return [
        { label: 'Stock Movements', href: '/inventory', icon: Boxes, color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
        { label: 'Warehouse Stock', href: '/warehouses', icon: Building2, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
        { label: 'Check Low Stock', href: '/inventory', icon: AlertTriangle, color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
      ];
    }
    if (isPurchaseManager) {
      return [
        { label: 'New Purchase Order', href: '/purchase-orders', icon: Plus, color: 'bg-cyan-50 hover:bg-cyan-100 text-cyan-700 border-cyan-200' },
        { label: 'Suppliers Directory', href: '/suppliers', icon: Truck, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
        { label: 'Purchase Orders', href: '/purchase-orders', icon: ShoppingCart, color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
      ];
    }
    if (isSalesManager) {
      return [
        { label: 'Record New Sale', href: '/sales', icon: Plus, color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
        { label: 'Sales Invoices', href: '/sales', icon: Receipt, color: 'bg-teal-50 hover:bg-teal-100 text-teal-700 border-teal-200' },
        { label: 'Sales Reports', href: '/reports', icon: FileText, color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
      ];
    }
    return [
      { label: 'Assigned Floor Stock', href: '/inventory', icon: Boxes, color: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
      { label: 'My Warehouse Details', href: '/warehouses', icon: Building2, color: 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200' },
    ];
  };

  const roleHeader = getRoleHeader();
  const HeaderIcon = roleHeader.icon;
  const kpis = stats?.summary_kpis;

  // Chart 1: Revenue Trend Line Chart Data
  const revenueTrendData = {
    labels: stats?.monthly_sales_trend?.map((item: any) => item.month) || ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
    datasets: [
      {
        fill: true,
        label: 'Monthly Revenue (₹)',
        data: stats?.monthly_sales_trend?.map((item: any) => item.revenue) || [145000, 198000, 240000, 310000, 385000, 420000],
        borderColor: '#2563eb',
        backgroundColor: 'rgba(37, 99, 235, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointBackgroundColor: '#2563eb'
      }
    ]
  };

  // Chart 2: Category Stock Doughnut Chart Data
  const categoryStockData = {
    labels: stats?.category_stock_distribution?.map((item: any) => item.category) || ['Raw Materials', 'Finished Goods', 'Electrical', 'Hardware'],
    datasets: [
      {
        label: 'Stock Quantity',
        data: stats?.category_stock_distribution?.map((item: any) => item.stock_qty) || [1250, 980, 640, 450],
        backgroundColor: [
          '#2563eb',
          '#10b981',
          '#f59e0b',
          '#8b5cf6',
          '#ec4899',
          '#06b6d4'
        ],
        borderWidth: 2,
        borderColor: '#ffffff'
      }
    ]
  };

  // Chart 3: Top Selling Products Bar Chart Data
  const topProductsData = {
    labels: stats?.top_selling_products?.map((item: any) => item.name || 'Product') || ['Bearing Assembly', 'Hydraulic Valve', 'Electric Motor', 'Transceiver', 'Steel Coupling'],
    datasets: [
      {
        label: 'Units Sold',
        data: stats?.top_selling_products?.map((item: any) => item.qty) || [420, 310, 280, 190, 140],
        backgroundColor: '#10b981',
        borderRadius: 8
      }
    ]
  };

  return (
    <DashboardLayout>
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 rounded-2xl p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-semibold border border-blue-400/30">
              <HeaderIcon className="w-3.5 h-3.5 text-blue-400" /> Role Scope: {user?.role || 'Guest'}
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
              <Building2 className="w-3.5 h-3.5 text-emerald-400" />
              {assignedWarehouseName || user?.assigned_warehouse_name
                ? `Assigned: ${assignedWarehouseName || user?.assigned_warehouse_name}`
                : 'Scope: All Warehouses (Company-wide)'}
            </span>
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">{roleHeader.title}</h2>
          <p className="text-slate-300 text-sm mt-1">{roleHeader.subtitle}</p>
        </div>

        {(isAdmin || isSalesManager || isWarehouseManager) && (
          <div className="flex flex-wrap items-center gap-3">
            {isAdmin && (
              <div className="flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3.5 py-2.5 rounded-xl border border-blue-500/30 shadow-lg">
                <Building2 className="w-4 h-4 text-blue-400" />
                <span className="text-xs font-bold text-blue-200 hidden sm:inline">Filter Site:</span>
                <select
                  value={selectedWarehouseId}
                  onChange={(e) => handleWarehouseFilterChange(e.target.value)}
                  className="bg-slate-900 text-white text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                  <option value="ALL">🌐 All Warehouses (Company-wide)</option>
                  {warehouses.map((wh) => (
                    <option key={wh.id} value={wh.id}>
                      🏭 {wh.code}: {wh.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/10">
              <div>
                <p className="text-[10px] text-slate-300 uppercase tracking-wider font-bold">
                  {kpis?.total_revenue > 0 ? 'Total Revenue' : 'Total Asset Valuation'}
                </p>
                <p className="text-2xl font-black text-emerald-400">
                  {kpis?.total_revenue > 0
                    ? `₹${kpis.total_revenue.toLocaleString('en-IN')}`
                    : kpis?.total_inventory_valuation
                      ? `₹${kpis.total_inventory_valuation.toLocaleString('en-IN')}`
                      : '₹0'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Role Quick Actions Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3 my-4">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
          <span className="p-1.5 bg-blue-50 text-blue-600 rounded-lg"><Zap className="w-4 h-4" /></span>
          <span>Role Quick Actions:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {getRoleQuickActions().map((action, idx) => {
            const ActionIcon = action.icon;
            return (
              <a
                key={idx}
                href={action.href}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-colors inline-flex items-center gap-1.5 ${action.color}`}
              >
                <ActionIcon className="w-3.5 h-3.5" />
                {action.label}
              </a>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="space-y-6">
          <KPIGridSkeleton count={4} />
          <ChartGridSkeleton />
          <TableSkeleton rows={5} cols={5} />
        </div>
      ) : (
        <>
          {/* Role-Specific KPI Overview Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Package className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</p>
                <p className="text-xl font-extrabold text-slate-900">{kpis?.total_products !== undefined ? kpis.total_products.toLocaleString('en-IN') : 0}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><Building2 className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Warehouses</p>
                <p className="text-xl font-extrabold text-slate-900">{kpis?.total_warehouses !== undefined ? kpis.total_warehouses.toLocaleString('en-IN') : 0}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><Truck className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Suppliers</p>
                <p className="text-xl font-extrabold text-slate-900">{kpis?.total_suppliers !== undefined ? kpis.total_suppliers.toLocaleString('en-IN') : 0}</p>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-3">
              <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl"><Boxes className="w-5 h-5" /></div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock Units</p>
                <p className="text-xl font-extrabold text-slate-900">
                  {kpis?.total_inventory !== undefined ? kpis.total_inventory.toLocaleString('en-IN') : 0}
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

          {/* 3 Interactive Analytics Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Revenue Trend Line Chart */}
            <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-blue-600" /> Monthly Revenue & Growth Trend (₹)
                </h3>
              </div>
              <div className="h-64">
                <Line
                  data={revenueTrendData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { display: false },
                      tooltip: { mode: 'index', intersect: false }
                    },
                    scales: {
                      y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
                      x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            </div>

            {/* Chart 2: Category Stock Doughnut Chart */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-purple-600" /> Stock by Category
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-black border border-purple-200">
                  Distribution
                </span>
              </div>
              <div className="h-64 flex items-center justify-center">
                <Doughnut
                  data={categoryStockData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: { position: 'bottom', labels: { boxWidth: 12, font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            </div>
          </div>

          {/* Chart 3: Top Selling Products Velocity */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-emerald-600" /> Top 5 Selling Products & Velocity (Units Sold)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-black border border-emerald-200">
                Top Performing SKUs
              </span>
            </div>
            <div className="h-56">
              <Bar
                data={topProductsData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: { display: false }
                  },
                  scales: {
                    y: { grid: { color: '#f1f5f9' }, ticks: { font: { size: 10 } } },
                    x: { grid: { display: false }, ticks: { font: { size: 10 } } }
                  }
                }}
              />
            </div>
          </div>

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
                            <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${po.status === 'APPROVED' || po.status === 'RECEIVED' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
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
        </>
      )}
    </DashboardLayout>
  );
}
