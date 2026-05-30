import { useState } from "react";
import { TopBar, PageWrapper } from "../components/UI";
import { Download, FileText, BarChart2, Bell, MapPin, RefreshCw } from "lucide-react";

const REPORTS = [
  {id:1, icon:FileText,  title:"Daily Summary Report",        desc:"Overview of daily crowd density",  color:"text-blue-400",   bg:"bg-blue-500/10",   border:"border-blue-500/20"  },
  {id:2, icon:BarChart2, title:"Weekly Analytics Report",     desc:"Detailed weekly analytics",         color:"text-cyan-400",   bg:"bg-cyan-500/10",   border:"border-cyan-500/20"  },
  {id:3, icon:Bell,      title:"Alerts Summary Report",       desc:"Summary of all alerts",             color:"text-yellow-400", bg:"bg-yellow-500/10", border:"border-yellow-500/20"},
  {id:4, icon:MapPin,    title:"Location Performance Report", desc:"Performance of each location",      color:"text-green-400",  bg:"bg-green-500/10",  border:"border-green-500/20" },
];

export default function Reports() {
  const [startDate, setStartDate] = useState("2025-05-12");
  const [endDate,   setEndDate]   = useState("2025-05-18");
  const [location,  setLocation]  = useState("All Locations");
  const [loading,   setLoading]   = useState(null);

  const handleDownload = async (id) => {
    setLoading(id);
    await new Promise(r=>setTimeout(r,1500));
    setLoading(null);
  };

  return (
    <PageWrapper>
      <TopBar title="Reports" subtitle="Generate and download reports"/>
      <div className="p-8 space-y-6">
        <div className="rounded-2xl border border-white/8 p-5" style={{background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)"}}>
          <h2 className="text-white font-semibold text-sm mb-4">Report Filters</h2>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-slate-500 text-xs mb-1.5 block font-medium uppercase tracking-wide">Start Date</label>
              <input type="date" value={startDate} onChange={e=>setStartDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500/40"/>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1.5 block font-medium uppercase tracking-wide">End Date</label>
              <input type="date" value={endDate} onChange={e=>setEndDate(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500/40"/>
            </div>
            <div>
              <label className="text-slate-500 text-xs mb-1.5 block font-medium uppercase tracking-wide">Location</label>
              <select value={location} onChange={e=>setLocation(e.target.value)}
                className="w-full bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-cyan-500/40">
                <option>All Locations</option>
                <option>City Mall</option>
                <option>Metro Station</option>
                <option>Railway Station</option>
                <option>Bus Stand</option>
                <option>Park Zone</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {REPORTS.map(r=>{
            const Icon=r.icon;
            const isLoading=loading===r.id;
            return (
              <div key={r.id} className={`flex items-center gap-4 rounded-2xl border p-5 hover:border-white/15 transition-all duration-200 ${r.bg} ${r.border}`}
                style={{background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)"}}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${r.bg} border ${r.border}`}>
                  <Icon size={18} className={r.color}/>
                </div>
                <div className="flex-1">
                  <div className="text-white text-sm font-semibold">{r.title}</div>
                  <div className="text-slate-500 text-xs mt-0.5">{r.desc}</div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-slate-600 text-xs">{startDate} – {endDate}</span>
                  <button onClick={()=>handleDownload(r.id)} disabled={isLoading}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200
                      ${isLoading?"bg-white/5 text-slate-500 cursor-not-allowed":"bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20"}`}>
                    {isLoading ? <><RefreshCw size={14} className="animate-spin"/>Generating...</> : <><Download size={14}/>Download PDF</>}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageWrapper>
  );
}