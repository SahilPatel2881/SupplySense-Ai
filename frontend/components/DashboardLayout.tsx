'use client';

import React, { ReactNode } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Shared Common Sidebar */}
      <Sidebar />

      {/* Main Content Area with Shared Common Navbar */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
