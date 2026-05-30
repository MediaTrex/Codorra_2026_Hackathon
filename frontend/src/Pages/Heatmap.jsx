import { useState } from "react";
import { TopBar, PageWrapper, SectionCard } from "../components/UI";
import { mockData } from "../services/api";

export default function Heatmap() {
  const [date, setDate] = useState("Today");

  return (
    <PageWrapper>
      <TopBar title="Crowd Density Heatmap" subtitle="Visualize crowd density across the city"/>
      <div className="p-8 space-y-6">
        <div className="flex gap-2">
          {["Today","Yesterday","Last 7 Days"].map(d=>(
            <button key={d} onClick={()=>setDate(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${date===d?"bg-cyan-500/20 text-cyan-400 border border-cyan-500/30":"text-slate-500 hover:text-slate-200 bg-white/5 border border-white/8"}`}>
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Main heatmap */}
          <div className="col-span-2 rounded-2xl overflow-hidden border border-white/8" style={{background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)",minHeight:500}}>
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-white font-semibold text-sm">Crowd Density Heatmap</h2>
            </div>
            <div className="relative" style={{height:450}}>
              <div className="absolute inset-0 p-4"
                style={{ backgroundImage:`linear-gradient(rgba(6,182,212,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.06) 1px,transparent 1px)`, backgroundSize:"40px 40px", backgroundColor:"#070c1a" }}/>
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 600 450" preserveAspectRatio="none">
                <line x1="0" y1="150" x2="600" y2="150" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
                <line x1="0" y1="300" x2="600" y2="300" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
                <line x1="150" y1="0" x2="150" y2="450" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
                <line x1="350" y1="0" x2="350" y2="450" stroke="rgba(255,255,255,0.06)" strokeWidth="12"/>
                <line x1="500" y1="0" x2="500" y2="450" stroke="rgba(255,255,255,0.06)" strokeWidth="8"/>
              </svg>
              {[
                {x:32,y:25,r:90,color:"#ef4444",label:"City Mall"},
                {x:62,y:45,r:75,color:"#f97316",label:"Metro Station"},
                {x:20,y:65,r:60,color:"#22c55e",label:"Park Zone"},
                {x:75,y:68,r:65,color:"#f59e0b",label:"Railway Station"},
                {x:50,y:75,r:55,color:"#3b82f6",label:"College"},
              ].map((blob,i)=>(
                <div key={i} className="absolute group" style={{left:`${blob.x}%`,top:`${blob.y}%`}}>
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
                    style={{width:blob.r*1.8,height:blob.r*1.8,background:`radial-gradient(circle,${blob.color}99 0%,transparent 70%)`,filter:"blur(8px)"}}/>
                  <div className="absolute -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
                    {blob.label}
                  </div>
                  <div className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white" style={{boxShadow:`0 0 8px ${blob.color}`}}/>
                </div>
              ))}
              {[
                {label:"City Mall",x:32,y:18},{label:"Metro Station",x:65,y:38},
                {label:"Park Zone",x:18,y:60},{label:"Railway Station",x:72,y:78},{label:"College",x:48,y:85},
              ].map((l,i)=>(
                <div key={i} className="absolute text-[10px] text-white/80 font-medium pointer-events-none"
                  style={{left:`${l.x}%`,top:`${l.y}%`,transform:"translate(-50%,-50%)"}}>
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          {/* Side panels */}
          <div className="space-y-4">
            <SectionCard title="Density Scale">
              <div className="space-y-3">
                <div className="h-4 rounded-full w-full" style={{background:"linear-gradient(to right,#22c55e,#f59e0b,#f97316,#ef4444)"}}/>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Low</span><span>Moderate</span><span>High</span><span>Critical</span>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Location Summary">
              <div className="space-y-3">
                {mockData.locations.map(loc=>{
                  const color=loc.density>=80?"#ef4444":loc.density>=60?"#f97316":loc.density>=30?"#f59e0b":"#22c55e";
                  return (
                    <div key={loc.id} className="flex items-center gap-3">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor:color,boxShadow:`0 0 8px ${color}`}}/>
                      <span className="text-slate-400 text-xs flex-1 truncate">{loc.name}</span>
                      <span className="text-xs font-bold" style={{color}}>{loc.density}%</span>
                    </div>
                  );
                })}
              </div>
            </SectionCard>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}