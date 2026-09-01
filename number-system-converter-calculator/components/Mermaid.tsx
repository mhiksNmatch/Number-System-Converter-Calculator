'use client';

import React, { useEffect, useState } from 'react';
import mermaid from 'mermaid';

export default function Mermaid({ chart }: { chart: string }) {
  const [svg, setSvg] = useState('');
  const [id] = useState(() => 'mermaid-svg-' + Math.random().toString(36).substr(2, 9));

  useEffect(() => {
    // Initialize Mermaid with custom theming to match your app
    mermaid.initialize({
      startOnLoad: false,
      theme: 'base',
      themeVariables: {
        primaryColor: '#FCFAF2',
        primaryTextColor: '#43413B',
        primaryBorderColor: '#D6D3C1',
        lineColor: '#5A5A40',
        fontFamily: 'ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"'
      }
    });
    
    const renderChart = async () => {
      try {
        const { svg: renderedSvg } = await mermaid.render(id, chart);
        setSvg(renderedSvg);
      } catch (e) {
        console.error('Mermaid render error', e);
      }
    };
    
    renderChart();
  }, [chart, id]);

  if (!svg) {
    return <div className="animate-pulse h-64 bg-[#E8E6D8] rounded-xl flex items-center justify-center text-[#8E917A] font-bold text-sm tracking-widest uppercase">Rendering Flowchart...</div>;
  }

  return (
    <div 
      className="flex justify-center my-8 overflow-x-auto p-4 bg-white border border-[#D6D3C1] rounded-xl shadow-sm" 
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}