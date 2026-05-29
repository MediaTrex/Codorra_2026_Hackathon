import React from 'react';

export default function Analytics() {
  const analyticsMetrics = [
    { name: "Total People Count", sum: "125,430", flag: "↑ 18.4%", mode: "success" },
    { name: "Peak Density Index", sum: "92%", flag: "↑ 5%", mode: "danger" },
    { name: "Avg Daily Density", sum: "63%", flag: "↓ 1%", mode: "warning" },
    { name: "Total Alerts Issued", sum: "36", flag: "↑ 12%", mode: "success" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Analytics Overview</h2>
          <p className="text-slate-500 text-xs mt-1">Detailed insights, trends, and historic processing validation</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm">
          Last 7 Days ▼
        </button>
      </div>

      {/* METRIC SUMMARIES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {analyticsMetrics.map((card, index) => (
          <div key={index} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-1.5">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">{card.name}</p>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">{card.sum}</h3>
              <span className={`text-xs font-extrabold ${card.mode === 'success' ? 'text-emerald-500' : 'text-red-500'}`}>{card.flag}</span>
            </div>
          </div>
        ))}
      </div>

      {/* GRAPH CHART INFRASTRUCTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LINE GRAPH REPRESENTATION */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Density Trend Lines</h4>
            <p className="text-[11px] text-slate-400">Aggregated volumetric flow over specified times</p>
          </div>
          
          {/* SIMULATED COMPONENT GRAPH TIMELINE VIA SECURE CRISP SVGS */}
          <div className="h-56 my-4 w-full flex items-end">
            <svg className="w-full h-full" viewBox="0 0 400 120" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2"/>
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.0"/>
                </linearGradient>
              </defs>
              <path d="M 0 80 Q 50 20 100 60 T 200 40 T 300 90 T 400 30" fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
              <path d="M 0 80 Q 50 20 100 60 T 200 40 T 300 90 T 400 30 L 400 120 L 0 120 Z" fill="url(#chartGrad)" />
            </svg>
          </div>

          <div className="flex justify-between text-[10px] font-bold text-slate-400 font-mono border-t pt-3">
            <span>12 MAY</span>
            <span>14 MAY</span>
            <span>16 MAY</span>
            <span>18 MAY</span>
            <span>20 MAY</span>
          </div>
        </div>

        {/* TOP PERFORMING LOCATIONS BAR BLOCK */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Top Locations by Density</h4>
            <p className="text-[11px] text-slate-400">Highest volume nodes evaluated</p>
          </div>

          <div className="space-y-3.5 pt-2">
            {[
              { location: "City Mall", metric: "85%", size: "w-[85%]", bg: "bg-red-500" },
              { location: "Metro Station", metric: "74%", size: "w-[74%]", bg: "bg-orange-500" },
              { location: "Railway Station", metric: "67%", size: "w-[67%]", bg: "bg-amber-500" },
              { location: "Bus Stand", metric: "58%", size: "w-[58%]", bg: "bg-blue-500" },
              { location: "Park Zone", metric: "32%", size: "w-[32%]", bg: "bg-emerald-500" },
            ].map((bar, i) => (
              <div key={i} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">{bar.location}</span>
                  <span className="text-slate-800 font-bold">{bar.metric}</span>
                </div>
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${bar.bg} ${bar.size}`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}