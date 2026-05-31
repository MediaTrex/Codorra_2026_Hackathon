import { useState, useEffect } from "react";
import { TopBar, DensityBadge, DensityBar, PageWrapper } from "../components/UI";
import { Grid2X2, List, RefreshCw } from "lucide-react";
import { api } from "../Services/api";

export default function LiveMonitoring() {
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [location, setLocation] = useState("All Locations");
  const [view, setView] = useState("grid");

  const fetchCameras = async () => {
    setLoading(true);
    try {
      const res = await api.listCameras({ limit: 20 });
      if (res?.data?.cameras) {
        setCameras(res.data.cameras);
        console.log("Fetched cameras:", res.data.cameras);
      }
    } catch (err) {
      console.error("Failed to fetch cameras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const filteredCameras = location === "All Locations"
    ? cameras
    : cameras.filter(c => c.name === location);

  return (
    <PageWrapper>
      <TopBar title="Live Monitoring" subtitle="Real-time camera feeds with privacy protection"/>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select value={location} onChange={e => setLocation(e.target.value)}
              className="bg-white/5 border border-white/10 text-slate-300 text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500/40">
              <option>All Locations</option>
              {cameras.map((c, i) => (
                <option key={c._id || i}>{c.name || `Camera ${i + 1}`}</option>
              ))}
            </select>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/15 border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"/>
              <span className="text-green-400 text-xs font-semibold">Live</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchCameras}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-400 hover:text-white text-sm transition-colors"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>Refresh
            </button>
            <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
              <button onClick={() => setView("grid")} className={`p-2 rounded-lg transition-colors ${view === "grid" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-white"}`}><Grid2X2 size={16}/></button>
              <button onClick={() => setView("list")} className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-cyan-500/20 text-cyan-400" : "text-slate-500 hover:text-white"}`}><List size={16}/></button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="rounded-2xl overflow-hidden border border-white/8 animate-pulse" style={{ background: "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)", height: 280 }}>
                <div className="h-44 bg-white/5"/>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-white/5 rounded w-3/4"/>
                  <div className="h-1.5 bg-white/5 rounded-full"/>
                </div>
              </div>
            ))}
          </div>
        ) : filteredCameras.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            No cameras found. Add cameras to see live feeds.
          </div>
        ) : (
          <div className={`grid ${view === "grid" ? "grid-cols-3" : "grid-cols-1"} gap-4`}>
            {filteredCameras.map((feed, i) => {
              const density = feed.density_percentage || 0;
              const isLive = feed.status === "active";
              return (
                <div key={feed._id || i} className="rounded-2xl overflow-hidden border border-white/8 group hover:border-cyan-500/30 transition-all duration-300"
                  style={{ background: "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)" }}>
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <video
                      autoPlay
                      loop
                      playInline
                      muted
                      src={feed.stream_url || `https://picsum.photos/seed/crowded${i + 1}/400/220`}
                      alt={feed.name || `Camera ${i + 1}`}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-300"
                      onError={(e) => { e.target.src = `https://picsum.photos/seed/crowded${i + 1}/400/220`; }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"/>
                    <div className="absolute top-2 left-2">
                      {isLive
                        ? <div className="flex items-center gap-1 bg-red-500/90 backdrop-blur-sm px-2 py-0.5 rounded-full"><span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"/><span className="text-white text-[10px] font-bold">LIVE</span></div>
                        : <div className="flex items-center gap-1 bg-slate-700/90 backdrop-blur-sm px-2 py-0.5 rounded-full"><span className="text-slate-400 text-[10px] font-bold">OFFLINE</span></div>
                      }
                    </div>
                    <div className="absolute bottom-2 right-2">
                      <div className={`text-2xl font-black ${density >= 80 ? "text-red-400" : density >= 60 ? "text-orange-400" : density >= 30 ? "text-yellow-400" : "text-green-400"}`}
                        style={{ textShadow: "0 0 20px currentColor" }}>{Math.round(density)}%</div>
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white text-sm font-semibold">{feed.name || feed.location || `Camera ${i + 1}`}</span>
                      <DensityBadge value={density}/>
                    </div>
                    <DensityBar value={density}/>
                    {feed.location && (
                      <div className="text-slate-600 text-[10px] mt-2">{feed.location}</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}