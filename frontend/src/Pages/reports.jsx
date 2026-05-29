import React from 'react';

export default function Reports() {
  const reportList = [
    { name: "Daily Summary Report", desc: "Overview of daily crowd density levels and trend deviations.", target: "Daily_Summary.pdf" },
    { name: "Weekly Analytics Report", desc: "Detailed weekly analytics logs processed via inference engines.", target: "Weekly_Analytics.pdf" },
    { name: "Alerts Summary Report", desc: "Aggregated chronological data on critical safety limit overshoots.", target: "Alerts_Summary.pdf" },
    { name: "Location Performance Report", desc: "Spatial traffic tracking and safety scoring index across matrix cells.", target: "Location_Performance.pdf" }
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Reports</h2>
        <p className="text-slate-500 text-xs mt-1">Generate and export system density metrics</p>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex flex-col sm:flex-row gap-4 items-end">
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Date Range</label>
          <input type="date" defaultValue="2026-05-12" className="w-full bg-slate-50 border border-slate-200 px-4 py-2 rounded-xl text-xs font-medium focus:outline-none focus:border-blue-500" />
        </div>
        <div className="flex-1 space-y-1.5 w-full">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Location</label>
          <select className="w-full bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-600">
            <option>All Locations</option>
            <option>City Mall Entrance</option>
            <option>Metro Station Gate</option>
          </select>
        </div>
        <button className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all whitespace-nowrap">
          Filter Reports
        </button>
      </div>

      {/* DOWNLOADABLE EXPORT CARDS */}
      <div className="space-y-3">
        {reportList.map((doc, key) => (
          <div key={key} className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center text-lg font-bold">📄</div>
              <div>
                <h4 className="font-bold text-sm text-slate-800">{doc.name}</h4>
                <p className="text-xs text-slate-400 mt-0.5">{doc.desc}</p>
              </div>
            </div>
            <button className="bg-[#0f172a] hover:bg-slate-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-center">
              Download PDF
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}