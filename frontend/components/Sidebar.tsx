'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Boxes,
  Package,
  Building2,
  Users,
  Truck,
  ShoppingCart,
  Receipt,
  BrainCircuit,
  FileText,
  Building,
  Settings
} from 'lucide-react';

const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, isAdmin, assignedWarehouseName } = useAuth();

  const navItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['Admin', 'WarehouseManager', 'InventoryManager', 'StockManager', 'PurchaseManager', 'SalesManager', 'WarehouseEmployee']
    },
    {
      name: 'Inventory Stock',
      path: '/inventory',
      icon: Boxes,
      roles: ['Admin', 'WarehouseManager', 'InventoryManager', 'StockManager', 'WarehouseEmployee']
    },
    {
      name: 'Product Catalog',
      path: '/products',
      icon: Package,
      roles: ['Admin', 'WarehouseManager', 'InventoryManager', 'StockManager']
    },
    {
      name: 'Warehouses',
      path: '/warehouses',
      icon: Building2,
      roles: ['Admin', 'WarehouseManager']
    },
    {
      name: 'Suppliers',
      path: '/suppliers',
      icon: Truck,
      roles: ['Admin', 'PurchaseManager']
    },
    {
      name: 'Purchase Orders',
      path: '/purchase-orders',
      icon: ShoppingCart,
      roles: ['Admin', 'WarehouseManager', 'PurchaseManager', 'WarehouseEmployee']
    },
    {
      name: 'Sales & Invoices',
      path: '/sales',
      icon: Receipt,
      roles: ['Admin', 'WarehouseManager', 'SalesManager']
    },
    {
      name: 'AI & ML Workbench',
      path: '/ai-analytics',
      icon: BrainCircuit,
      roles: ['Admin', 'WarehouseManager']
    },
    {
      name: 'Reports & Export',
      path: '/reports',
      icon: FileText,
      roles: ['Admin', 'WarehouseManager', 'InventoryManager', 'PurchaseManager', 'SalesManager']
    },
    {
      name: 'User Management',
      path: '/users',
      icon: Users,
      roles: ['Admin']
    },
    {
      name: 'System Settings',
      path: '/settings',
      icon: Settings,
      roles: ['Admin', 'WarehouseManager']
    },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-2xl z-30 shrink-0">
      {/* Brand Header */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <BrainCircuit className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="font-bold text-lg text-white tracking-tight flex items-center gap-1.5">
            SupplySense <span className="text-xs px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-semibold">AI</span>
          </h1>
          <p className="text-xs text-slate-400 font-medium">Smart Supply Chain</p>
        </div>
      </div>

      {/* Scope Badge */}
      <div className="px-4 py-3 mx-3 my-3 rounded-lg bg-slate-800/60 border border-slate-700/50 flex items-center gap-2">
        <Building className="w-4 h-4 text-blue-400 shrink-0" />
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Active Scope</p>
          <p className="text-xs font-semibold text-white truncate">{assignedWarehouseName}</p>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        {navItems
          .filter((item) => item.roles.includes(user?.role || 'WarehouseEmployee'))
          .map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;
            return (
              <Link
                key={item.path}
                href={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-semibold translate-x-0.5'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
      </nav>

      {/* User Role Footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${isAdmin ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'}`}>
            {user?.username?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.full_name || user?.username}</p>
            <span className={`inline-block text-[10px] font-bold px-1.5 py-0.2 rounded uppercase ${isAdmin ? 'bg-amber-400/10 text-amber-400' : 'bg-blue-400/10 text-blue-400'}`}>
              {user?.role}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
