import { useState } from "react";
import { Shield, Eye, EyeOff, Mail, Lock, User, CheckCircle } from "lucide-react";

export default function Login({ onLogin }) {
  const [tab, setTab]         = useState("login");
  const [email, setEmail]     = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [name, setName]       = useState("");
  const [showPw, setShowPw]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setLoading(false);
    onLogin();
  };

  const features = ["Real-time Monitoring","Privacy First","AI Powered Analytics","Smart Alerts"];

  return (
    <div className="min-h-screen flex bg-[#05070f]"
      style={{ backgroundImage: `radial-gradient(ellipse at 30% 20%,rgba(6,182,212,0.08) 0%,transparent 50%), radial-gradient(ellipse at 70% 80%,rgba(59,130,246,0.08) 0%,transparent 50%)` }}>

      {/* Left branding panel */}
      <div className="hidden lg:flex w-1/2 flex-col items-center justify-center p-16 relative overflow-hidden">
        <div className="absolute inset-0" style={{ backgroundImage:`linear-gradient(rgba(6,182,212,0.04) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.04) 1px,transparent 1px)`, backgroundSize:"50px 50px" }} />
        <div className="absolute w-96 h-96 rounded-full opacity-10 animate-pulse" style={{ background:"radial-gradient(circle,#06b6d4,transparent)", top:"10%", left:"10%" }} />
        <div className="absolute w-64 h-64 rounded-full opacity-10 animate-pulse" style={{ background:"radial-gradient(circle,#3b82f6,transparent)", bottom:"15%", right:"5%", animationDelay:"1s" }} />

        <div className="relative text-center">
          <div className="mb-10 flex justify-center">
            <div className="relative">
              <div className="w-48 h-48 rounded-3xl flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,rgba(6,182,212,0.15) 0%,rgba(59,130,246,0.15) 100%)", border:"1px solid rgba(6,182,212,0.2)", boxShadow:"0 0 60px rgba(6,182,212,0.15),inset 0 1px 0 rgba(255,255,255,0.05)" }}>
                <svg viewBox="0 0 120 100" width="100" height="84">
                  <rect x="10" y="40" width="20" height="60" rx="2" fill="rgba(6,182,212,0.3)" stroke="rgba(6,182,212,0.5)" strokeWidth="1"/>
                  <rect x="35" y="20" width="25" height="80" rx="2" fill="rgba(6,182,212,0.4)" stroke="rgba(6,182,212,0.6)" strokeWidth="1"/>
                  <rect x="65" y="30" width="20" height="70" rx="2" fill="rgba(59,130,246,0.3)" stroke="rgba(59,130,246,0.5)" strokeWidth="1"/>
                  <rect x="90" y="50" width="20" height="50" rx="2" fill="rgba(6,182,212,0.25)" stroke="rgba(6,182,212,0.4)" strokeWidth="1"/>
                  {[[13,44],[13,54],[23,44],[23,54],[38,24],[38,34],[38,44],[50,24],[50,34],[50,44],[68,34],[68,44],[68,54],[80,34],[80,44],[93,54],[93,64],[105,54]].map(([x,y],i)=>(
                    <rect key={i} x={x} y={y} width="4" height="4" rx="0.5" fill="rgba(6,182,212,0.8)" style={{filter:"drop-shadow(0 0 2px #06b6d4)"}}/>
                  ))}
                  {[[20,92],[25,92],[40,92],[50,92],[60,95],[70,92],[85,92],[95,95]].map(([x,y],i)=>(
                    <circle key={i} cx={x} cy={y} r="2" fill="rgba(6,182,212,0.9)"/>
                  ))}
                  <circle cx="47" cy="90" r="8" fill="rgba(239,68,68,0.3)" stroke="rgba(239,68,68,0.6)" strokeWidth="1"/>
                </svg>
              </div>
              <div className="absolute -top-3 -right-3 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/40">
                <Shield size={18} className="text-white"/>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-black text-white mb-2 tracking-tight">CrowdGuard</h1>
          <p className="text-cyan-400/80 text-sm mb-10 font-medium tracking-widest uppercase">Privacy-Preserving Crowd Density Estimator</p>
          <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
            {features.map(f => (
              <div key={f} className="flex items-center gap-2 bg-white/3 rounded-xl px-3 py-2 border border-white/5">
                <CheckCircle size={12} className="text-cyan-400 flex-shrink-0"/>
                <span className="text-slate-400 text-xs">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="rounded-3xl border border-white/8 p-8" style={{ background:"linear-gradient(135deg,#0d1225 0%,#080c1a 100%)", boxShadow:"0 40px 80px rgba(0,0,0,0.5)" }}>
            {/* Tabs */}
            <div className="flex bg-white/5 rounded-xl p-1 mb-8 border border-white/8">
              {["login","signup"].map(t => (
                <button key={t} onClick={() => setTab(t)}
                  className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 capitalize
                    ${tab===t ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20" : "text-slate-500 hover:text-slate-300"}`}>
                  {t === "login" ? "Login" : "Sign Up"}
                </button>
              ))}
            </div>

            <div className="space-y-4">
              {tab === "signup" && (
                <div>
                  <label className="text-slate-500 text-xs font-medium uppercase tracking-wide block mb-1.5">Full Name</label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
                    <input type="text" placeholder="John Doe" value={name} onChange={e=>setName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"/>
                  </div>
                </div>
              )}
              <div>
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide block mb-1.5">Email Address</label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
                  <input type="email" placeholder="admin@example.com" value={email} onChange={e=>setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"/>
                </div>
              </div>
              <div>
                <label className="text-slate-500 text-xs font-medium uppercase tracking-wide block mb-1.5">Password</label>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500"/>
                  <input type={showPw?"text":"password"} placeholder="••••••••" value={password} onChange={e=>setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-white/5 border border-white/10 rounded-xl text-slate-300 placeholder-slate-600 text-sm focus:outline-none focus:border-cyan-500/50 transition-all"/>
                  <button onClick={()=>setShowPw(!showPw)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPw ? <EyeOff size={15}/> : <Eye size={15}/>}
                  </button>
                </div>
              </div>
              {tab==="login" && (
                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 cursor-pointer" onClick={()=>setRemember(!remember)}>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${remember?"bg-cyan-500 border-cyan-500":"border-white/20 bg-white/5"}`}>
                      {remember && <span className="text-white text-[10px]">✓</span>}
                    </div>
                    <span className="text-slate-500 text-xs">Remember me</span>
                  </label>
                  <button className="text-cyan-400 text-xs hover:text-cyan-300 transition-colors">Forgot Password?</button>
                </div>
              )}
              <button onClick={handleSubmit} disabled={loading}
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 mt-2">
                {loading ? "Authenticating..." : tab==="login" ? "Login" : "Create Account"}
              </button>
              <div className="flex items-center gap-3 my-2">
                <div className="flex-1 h-px bg-white/8"/>
                <span className="text-slate-600 text-xs">or continue with</span>
                <div className="flex-1 h-px bg-white/8"/>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {["Google","Microsoft"].map(p=>(
                  <button key={p} className="flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/8 text-slate-400 hover:text-white hover:bg-white/8 text-sm transition-all font-medium">{p}</button>
                ))}
              </div>
              <p className="text-center text-slate-600 text-xs">
                {tab==="login" ? "Don't have an account? " : "Already have an account? "}
                <button onClick={()=>setTab(tab==="login"?"signup":"login")} className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors">
                  {tab==="login" ? "Sign up" : "Login"}
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}