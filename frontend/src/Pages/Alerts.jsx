import { useState } from "react";
import { TopBar, DensityBar, PageWrapper } from "../components/UI";
import { mockData } from "../services/api";
import { Eye, RefreshCw } from "lucide-react";

const FILTERS = ["All Alerts","Critical","High","Moderate","Low"];

const levelColors = {
  critical:{ bg:"bg-red-500/10",    border:"border-red-500/20",    text:"text-red-400",    badge:"bg-red-500/20 text-red-400",    dot:"bg-red-500"    },
  high:    { bg:"bg-orange-500/10", border:"border-orange-500/20", text:"text-orange-400", badge:"bg-orange-500/20 text-orange-400", dot:"bg-orange-500" },
  moderate:{ bg:"bg-yellow-500/10", border:"border-yellow-500/20", text:"text-yellow-400", badge:"bg-yellow-500/20 text-yellow-400", dot:"bg-yellow-500" },
  low:     { bg:"bg-green-500/10",  border:"border-green-500/20",  text:"text-green-400",  badge:"bg-green-500/20 text-green-400",  dot:"bg-green-500"  },
};

export default function Alerts() {
  const [filter, setFilter] = useState("All Alerts");
  const alerts = mockData.alerts;
  const filtered = filter==="All Alerts" ? alerts : alerts.filter(a=>a.level===filter.toLowerCase());

  return (
    <PageWrapper>
      <TopBar title="Alerts" subtitle="Real-time alerts and notifications"/>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
            {FILTERS.map(f=>(
              <button key={f} onClick={()=>setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${filter===f?"bg-cyan-500/20 text-cyan-400 border border-cyan-500/30":"text-slate-500 hover:text-slate-200"}`}>
                {f}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-400 hover:text-white text-sm transition-colors">
            <RefreshCw size={14}/>Refresh
          </button>
        </div>

        <div className="flex gap-4">
          {[
            {label:"Total",    count:alerts.length,                              color:"text-white"  },
            {label:"Critical", count:alerts.filter(a=>a.level==="critical").length, color:"text-red-400" },
            {label:"High",     count:alerts.filter(a=>a.level==="high").length,     color:"text-orange-400"},
            {label:"Moderate", count:alerts.filter(a=>a.level==="moderate").length, color:"text-yellow-400"},
            {label:"Low",      count:alerts.filter(a=>a.level==="low").length,      color:"text-green-400"},
          ].map(s=>(
            <div key={s.label} className="rounded-xl border border-white/8 px-4 py-3 text-center" style={{background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)"}}>
              <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-slate-600 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)"}}>
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Alerts Feed</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
              <span className="text-red-400 text-xs font-semibold">Live</span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {filtered.map(alert=>{
              const c=levelColors[alert.level]||levelColors.low;
              return (
                <div key={alert.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group ${c.bg}`}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`}/>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1.5">
                      <span className="text-white text-sm font-semibold">{alert.location}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{alert.type}</span>
                    </div>
                    <div className="max-w-xs"><DensityBar value={alert.density}/></div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className={`text-2xl font-black ${c.text}`}>{alert.density}%</span>
                    <span className="text-slate-600 text-xs">{alert.time}</span>
                    <button className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-all"><Eye size={14}/></button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}