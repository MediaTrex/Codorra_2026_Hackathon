import { useState } from "react";
import { mockData } from "../services/api";
import { TopBar, StatCard, SectionCard, DensityBar, PageWrapper } from "../components/UI";

function DonutChart({ data }) {
  const total = data.reduce((s,d)=>s+d.value,0);
  let offset = 0;
  const r=70,cx=90,cy=90,stroke=22,circ=2*Math.PI*r;
  return (
    <div className="flex items-center gap-6">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
        {data.map((d,i)=>{
          const dash=(d.value/total)*circ;
          const el=(
            <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={stroke}
              strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-offset}
              style={{transform:"rotate(-90deg)",transformOrigin:"90px 90px",filter:`drop-shadow(0 0 4px ${d.color}80)`}}/>
          );
          offset+=dash; return el;
        })}
        <text x={cx} y={cy-6} textAnchor="middle" fill="white" fontSize="20" fontWeight="700">24</text>
        <text x={cx} y={cy+12} textAnchor="middle" fill="#64748b" fontSize="10">Total</text>
      </svg>
      <div className="space-y-2">
        {data.map((d,i)=>(
          <div key={i} className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{backgroundColor:d.color,boxShadow:`0 0 6px ${d.color}`}}/>
            <span className="text-slate-400 text-xs">{d.label}</span>
            <span className="text-white text-xs font-bold ml-auto pl-4">{d.value}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniMap({ locations }) {
  const colors={critical:"#ef4444",high:"#f97316",moderate:"#f59e0b",low:"#22c55e"};
  return (
    <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#0a1628]">
      <div className="absolute inset-0" style={{ backgroundImage:`linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px)`, backgroundSize:"30px 30px" }}/>
      {locations.map((loc,i)=>(
        <div key={i} className="absolute flex items-center justify-center rounded-full text-white text-[10px] font-bold border-2 border-[#0a1628] cursor-pointer hover:scale-110 transition-transform shadow-lg"
          style={{ left:`${15+i*14}%`, top:`${20+(i%3)*25}%`, width:28, height:28, backgroundColor:colors[loc.status], boxShadow:`0 0 12px ${colors[loc.status]}80` }}>
          {loc.density}
        </div>
      ))}
      <div className="absolute bottom-2 left-2 text-[10px] text-slate-500 bg-black/40 px-2 py-1 rounded-lg backdrop-blur-sm">Live Map View</div>
    </div>
  );
}

export default function Dashboard() {
  const [stats]     = useState(mockData.stats);
  const [locations] = useState(mockData.locations);
  const [alerts]    = useState(mockData.alerts.slice(0,3));

  const statCards = [
    { icon:"📍", label:"Total Locations",    value:stats.totalLocations,     sub:"↑ 12% from yesterday", subColor:"text-green-400"  },
    { icon:"📡", label:"Live Feeds",         value:stats.liveFeeds,          sub:"● Online",             subColor:"text-green-400"  },
    { icon:"⚠️", label:"High Density Alerts",value:stats.highDensityAlerts,  sub:"● Active Now",         subColor:"text-red-400"    },
    { icon:"📊", label:"Avg Density",        value:`${stats.avgDensity}%`,   sub:"↑ 8% from yesterday",  subColor:"text-orange-400" },
  ];

  const levelColors = {
    critical:{ bg:"bg-red-500/10",    border:"border-red-500/20",    dot:"bg-red-500",    text:"text-red-400"    },
    high:    { bg:"bg-orange-500/10", border:"border-orange-500/20", dot:"bg-orange-500", text:"text-orange-400" },
    moderate:{ bg:"bg-yellow-500/10", border:"border-yellow-500/20", dot:"bg-yellow-500", text:"text-yellow-400" },
  };

  return (
    <PageWrapper>
      <TopBar title="Dashboard" subtitle="Real-time overview of crowd density across all locations"/>
      <div className="p-8 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((c,i)=><StatCard key={i} {...c}/>)}
        </div>
        <div className="grid grid-cols-5 gap-4">
          <SectionCard title="Live Overview" className="col-span-3">
            <MiniMap locations={locations}/>
          </SectionCard>
          <SectionCard title="Density Distribution" className="col-span-2">
            <DonutChart data={mockData.densityDistribution}/>
          </SectionCard>
        </div>
        <SectionCard title="Recent Alerts" actionLabel="View All Alerts →">
          <div className="grid grid-cols-3 gap-4">
            {alerts.map(a=>{
              const c=levelColors[a.level]||levelColors.moderate;
              return (
                <div key={a.id} className={`rounded-xl border p-4 ${c.bg} ${c.border}`}>
                  <div className="flex items-start gap-2 mb-2">
                    <span className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${c.dot}`}/>
                    <div>
                      <div className="text-white text-sm font-semibold">{a.location}</div>
                      <div className={`text-xs ${c.text}`}>{a.type}</div>
                    </div>
                    <span className={`ml-auto text-xl font-bold ${c.text}`}>{a.density}%</span>
                  </div>
                  <DensityBar value={a.density}/>
                  <div className="text-slate-600 text-[10px] mt-2">{a.time}</div>
                </div>
              );
            })}
          </div>
        </SectionCard>
      </div>
    </PageWrapper>
  );
}