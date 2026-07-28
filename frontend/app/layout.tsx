import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'SupplySense ERP | Enterprise Warehouse & Supply Chain Management',
  description: 'Enterprise Warehouse & Supply Chain Management System featuring real-time inventory control, purchase order tracking, sales billing, and multi-warehouse operations.',
  keywords: ['Warehouse Management', 'Supply Chain', 'Inventory Control', 'Purchase Orders', 'Sales Invoices', 'ERP Console'],
  openGraph: {
    title: 'SupplySense ERP',
    description: 'Enterprise Supply Chain & Inventory Operations Console',
    siteName: 'SupplySense ERP',
    type: 'website'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-900 text-slate-100 antialiased">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-blue-600 selection:text-white">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
