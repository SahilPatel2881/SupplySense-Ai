'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const Plot = dynamic(() => import('react-plotly.js'), { ssr: false });

interface PriceBoxPlotProps {
  prices?: number[];
}

const PriceBoxPlot: React.FC<PriceBoxPlotProps> = ({ prices }) => {
  const trace = {
    y: prices || [12, 75, 42, 3.5, 22, 140, 38, 480],
    type: 'box' as const,
    name: 'Selling Prices ($)',
    marker: { color: '#0EA5E9' },
    boxpoints: 'outliers' as const
  };

  return (
    <div className="w-full bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
      <Plot
        data={[trace]}
        layout={{
          title: { text: 'Product Price Distribution (IQR Outliers)', font: { family: 'Plus Jakarta Sans', size: 15, color: '#1E293B' } },
          autosize: true,
          height: 320,
          margin: { l: 45, r: 25, t: 40, b: 35 },
          yaxis: { title: 'Price ($)', gridcolor: '#F1F5F9' },
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

export default PriceBoxPlot;
