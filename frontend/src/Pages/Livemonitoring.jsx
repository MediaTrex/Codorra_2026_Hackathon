import React from 'react';

export default function Livemonitoring() {
  const videoStreams = [
    { zone: "City Mall Entrance", rate: "85%", status: "Critical", style: "danger" },
    { zone: "Metro Station Gate", rate: "74%", status: "High", style: "warning" },
    { zone: "Bus Stand Platform", rate: "58%", status: "Moderate", style: "neutral" },
    { zone: "Park Entrance", rate: "32%", status: "Low", style: "success" },
    { zone: "College Campus", rate: "46%", status: "Moderate", style: "neutral" },
    { zone: "Railway Station", rate: "67%", status: "High", style: "warning" },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Live Monitoring</h2>
          <p className="text-slate-500 text-xs mt-1">Real-time camera feeds with privacy protection hashing</p>
        </div>
        
        <div className="flex items-center gap-3">
          <select className="bg-white border border-slate-200 px-4 py-2 rounded-xl text-xs font-semibold focus:outline-none focus:border-blue-500 text-slate-600 shadow-sm">
            <option>All Locations</option>
          </select>
          <div className="bg-emerald-50 text-emerald-700 px-3 py-2 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-2 shadow-sm">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping"></span> Live
          </div>
        </div>
      </div>

      {/* CAMERA GRID MOCK */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoStreams.map((feed, key) => (
          <div key={key} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm flex flex-col justify-between">
            {/* FEED CONTAINER GRAPHIC */}
            <div className="aspect-video bg-slate-900 relative flex items-center justify-center overflow-hidden">
              {/* Grid matrix to look like a camera screen mapping crowds */}
              <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] bg-[size:24px_24px]"></div>
              
              {/* SIMULATED MACHINE LEARNING DETECTIONS BOUNDING BOX OVERLAYS */}
              <div className="absolute top-1/3 left-1/4 w-8 h-16 border-2 border-blue-400 rounded bg-blue-400/20 flex flex-col justify-between p-0.5">
                <span className="text-[6px] text-white font-black bg-blue-500 px-0.5 py-px rounded-sm self-start leading-none">94%</span>
              </div>
              <div className="absolute top-1/4 right-1/3 w-10 h-20 border-2 border-emerald-400 rounded bg-emerald-400/20 flex flex-col justify-between p-0.5">
                <span className="text-[6px] text-white font-black bg-emerald-500 px-0.5 py-px rounded-sm self-start leading-none">98%</span>
              </div>
              <div className="absolute bottom-1/4 right-1/4 w-7 h-14 border-2 border-orange-400 rounded bg-orange-400/20 flex flex-col justify-between p-0.5">
                <span className="text-[6px] text-white font-black bg-orange-500 px-0.5 py-px rounded-sm self-start leading-none">89%</span>
              </div>

              {/* WATERMARK STATUS SYSTEM TICKER */}
              <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md text-[9px] font-mono font-bold text-white tracking-widest flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${feed.style === 'danger' ? 'bg-red-500 animate-pulse' : 'bg-emerald-400'}`}></span>
                CAM-00{key + 1} // REC
              </div>

              <span className="text-[11px] text-slate-500 font-mono tracking-wider font-semibold z-10 bg-slate-950/40 px-3 py-1.5 rounded-lg backdrop-blur-sm border border-white/5">Video Stream Context Node</span>
            </div>

            {/* LOWER FEED INFORMATION FOOTER */}
            <div className="p-4 flex items-center justify-between border-t border-slate-50">
              <div>
                <h4 className="font-bold text-slate-800 text-xs">{feed.zone}</h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    feed.style === 'danger' ? 'bg-red-500' :
                    feed.style === 'warning' ? 'bg-orange-500' :
                    feed.style === 'success' ? 'bg-emerald-500' : 'bg-blue-500'
                  }`}></span>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{feed.status}</span>
                </div>
              </div>
              <span className={`text-sm font-black px-2.5 py-1 rounded-xl ${
                feed.style === 'danger' ? 'bg-red-50 text-red-600' :
                feed.style === 'warning' ? 'bg-orange-50 text-orange-600' :
                feed.style === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
              }`}>{feed.rate}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}