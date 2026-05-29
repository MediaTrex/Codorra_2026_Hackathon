import React from 'react';

export default function Dashboard() {
  const metricGrid = [
    { name: "Total Locations", data: "24", status: "↑ 12% from yesterday", mode: "neutral", graphic: "📍" },
    { name: "Live Feeds", data: "18", status: "● Online", mode: "success", graphic: "🎥" },
    { name: "High Density Alerts", data: "7", status: "● Active Now", mode: "danger", graphic: "⚠️" },
    { name: "Avg Density", data: "63%", status: "↑ 8% from yesterday", mode: "warning", graphic: "📊" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
          Dashboard 👋
        </h2>
        <p className="text-slate-500 text-xs mt-1">Real-time overview of crowd density across all locations</p>
      </div>

      {/* METRIC CARD BAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {metricGrid.map((item, id) => (
          <div key={id} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{item.name}</p>
              <h3 className="text-2xl font-bold text-slate-800 tracking-tight">{item.data}</h3>
              <p className={`text-[11px] font-bold ${
                item.mode === 'success' ? 'text-emerald-600' :
                item.mode === 'danger' ? 'text-red-500' :
                item.mode === 'warning' ? 'text-amber-600' : 'text-blue-500'
              }`}>{item.status}</p>
            </div>
            <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center text-lg shadow-inner">{item.graphic}</div>
          </div>
        ))}
      </div>

      {/* MIDDLE ANALYTICS BLOCK */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* MAP COMPONENT FRAME */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col">
          <div className="mb-4">
            <h4 className="font-bold text-slate-800 text-sm">Live Overview</h4>
            <p className="text-[11px] text-slate-400">Spatial distribution of computer vision inference streams</p>
          </div>
          <div className="flex-1 min-h-[280px] bg-slate-50 rounded-xl relative overflow-hidden border border-slate-200/60 flex items-center justify-center">
            <div className="absolute inset-0 opacity-[0.04] bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:12px_12px]"></div>
            
            {/* HOTSPOT LABELS MATCHING CARD DESIGN ELEMENTS */}
            <div className="absolute top-1/4 left-1/4 bg-emerald-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>32%
            </div>
            <div className="absolute top-1/2 left-1/2 bg-red-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>85%
            </div>
            <div className="absolute bottom-1/4 right-1/3 bg-orange-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-full shadow-lg border-2 border-white flex items-center gap-1">
              <span className="w-1 h-1 bg-white rounded-full animate-ping"></span>74%
            </div>

            <p className="text-slate-400 font-medium text-xs bg-white border px-4 py-2 rounded-xl shadow-sm z-10">Mapbox / Leaflet Tracking Matrix Container</p>
          </div>
        </div>

        {/* DISTRIBUTION SEGMENTS */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-between">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Density Distribution</h4>
            <p className="text-[11px] text-slate-400">Current levels categorized</p>
          </div>

          <div className="my-6 flex justify-center relative">
            <div className="w-32 h-32 rounded-full border-[12px] border-slate-100 flex items-center justify-center relative">
              <div className="absolute inset-0 rounded-full border-[12px] border-blue-500 border-t-transparent border-r-transparent rotate-45"></div>
              <div className="absolute inset-0 rounded-full border-[12px] border-red-500 border-b-transparent border-l-transparent -rotate-12"></div>
              <div className="text-center">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total</span>
                <span className="text-xl font-black text-slate-800">24</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {[
              { label: "Low (0-30%)", share: "36%", fill: "bg-emerald-500" },
              { label: "Moderate (30-60%)", share: "34%", fill: "bg-blue-500" },
              { label: "High (60-80%)", share: "28%", fill: "bg-orange-500" },
              { label: "Critical (80-100%)", share: "12%", fill: "bg-red-500" },
            ].map((row, key) => (
              <div key={key} className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2 text-slate-500">
                  <span className={`w-2 h-2 rounded-full ${row.fill}`}></span>
                  <span>{row.label}</span>
                </div>
                <span className="text-slate-800 font-bold">{row.share}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* LOWER DATA TABLE PREVIEW */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4 className="font-bold text-slate-800 text-sm">Recent Alerts</h4>
            <p className="text-[11px] text-slate-400">Real-time edge device safety violations</p>
          </div>
          <button className="text-xs font-bold text-blue-600 hover:underline">View All Alerts →</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { zone: "City Mall Area", msg: "Critical Density Alert", value: "85%", timeframe: "2 mins ago", badge: "bg-red-50 text-red-700 border-red-100" },
            { zone: "Metro Station Gate", msg: "High Density Alert", value: "74%", timeframe: "5 mins ago", badge: "bg-orange-50 text-orange-700 border-orange-100" },
            { zone: "Bus Stand Platform", msg: "Moderate Density Alert", value: "68%", timeframe: "8 mins ago", badge: "bg-amber-50 text-amber-700 border-amber-100" },
          ].map((item, idx) => (
            <div key={idx} className={`p-4 rounded-xl border flex flex-col justify-between h-24 shadow-sm ${item.badge}`}>
              <div className="flex justify-between items-start">
                <div>
                  <h5 className="font-bold text-xs text-slate-900">{item.zone}</h5>
                  <p className="text-[11px] font-medium opacity-80 mt-0.5">{item.msg}</p>
                </div>
                <span className="text-sm font-black bg-white/60 backdrop-blur-sm px-2 py-0.5 rounded-lg border border-black/5 text-slate-950">{item.value}</span>
              </div>
              <span className="text-[10px] font-bold opacity-60 uppercase self-end tracking-wider">⏱️ {item.timeframe}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}