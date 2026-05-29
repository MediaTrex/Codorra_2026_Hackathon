import React from 'react';

export default function Heatmap() {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Crowd Density Heatmap</h2>
          <p className="text-slate-500 text-xs mt-1">Visualize crowd density layers across spatial city coordinates</p>
        </div>
        <button className="bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-slate-50">
          Today ▼
        </button>
      </div>

      {/* HEATMAP MAIN CANVAS PLATFORM */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col h-[520px]">
        <div className="flex-1 bg-slate-50 rounded-xl relative overflow-hidden border border-slate-200/60 flex items-center justify-center">
          {/* MAP CANVAS BACKDROP LAYER */}
          <div className="absolute inset-0 opacity-[0.06] bg-[radial-gradient(#000_1.5px,transparent_1.5px)] [background-size:20px_20px]"></div>

          {/* SIMULATED GAUSSIAN GRADIENT HEAT BURSTS */}
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-red-500/40 rounded-full filter blur-[50px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-1/3 left-1/3 w-80 h-80 bg-amber-400/50 rounded-full filter blur-[65px] mix-blend-multiply"></div>
          <div className="absolute bottom-1/4 right-1/3 w-52 h-52 bg-emerald-400/40 rounded-full filter blur-[45px] mix-blend-multiply"></div>

          {/* STREET OVERLAY MARKERS MATCHING GRAPHIC SPEC */}
          <div className="absolute top-1/3 right-1/3 bg-white/90 border shadow-sm backdrop-blur-sm text-[10px] font-bold text-slate-800 px-2.5 py-1 rounded-lg">
            🏬 City Mall Cluster
          </div>
          <div className="absolute top-1/2 left-1/4 bg-white/90 border shadow-sm backdrop-blur-sm text-[10px] font-bold text-slate-800 px-2.5 py-1 rounded-lg">
            🚉 Railway Hub Junction
          </div>

          <p className="text-slate-400 font-medium text-xs bg-white border border-slate-200/80 px-4 py-2 rounded-xl shadow-sm z-10 backdrop-blur-md">
            GIS Thermal Render Engine Pipeline Wrapper
          </p>

          {/* LEGEND SPEC RANGE SELECTOR ON FOOTER GRID */}
          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md px-4 py-2.5 rounded-xl border border-slate-200 shadow-lg max-w-sm w-64 flex flex-col gap-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Density Index Range</span>
            <div className="h-2.5 w-full bg-gradient-to-r from-emerald-400 via-amber-400 to-red-500 rounded-full"></div>
            <div className="flex justify-between text-[9px] font-extrabold text-slate-500 uppercase tracking-wider">
              <span>Low</span>
              <span>Moderate</span>
              <span>Critical</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}