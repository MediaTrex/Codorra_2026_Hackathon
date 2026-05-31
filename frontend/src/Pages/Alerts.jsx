import { useState, useEffect } from "react";
import { TopBar, DensityBar, PageWrapper } from "../components/UI";
import { api } from "../Services/api";
import { Eye, RefreshCw, CheckCircle, AlertCircle } from "lucide-react";

const FILTERS = ["All Alerts", "critical", "high", "medium", "low"];

const levelColors = {
  critical: { bg: "bg-red-500/10",    border: "border-red-500/20",    text: "text-red-400",    badge: "bg-red-500/20 text-red-400",    dot: "bg-red-500"    },
  high:     { bg: "bg-orange-500/10", border: "border-orange-500/20", text: "text-orange-400", badge: "bg-orange-500/20 text-orange-400", dot: "bg-orange-500" },
  medium:   { bg: "bg-yellow-500/10", border: "border-yellow-500/20", text: "text-yellow-400", badge: "bg-yellow-500/20 text-yellow-400", dot: "bg-yellow-500" },
  low:      { bg: "bg-green-500/10",  border: "border-green-500/20",  text: "text-green-400",  badge: "bg-green-500/20 text-green-400",  dot: "bg-green-500"  },
  info:     { bg: "bg-blue-500/10",   border: "border-blue-500/20",   text: "text-blue-400",   badge: "bg-blue-500/20 text-blue-400",   dot: "bg-blue-500"   },
};

export default function Alerts() {
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0
  });
  const [filter, setFilter] = useState("All Alerts");
  const [selectedAlert, setSelectedAlert] = useState(null);

  const fetchAlerts = async () => {
    setLoading(true);
    try {
      const [alertsRes, statsRes] = await Promise.allSettled([
        api.getAlerts({ limit: 100, status: filter === "All Alerts" ? undefined : "active" }),
        api.getAlertStats(24)
      ]);

      // Alerts data
      if (alertsRes.status === "fulfilled" && alertsRes.value?.data?.alerts) {
        let fetchedAlerts = alertsRes.value.data.alerts;
        if (filter !== "All Alerts") {
          fetchedAlerts = fetchedAlerts.filter(a => a.severity === filter.toLowerCase());
        }
        setAlerts(fetchedAlerts);
      }

      // Stats data
      if (statsRes.status === "fulfilled" && statsRes.value?.data) {
        const data = statsRes.value.data;
        setStats({
          total: data.total_alerts || 0,
          critical: data.critical_alerts || 0,
          high: data.high_alerts || 0,
          medium: data.medium_alerts || 0,
          low: data.low_alerts || 0
        });
      }
    } catch (err) {
      console.error("Alerts fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filter]);

  const handleResolve = async (alertId) => {
    try {
      await api.resolveAlert(alertId, "Resolved from dashboard");
      fetchAlerts();
    } catch (err) {
      console.error("Resolve alert error:", err);
    }
  };

  const handleAcknowledge = async (alertId) => {
    try {
      await api.acknowledgeAlert(alertId, "Acknowledged");
      fetchAlerts();
    } catch (err) {
      console.error("Acknowledge alert error:", err);
    }
  };

  const formatTime = (dateStr) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <PageWrapper>
      <TopBar title="Alerts" subtitle="Real-time alerts and notifications"/>
      <div className="p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex gap-1 bg-white/5 rounded-xl p-1 border border-white/8">
            {FILTERS.map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${filter === f ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-500 hover:text-slate-200"}`}>
                {f}
              </button>
            ))}
          </div>
          <button
            onClick={fetchAlerts}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/8 text-slate-400 hover:text-white text-sm transition-colors"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""}/>Refresh
          </button>
        </div>

        <div className="flex gap-4">
          {[
            { label: "Total",    count: stats.total,                              color: "text-white"        },
            { label: "Critical", count: stats.critical,                          color: "text-red-400"       },
            { label: "High",     count: stats.high,                              color: "text-orange-400"   },
            { label: "Moderate", count: stats.medium,                             color: "text-yellow-400"    },
            { label: "Low",      count: stats.low,                               color: "text-green-400"     },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/8 px-4 py-3 text-center" style={{ background: "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)" }}>
              <div className={`text-xl font-bold ${s.color}`}>{s.count}</div>
              <div className="text-slate-600 text-xs mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl border border-white/8 overflow-hidden" style={{ background: "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)" }}>
          <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-white font-semibold text-sm">Alerts Feed</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse"/>
              <span className="text-red-400 text-xs font-semibold">Live</span>
            </div>
          </div>
          <div className="divide-y divide-white/5">
            {loading ? (
              <div className="px-5 py-12 text-center text-slate-500">Loading alerts...</div>
            ) : alerts.length === 0 ? (
              <div className="px-5 py-12 text-center text-slate-500">No alerts found</div>
            ) : (
              alerts.map(alert => {
                const severity = alert.severity || "low";
                const c = levelColors[severity] || levelColors.low;
                return (
                  <div key={alert._id} className={`flex items-center gap-4 px-5 py-4 hover:bg-white/3 transition-colors group ${c.bg}`}>
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${c.dot}`}/>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1.5">
                        <span className="text-white text-sm font-semibold">{alert.camera_name || "Unknown Camera"}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.badge}`}>{alert.type || severity}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${alert.status === "active" ? "bg-red-500/20 text-red-400" : "bg-green-500/20 text-green-400"}`}>{alert.status || "active"}</span>
                      </div>
                      <div className="max-w-xs"><DensityBar value={alert.density_percentage || 0}/></div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <span className={`text-2xl font-black ${c.text}`}>{alert.density_percentage || 0}%</span>
                      <span className="text-slate-600 text-xs">{formatTime(alert.created_at)}</span>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        {alert.status === "active" && (
                          <>
                            <button
                              onClick={() => handleAcknowledge(alert._id)}
                              className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-yellow-400 transition-all"
                              title="Acknowledge"
                            >
                              <AlertCircle size={14}/>
                            </button>
                            <button
                              onClick={() => handleResolve(alert._id)}
                              className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-green-400 transition-all"
                              title="Resolve"
                            >
                              <CheckCircle size={14}/>
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setSelectedAlert(alert)}
                          className="p-2 rounded-lg bg-white/5 text-slate-500 hover:text-white transition-all"
                          title="View Details"
                        >
                          <Eye size={14}/>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}