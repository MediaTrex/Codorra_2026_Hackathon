import { useState } from "react";
import { TopBar, SectionCard, PageWrapper } from "../components/UI";
import { mockData } from "../services/api";

function LineChart({ data }) {
  const max=Math.max(...data.map(d=>d.value));
  const w=600,h=140,pad=20;
  const pts=data.map((d,i)=>({
    x: pad+(i/(data.length-1))*(w-pad*2),
    y: h-pad-((d.value/max)*(h-pad*2)),
  }));
  const path=pts.map((p,i)=>`${i===0?"M":"L"} ${p.x} ${p.y}`).join(" ");
  const area=path+` L ${pts[pts.length-1].x} ${h} L ${pts[0].x} ${h} Z`;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" style={{height:140}}>
      <defs>
        <linearGradient id="lg" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.3"/>
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0"/>
        </linearGradient>
      </defs>
      {[0,25,50,75,100].map(v=>{
        const y=h-pad-((v/100)*(h-pad*2));
        return <line key={v} x1={pad} y1={y} x2={w-pad} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1"/>;
      })}
      <path d={area} fill="url(#lg)"/>
      <path d={path} fill="none" stroke="#06b6d4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{filter:"drop-shadow(0 0 6px #06b6d4)"}}/>
      {pts.map((p,i)=>(
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#06b6d4" stroke="#080c1a" strokeWidth="2" style={{filter:"drop-shadow(0 0 4px #06b6d4)"}}/>
          <text x={p.x} y={h-2} fill="rgba(255,255,255,0.3)" fontSize="8" textAnchor="middle">{data[i].date}</text>
        </g>
      ))}
    </svg>
  );
}

function MiniDonut({ data }) {
  const total=data.reduce((s,d)=>s+d.value,0);
  let offset=0;
  const r=45,cx=55,cy=55,stroke=14,circ=2*Math.PI*r;
  return (
    <svg width="110" height="110" viewBox="0 0 110 110">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={stroke}/>
      {data.map((d,i)=>{
        const dash=(d.value/total)*circ;
        const el=<circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={d.color} strokeWidth={stroke}
          strokeDasharray={`${dash} ${circ-dash}`} strokeDashoffset={-offset}
          style={{transform:"rotate(-90deg)",transformOrigin:"55px 55px",filter:`drop-shadow(0 0 4px ${d.color}60)`}}/>;
        offset+=dash; return el;
      })}
      <text x={cx} y={cy-4} textAnchor="middle" fill="white" fontSize="14" fontWeight="700">24</text>
      <text x={cx} y={cy+10} textAnchor="middle" fill="#64748b" fontSize="7">Total</text>
    </svg>
  );
}

export default function Analytics() {
  const [range, setRange] = useState("Last 7 Days");
  const { analyticsData } = mockData;

  const topLocations = [
    {name:"City Mall",       value:86, color:"#ef4444"},
    {name:"Metro Station",   value:74, color:"#f97316"},
    {name:"Railway Station", value:67, color:"#f97316"},
    {name:"Bus Stand",       value:58, color:"#f59e0b"},
    {name:"Park Zone",       value:32, color:"#22c55e"},
  ];

  const statCards = [
    {label:"Total People Count",  value:"125,430", change:"↑ 18.6%", pos:true },
    {label:"Peak Density",        value:"92%",     change:"↑ 5%",    pos:true },
    {label:"Avg Daily Density",   value:"63%",     change:"↑ 7%",    pos:false},
    {label:"Total Alerts",        value:"36",      change:"↓ 12%",   pos:true },
  ];

  return (
    <PageWrapper>
      <TopBar title="Analytics Overview" subtitle="Detailed insights and trends"/>
      <div className="p-8 space-y-6">
        <div className="flex justify-end">
          <select value={range} onChange={e=>setRange(e.target.value)}
            className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500/40">
            {["Last 7 Days","Last 30 Days","Last 90 Days"].map(r=><option key={r}>{r}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-4 gap-4">
          {statCards.map((s,i)=>(
            <div key={i} className="rounded-2xl border border-white/8 p-5 hover:border-white/15 transition-all" style={{background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)"}}>
              <div className="text-slate-500 text-xs font-medium mb-2 uppercase tracking-wide">{s.label}</div>
              <div className="text-white font-bold text-2xl">{s.value}</div>
              <div className={`text-xs mt-1 ${s.pos?"text-green-400":"text-red-400"}`}>{s.change}</div>
            </div>
          ))}
        </div>

        <SectionCard title="Density Trend">
          <LineChart data={analyticsData.densityTrend}/>
        </SectionCard>

        <div className="grid grid-cols-2 gap-4">
          <SectionCard title="Top Locations by Density">
            <div className="space-y-3">
              {topLocations.map((loc,i)=>(
                <div key={i} className="flex items-center gap-3">
                  <span className="text-slate-600 text-xs w-4">{i+1}</span>
                  <span className="text-slate-400 text-sm flex-1">{loc.name}</span>
                  <div className="w-24 bg-white/5 rounded-full h-1.5">
                    <div className="h-full rounded-full transition-all duration-700" style={{width:`${loc.value}%`,backgroundColor:loc.color,boxShadow:`0 0 8px ${loc.color}80`}}/>
                  </div>
                  <span className="text-xs font-bold w-8 text-right" style={{color:loc.color}}>{loc.value}%</span>
                </div>
              ))}
            </div>
          </SectionCard>
          <SectionCard title="Density by Category">
            <div className="flex items-center gap-6">
              <MiniDonut data={mockData.densityDistribution}/>
              <div className="space-y-2">
                {mockData.densityDistribution.map((d,i)=>(
                  <div key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full" style={{backgroundColor:d.color,boxShadow:`0 0 6px ${d.color}`}}/>
                    <span className="text-slate-400 text-xs">{d.label}</span>
                    <span className="text-white text-xs font-bold ml-auto pl-6">{d.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </SectionCard>
        </div>
      </div>
    </PageWrapper>
  );
}