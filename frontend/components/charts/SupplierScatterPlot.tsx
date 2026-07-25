'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface SupplierScatterPlotProps {
  suppliers?: Array<{ name: string; lead_time_days: number; defect_rate: number }>;
}

const SupplierScatterPlot: React.FC<SupplierScatterPlotProps> = ({ suppliers }) => {
  const xVals = suppliers?.map(s => s.lead_time_days) || [4.5, 7.0, 11.5, 3.0];
  const yVals = suppliers?.map(s => s.defect_rate * 100) || [0.8, 1.8, 4.5, 0.3];
  const names = suppliers?.map(s => s.name) || ['Apex', 'Global', 'Nexus', 'Precision'];

  const trace = {
    x: xVals,
    y: yVals,
    text: names,
    mode: 'markers+text' as const,
    type: 'scatter' as const,
    textposition: 'top center' as const,
    marker: { size: 12, color: yVals, colorscale: 'Reds' as const, showscale: true }
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
      <Plot
        data={[trace]}
        layout={{
          title: { text: 'Supplier Lead Time vs Defect Rate Risk Matrix', font: { family: 'Plus Jakarta Sans', size: 15, color: '#1E293B' } },
          autosize: true,
          height: 320,
          margin: { l: 45, r: 25, t: 40, b: 45 },
          xaxis: { title: 'Lead Time (Days)', gridcolor: '#F1F5F9' },
          yaxis: { title: 'Defect Rate (%)', gridcolor: '#F1F5F9' },
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

export default SupplierScatterPlot;
