import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

export const metadata: Metadata = {
  title: 'SupplySense AI | Enterprise Warehouse & Supply Chain Intelligence',
  description: 'AI-powered Warehouse & Supply Chain Management System featuring predictive demand forecasting, EOQ reorder calculations, supplier reliability ratings, and real-time inventory telemetry.',
  keywords: ['Warehouse Management', 'Supply Chain AI', 'Demand Forecasting', 'Scikit-learn', 'Pandas EDA', 'Inventory Control'],
  openGraph: {
    title: 'SupplySense AI',
    description: 'Predictive Supply Chain & Inventory Operations Powered by Machine Learning',
    siteName: 'SupplySense AI',
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
