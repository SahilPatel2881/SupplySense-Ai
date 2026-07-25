'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface CorrelationHeatmapProps {
  correlationData?: {
    columns: string[];
    index: string[];
    values: number[][];
  };
}

const CorrelationHeatmap: React.FC<CorrelationHeatmapProps> = ({ correlationData }) => {
  if (!correlationData || !correlationData.values) {
    return <div className="p-6 text-center text-slate-400 text-xs font-semibold">Insufficient matrix data for correlation analysis</div>;
  }

  const trace = {
    z: correlationData.values,
    x: correlationData.columns.map(c => c.replace('_', ' ')),
    y: correlationData.index.map(c => c.replace('_', ' ')),
    type: 'heatmap' as const,
    colorscale: 'Viridis' as const,
    showscale: true,
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
      <Plot
        data={[trace]}
        layout={{
          title: { text: 'Pandas Correlation Matrix (Supplier Metrics)', font: { family: 'Plus Jakarta Sans', size: 15, color: '#1E293B' } },
          autosize: true,
          height: 320,
          margin: { l: 110, r: 25, t: 40, b: 90 },
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

export default CorrelationHeatmap;
