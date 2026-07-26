'use client';

import React, { useState } from 'react';
import { Product } from '../types';
import { Scan, X, CheckCircle2, QrCode } from 'lucide-react';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (product: Product) => void;
  products?: Product[];
}

const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScanComplete,
  products = []
}) => {
  const [scannedCode, setScannedCode] = useState('');
  const [scanning, setScanning] = useState(false);
  const [foundProduct, setFoundProduct] = useState<any>(null);

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSimulateScan = (skuOrBarcode: string) => {
    setScanning(true);
    setScannedCode(skuOrBarcode);
    setFoundProduct(null);

    setTimeout(() => {
      setScanning(false);
      const matched = products.find(
        p => p.sku === skuOrBarcode || p.barcode === skuOrBarcode || p.name.toLowerCase().includes(skuOrBarcode.toLowerCase())
      );
      if (matched) {
        setFoundProduct(matched);
      } else {
        setFoundProduct({ name: 'Scanned SKU: ' + skuOrBarcode, sku: skuOrBarcode, notFound: true });
      }
    }, 800);
  };

  const handleConfirm = () => {
    if (foundProduct && onScanComplete && !foundProduct.notFound) {
      onScanComplete(foundProduct as Product);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-in fade-in text-slate-100">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Scan className="w-5 h-5 text-blue-400 animate-pulse" />
            <h3 className="font-bold text-base text-white">AI Barcode & SKU Optical Scanner</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Viewfinder Area */}
        <div className="relative h-44 bg-slate-950 rounded-xl border border-slate-800 flex flex-col items-center justify-center overflow-hidden">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-rose-500 shadow-[0_0_12px_#f43f5e] animate-pulse" />

          {scanning ? (
            <div className="flex flex-col items-center gap-2 text-blue-400 text-xs font-semibold">
              <Scan className="w-8 h-8 animate-spin" />
              <span>Scanning Barcode Telemetry...</span>
            </div>
          ) : (
            <div className="text-center p-4 space-y-1">
              <QrCode className="w-10 h-10 text-slate-600 mx-auto" />
              <p className="text-xs text-slate-400 font-medium">Position product barcode inside scanner viewport</p>
            </div>
          )}
        </div>

        {/* Preset Scan Buttons */}
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">Simulate Barcode Label Scans</p>
          <div className="grid grid-cols-2 gap-2">
            {products.slice(0, 4).map((p) => (
              <button
                key={p.id}
                onClick={() => handleSimulateScan(p.sku)}
                className="p-2 bg-slate-800 hover:bg-blue-600/30 hover:border-blue-500/50 border border-slate-700 rounded-xl text-left text-xs transition-all cursor-pointer"
              >
                <p className="font-bold text-white truncate">{p.name}</p>
                <p className="text-[10px] font-mono text-blue-400">{p.sku}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Scan Match Result */}
        {foundProduct && (
          <div className={`p-3 rounded-xl border text-xs ${foundProduct.notFound ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'}`}>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <div>
                <p className="font-bold">{foundProduct.name}</p>
                <p className="text-[10px] opacity-80">SKU: {foundProduct.sku} | Selling Price: ₹{foundProduct.selling_price ? foundProduct.selling_price.toLocaleString('en-IN') : 'N/A'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 rounded-xl text-xs font-bold cursor-pointer"
          >
            Cancel
          </button>
          <button
            disabled={!foundProduct || foundProduct.notFound}
            onClick={handleConfirm}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/20 cursor-pointer"
          >
            Confirm Selected Item
          </button>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScannerModal;
