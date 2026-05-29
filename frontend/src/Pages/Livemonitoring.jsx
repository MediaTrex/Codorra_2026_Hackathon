import { useState } from "react";
import { mockData } from "../services/api";
import { TopBar, DensityBadge, DensityBar, PageWrapper } from "../components/UI";
import { Grid2X2, List } from "lucide-react";

const FEEDS = mockData.locations.map((l,i)=>({
  ...l,
  isLive: i < 4,
  image: `https://picsum.photos/seed/crowd${i+1}/400/220`,
}));

export default function LiveMonitoring() {
  const [location, setLocation] = useState("All Locations");
  const [view, setView]         = useState("grid");

  return (
    <PageWrapper>
      <TopBar title="Live Monitoring" subtitle="Real-time camera feeds with privacy protection"/>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={location} onChange={e=>setLocation(e.target.value)}
              className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500/40">
              <option>All Locations</option>
              {FEEDS.map(f=><option key={f.id}>{f.name}</option>)}
            </select>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/15 border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-green-400 text-xs font-semibold">Live</span>
            </div>
          </div>
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
            <button onClick={()=>setView("grid")} className={`p-2 rounded-lg transition-colors ${view==="grid"?"bg-cyan-500/20 text-cyan-400":"text-slate-500 hover:text-white"}`}><Grid2X2 size={16}/></button>
            <button onClick={()=>setView("list")} className={`p-2 rounded-lg transition-colors ${view==="list"?"bg-cyan-500/20 text-cyan-400":"text-slate-500 hover:text-white"}`}><List size={16}/></button>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          {FEEDS.map(feed=>(
            <div key={feed.id} className="rounded-2xl overflow-hidden border border-white/8 group hover:border-cyan-500/30 transition-all duration-300"
              style={{background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)"}}>
              <div className="relative h-44 overflow-hidden bg-slate-900">
                <img src={feed.image} alt={feed.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"/>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                <div className="absolute top-2 left-2">
                  {feed.isLive
                    ? <div className="flex items-center gap-1 bg-red-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/><span className="text-white text-[10px] font-bold">LIVE</span></div>
                    : <div className="flex items-center gap-1 bg-slate-700/90 backdrop-blur-sm px-2 py-0.5 rounded-full"><span className="text-slate-400 text-[10px] font-bold">OFFLINE</span></div>
                  }
                </div>
                <div className="absolute bottom-2 right-2">
                  <div className={`text-2xl font-black ${feed.density>=80?"text-red-400":feed.density>=60?"text-orange-400":feed.density>=30?"text-yellow-400":"text-green-400"}`}
                    style={{textShadow:"0 0 20px currentColor"}}>{feed.density}%</div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-white text-sm font-semibold">{feed.name}</span>
                  <DensityBadge value={feed.density}/>
                </div>
                <DensityBar value={feed.density}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageWrapper>
  );
}
