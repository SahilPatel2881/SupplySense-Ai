'use client';

import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import DemandLineChart from '../../components/charts/DemandLineChart';
import CorrelationHeatmap from '../../components/charts/CorrelationHeatmap';
import PriceBoxPlot from '../../components/charts/PriceBoxPlot';
import SupplierScatterPlot from '../../components/charts/SupplierScatterPlot';
import { ForecastData, SupplierEvalData, Supplier } from '../../types';
import {
  BrainCircuit,
  Sliders,
  Cpu,
  RefreshCw,
  Calculator
} from 'lucide-react';

export default function AIAnalyticsPage() {
  const [activeTab, setActiveTab] = useState<'forecast' | 'supplier' | 'eda' | 'eoq'>('forecast');
  
  // Forecast State
  const [selectedRegModel, setSelectedRegModel] = useState('random_forest');
  const [forecastDays, setForecastDays] = useState(30);
  const [forecastData, setForecastData] = useState<ForecastData | null>(null);

  // Supplier State
  const [selectedClfModel, setSelectedClfModel] = useState('random_forest');
  const [supplierEval, setSupplierEval] = useState<SupplierEvalData | null>(null);
  const [suppliersList, setSuppliersList] = useState<Supplier[]>([]);

  // EOQ Parameters
  const [eoqInputs, setEoqInputs] = useState({
    dailyDemand: 25,
    leadTimeDays: 7,
    currentStock: 60,
    orderingCost: 50,
    holdingCost: 2.5
  });
  const [eoqResult, setEoqResult] = useState<any>(null);

  // EDA State
  const [edaData, setEdaData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  useEffect(() => {
    fetchDemandForecast(selectedRegModel, forecastDays);
  }, [selectedRegModel, forecastDays]);

  useEffect(() => {
    fetchSupplierEval(selectedClfModel);
  }, [selectedClfModel]);

  const fetchAnalyticsData = async () => {
    try {
      const [edaRes, supListRes] = await Promise.all([
        api.get('/ai/eda-analytics/'),
        api.get('/suppliers/')
      ]);
      setEdaData(edaRes.data);
      setSuppliersList(supListRes.data);
      setLoading(false);
    } catch (err) {
      console.error('Failed to load analytics engine:', err);
      setLoading(false);
    }
  };

  const fetchDemandForecast = async (model: string, days: number) => {
    setRecalculating(true);
    try {
      const res = await api.get(`/ai/forecast-demand/?model=${model}&days=${days}`);
      setForecastData(res.data);
    } catch (err) {
      console.error('Failed to run demand forecast:', err);
    } finally {
      setRecalculating(false);
    }
  };

  const fetchSupplierEval = async (model: string) => {
    try {
      const res = await api.get(`/ai/supplier-reliability/?model=${model}`);
      setSupplierEval(res.data);
    } catch (err) {
      console.error('Failed to run supplier classifier:', err);
    }
  };

  const calculateEOQLocal = () => {
    const { dailyDemand, leadTimeDays, currentStock, orderingCost, holdingCost } = eoqInputs;
    const dailyStd = Math.max(1.0, dailyDemand * 0.25);
    const z = 1.65;
    const safetyStock = Math.ceil(z * dailyStd * Math.sqrt(leadTimeDays));
    const reorderPoint = Math.ceil((dailyDemand * leadTimeDays) + safetyStock);
    const annualDemand = dailyDemand * 365;
    const eoq = Math.ceil(Math.sqrt((2 * annualDemand * orderingCost) / Math.max(0.1, holdingCost)));
    const isLowStock = currentStock <= reorderPoint;
    const recommendedQty = isLowStock ? Math.max(0, (reorderPoint + eoq) - currentStock) : 0;

    setEoqResult({
      safetyStock,
      reorderPoint,
      eoq,
      isLowStock,
      recommendedQty
    });
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Top Banner */}
          <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-400/30 mb-2">
                <Cpu className="w-3.5 h-3.5 text-blue-400" /> Scikit-Learn & Pandas AI Workbench
              </span>
              <h2 className="text-2xl font-extrabold tracking-tight">Machine Learning & Analytics Console</h2>
              <p className="text-slate-400 text-xs mt-1">Supervised regression demand models, classification risk scoring, EOQ calculators, and exploratory data analysis.</p>
            </div>

            {/* Tab Selection */}
            <div className="flex flex-wrap bg-slate-800 p-1.5 rounded-xl border border-slate-700">
              <button
                onClick={() => setActiveTab('forecast')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'forecast' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Demand Forecasting
              </button>
              <button
                onClick={() => setActiveTab('supplier')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'supplier' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Supplier Classifier
              </button>
              <button
                onClick={() => setActiveTab('eoq')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'eoq' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                EOQ Simulator
              </button>
              <button
                onClick={() => setActiveTab('eda')}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'eda' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Pandas EDA
              </button>
            </div>
          </div>

          {/* Tab 1: Demand Forecasting Regression */}
          {activeTab === 'forecast' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-blue-600" /> ML Model & Hyperparameter Tuning
                    </h3>
                    <p className="text-slate-500 text-xs">Switch models to compare MAE, MSE, and R² Score evaluation performance.</p>
                  </div>

                  {recalculating && (
                    <div className="flex items-center gap-1.5 text-xs text-blue-600 font-bold">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" /> Recalculating...
                    </div>
                  )}
                </div>

                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'linear', label: 'Linear Regression' },
                      { id: 'polynomial', label: 'Polynomial Regression' },
                      { id: 'decision_tree', label: 'Decision Tree' },
                      { id: 'random_forest', label: 'Random Forest' }
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setSelectedRegModel(m.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedRegModel === m.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-700">Forecast Horizon:</span>
                    {[14, 30, 60, 90].map(days => (
                      <button
                        key={days}
                        onClick={() => setForecastDays(days)}
                        className={`px-3 py-1 rounded-lg text-xs font-bold border cursor-pointer ${forecastDays === days ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                      >
                        {days} Days
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              {forecastData?.metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mean Absolute Error (MAE)</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{forecastData.metrics.mae}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Mean Squared Error (MSE)</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{forecastData.metrics.mse}</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Coefficient of Determination (R²)</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{forecastData.metrics.r2}</p>
                  </div>
                </div>
              )}

              {/* Forecast Chart */}
              <DemandLineChart
                historicalData={forecastData?.historical}
                forecastData={forecastData?.forecast}
                modelName={selectedRegModel.toUpperCase().replace('_', ' ')}
              />
            </div>
          )}

          {/* Tab 2: Supplier Classification */}
          {activeTab === 'supplier' && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Select Risk Classification Model</h3>
                  <p className="text-slate-500 text-xs">Evaluate supplier risk using kNN, SVM, Decision Tree, or Random Forest.</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: 'knn', label: 'k-Nearest Neighbors (kNN)' },
                    { id: 'svm', label: 'Support Vector Machine (SVM)' },
                    { id: 'decision_tree', label: 'Decision Tree' },
                    { id: 'random_forest', label: 'Random Forest' }
                  ].map(m => (
                    <button
                      key={m.id}
                      onClick={() => setSelectedClfModel(m.id)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${selectedClfModel === m.id ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {supplierEval?.metrics && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Accuracy Score</span>
                    <p className="text-2xl font-black text-blue-600 mt-1">{(supplierEval.metrics.accuracy * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Precision</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{(supplierEval.metrics.precision * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Recall</span>
                    <p className="text-2xl font-black text-purple-600 mt-1">{(supplierEval.metrics.recall * 100).toFixed(1)}%</p>
                  </div>
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Specificity</span>
                    <p className="text-2xl font-black text-amber-600 mt-1">{(supplierEval.metrics.specificity * 100).toFixed(1)}%</p>
                  </div>
                </div>
              )}

              {supplierEval?.confusion_matrix && (
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs max-w-lg">
                  <h4 className="font-extrabold text-slate-900 text-sm mb-3">Scikit-Learn Confusion Matrix</h4>
                  <div className="grid grid-cols-2 gap-3 text-center text-xs">
                    <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold uppercase text-emerald-600">True Negatives</span>
                      <p className="text-xl font-black mt-1">{supplierEval.confusion_matrix.true_negative}</p>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
                      <span className="text-[10px] font-bold uppercase text-rose-600">False Positives</span>
                      <p className="text-xl font-black mt-1">{supplierEval.confusion_matrix.false_positive}</p>
                    </div>
                    <div className="p-3 bg-rose-50 text-rose-900 rounded-xl border border-rose-100">
                      <span className="text-[10px] font-bold uppercase text-rose-600">False Negatives</span>
                      <p className="text-xl font-black mt-1">{supplierEval.confusion_matrix.false_negative}</p>
                    </div>
                    <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl border border-emerald-100">
                      <span className="text-[10px] font-bold uppercase text-emerald-600">True Positives</span>
                      <p className="text-xl font-black mt-1">{supplierEval.confusion_matrix.true_positive}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: EOQ Simulator */}
          {activeTab === 'eoq' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <Calculator className="w-5 h-5 text-blue-600" /> Economic Order Quantity (EOQ) Parameters
                </h3>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Daily Product Demand (Units)</label>
                    <input
                      type="number"
                      value={eoqInputs.dailyDemand}
                      onChange={(e) => setEoqInputs({ ...eoqInputs, dailyDemand: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Supplier Lead Time (Days)</label>
                      <input
                        type="number"
                        value={eoqInputs.leadTimeDays}
                        onChange={(e) => setEoqInputs({ ...eoqInputs, leadTimeDays: parseInt(e.target.value) || 1 })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Current Stock Quantity</label>
                      <input
                        type="number"
                        value={eoqInputs.currentStock}
                        onChange={(e) => setEoqInputs({ ...eoqInputs, currentStock: parseInt(e.target.value) || 0 })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-bold"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Ordering Cost per Order ($)</label>
                      <input
                        type="number"
                        value={eoqInputs.orderingCost}
                        onChange={(e) => setEoqInputs({ ...eoqInputs, orderingCost: parseFloat(e.target.value) || 1 })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">Holding Cost per Unit/Yr ($)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={eoqInputs.holdingCost}
                        onChange={(e) => setEoqInputs({ ...eoqInputs, holdingCost: parseFloat(e.target.value) || 0.1 })}
                        className="w-full p-2 border border-slate-200 rounded-xl font-mono"
                      />
                    </div>
                  </div>

                  <button
                    onClick={calculateEOQLocal}
                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition-colors cursor-pointer"
                  >
                    Compute EOQ & Reorder Point
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-xl flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">EOQ Inventory Optimization Output</span>
                  <h3 className="text-xl font-extrabold mt-1">Calculated Logistics Metrics</h3>

                  {eoqResult ? (
                    <div className="grid grid-cols-2 gap-4 mt-6 text-xs">
                      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block font-semibold">Economic Order Qty (EOQ)</span>
                        <p className="text-2xl font-black text-blue-400 mt-1">{eoqResult.eoq} Units</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block font-semibold">Safety Stock Buffer</span>
                        <p className="text-2xl font-black text-emerald-400 mt-1">{eoqResult.safetyStock} Units</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block font-semibold">Reorder Point (ROP)</span>
                        <p className="text-2xl font-black text-amber-400 mt-1">{eoqResult.reorderPoint} Units</p>
                      </div>
                      <div className="p-4 bg-slate-800 rounded-xl border border-slate-700">
                        <span className="text-slate-400 block font-semibold">Reorder Status</span>
                        <p className={`text-xl font-black mt-1 ${eoqResult.isLowStock ? 'text-rose-400' : 'text-emerald-400'}`}>
                          {eoqResult.isLowStock ? `REORDER (+${eoqResult.recommendedQty})` : 'ADEQUATE'}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-xs mt-8 text-center">Click "Compute EOQ & Reorder Point" to evaluate parameters.</p>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-800 text-[11px] text-slate-400">
                  Formula: EOQ = √((2 × D × S) / H) | 95% Confidence Service Factor Z=1.65
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Pandas EDA */}
          {activeTab === 'eda' && edaData && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CorrelationHeatmap correlationData={edaData.correlation_matrix} />
                <SupplierScatterPlot suppliers={suppliersList} />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <PriceBoxPlot />

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm mb-3">IQR Price Outliers Detected (Pandas)</h4>
                    {edaData.outliers_detected?.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No anomalous pricing outliers detected.</p>
                    ) : (
                      <div className="divide-y divide-slate-100 text-xs">
                        {edaData.outliers_detected?.map((out: any, idx: number) => (
                          <div key={idx} className="py-2.5 flex justify-between items-center">
                            <div>
                              <p className="font-bold text-slate-900">{out.product_name}</p>
                              <span className="text-[10px] text-amber-600 font-semibold">{out.bound_type}</span>
                            </div>
                            <span className="font-mono font-bold text-slate-800">${out.selling_price?.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
