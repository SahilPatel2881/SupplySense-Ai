'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface DemandLineChartProps {
  historicalData?: { days: number[]; actual: number[] };
  forecastData?: { days: number[]; predicted: number[] };
  modelName?: string;
}

const DemandLineChart: React.FC<DemandLineChartProps> = ({
  historicalData,
  forecastData,
  modelName = "Random Forest"
}) => {
  if (!historicalData || !forecastData) return <div className="p-6 text-center text-slate-400 text-xs font-semibold">Loading predictive demand model...</div>;

  const traceHistorical = {
    x: historicalData.days,
    y: historicalData.actual,
    type: 'scatter' as const,
    mode: 'lines+markers' as const,
    name: 'Historical Demand',
    line: { color: '#2563EB', width: 2.5 },
    marker: { size: 5 }
  };

  const traceForecast = {
    x: forecastData.days,
    y: forecastData.predicted,
    type: 'scatter' as const,
    mode: 'lines+markers' as const,
    name: `ML Forecast (${modelName})`,
    line: { color: '#059669', width: 3, dash: 'dot' },
    marker: { size: 6, symbol: 'diamond' }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
      <Plot
        data={[traceHistorical, traceForecast]}
        layout={{
          title: { text: `Predictive Demand Horizon (${modelName})`, font: { family: 'Plus Jakarta Sans', size: 16, color: '#1E293B' } },
          autosize: true,
          height: 340,
          margin: { l: 45, r: 25, t: 45, b: 45 },
          xaxis: { title: 'Day Index Timeline', gridcolor: '#F1F5F9' },
          yaxis: { title: 'Unit Sales Quantity', gridcolor: '#F1F5F9' },
          legend: { orientation: 'h', y: 1.1 },
          paper_bgcolor: 'transparent',
          plot_bgcolor: 'transparent'
        }}
        useResizeHandler={true}
        className="w-full"
        config={{ displayModeBar: false }}
      />
    </div>
  );
};

export default DemandLineChart;
