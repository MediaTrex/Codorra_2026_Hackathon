import { Bell, Search, ChevronDown } from "lucide-react";

export function TopBar({ title, subtitle }) {
  return (
    <div className="flex items-center justify-between px-8 py-4 border-b border-white/5 bg-[#080c1a]/80 backdrop-blur-sm sticky top-0 z-40">
      <div>
        <h1 className="text-white font-bold text-xl tracking-tight">{title} <span className="text-2xl">👋</span></h1>
        {subtitle && <p className="text-slate-500 text-xs mt-0.5">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input placeholder="Search anything..." className="pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/8 rounded-xl text-slate-300 placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 w-52" />
        </div>
        <button className="relative p-2 rounded-xl bg-white/5 border border-white/8 text-slate-400 hover:text-white transition-colors">
          <Bell size={16} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/8 cursor-pointer hover:bg-white/8 transition-colors">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">A</div>
          <div>
            <div className="text-white text-xs font-semibold leading-none">Admin</div>
            <div className="text-slate-500 text-[10px] mt-0.5">Super Admin</div>
          </div>
          <ChevronDown size={12} className="text-slate-500 ml-1" />
        </div>
      </div>
    </div>
  );
}

export function StatCard({ icon, label, value, sub, subColor = "text-green-400" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/8 p-5 group hover:border-white/15 transition-all duration-300"
      style={{ background: "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)" }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-slate-500 text-xs font-medium tracking-wide uppercase">{label}</span>
        <div className="text-xl">{icon}</div>
      </div>
      <div className="text-white font-bold text-2xl mb-1">{value}</div>
      {sub && <div className={`text-xs ${subColor}`}>{sub}</div>}
    </div>
  );
}

export function DensityBadge({ value }) {
  const level =
    value >= 80 ? { label: "Critical", color: "text-red-400",    bg: "bg-red-500/15",    dot: "bg-red-500"    }
  : value >= 60 ? { label: "High",     color: "text-orange-400", bg: "bg-orange-500/15", dot: "bg-orange-500" }
  : value >= 30 ? { label: "Moderate", color: "text-yellow-400", bg: "bg-yellow-500/15", dot: "bg-yellow-500" }
  :               { label: "Low",      color: "text-green-400",  bg: "bg-green-500/15",  dot: "bg-green-500"  };
  return (
    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${level.bg}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${level.dot}`} />
      <span className={`text-xs font-semibold ${level.color}`}>{level.label}</span>
    </div>
  );
}

export function DensityBar({ value }) {
  const color =
    value >= 80 ? "from-red-500 to-red-400"
  : value >= 60 ? "from-orange-500 to-yellow-400"
  : value >= 30 ? "from-yellow-500 to-yellow-300"
  :               "from-green-500 to-emerald-400";
  return (
    <div className="w-full bg-white/8 rounded-full h-1.5 overflow-hidden">
      <div className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`} style={{ width: `${value}%` }} />
    </div>
  );
}

export function SectionCard({ title, action, actionLabel = "View All", children, className = "" }) {
  return (
    <div className={`rounded-2xl border border-white/8 overflow-hidden ${className}`}
      style={{ background: "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)" }}>
      {title && (
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
          <h2 className="text-white font-semibold text-sm">{title}</h2>
          {action && (
            <button onClick={action} className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors">
              {actionLabel} →
            </button>
          )}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}

export function PageWrapper({ children }) {
  return (
    <div className="min-h-screen bg-[#05070f]"
      style={{ backgroundImage: `radial-gradient(ellipse at 20% 0%,rgba(6,182,212,0.04) 0%,transparent 60%), radial-gradient(ellipse at 80% 100%,rgba(59,130,246,0.04) 0%,transparent 60%)` }}>
      {children}
    </div>
  );
}