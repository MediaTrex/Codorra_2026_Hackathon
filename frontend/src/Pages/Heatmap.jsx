import { useState, useEffect } from "react";
import { TopBar, PageWrapper, SectionCard } from "../components/UI";
import { api } from "../Services/api";

const PERIOD_MAP = {
  Today: 1,
  Yesterday: 24,
  "Last 7 Days": 168,
};

export default function Heatmap() {
  const [date, setDate] = useState("Today");
  const [loading, setLoading] = useState(true);
  const [heatmapData, setHeatmapData] = useState([]);
  const [cameras, setCameras] = useState([]);

  // const fetchHeatmapData = async () => {
  //   setLoading(true);
  //   try {
  //     const periodHours = PERIOD_MAP[date] || 1;

  //     const [heatmapRes, camerasRes] = await Promise.allSettled([
  //       api.getHeatmapData({ period_hours: periodHours }),
  //       api.listCameras({ limit: 20 })
  //     ]);

  //     if (heatmapRes.status === "fulfilled" && heatmapRes.value?.data?.data) {
  //       setHeatmapData(heatmapRes.value.data.data);
  //     }

  //     if (camerasRes.status === "fulfilled" && camerasRes.value?.data?.cameras) {
  //       setCameras(camerasRes.value.data.cameras);
  //     }
  //   } catch (err) {
  //     console.error("Heatmap fetch error:", err);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  const fetchHeatmapData = async () => {
    setLoading(true);

    try {
      const periodHours = 56; // PERIOD_MAP[date] || 1;

      const [heatmapRes, camerasRes] = await Promise.all([
        api.getHeatmapData({
          period_hours: periodHours,
        }),
        api.listCameras({
          limit: 20,
        }),
      ]);

      const points = heatmapRes?.data?.data?.points || [];

      const cameras = camerasRes?.data?.cameras || [];

      setHeatmapData(points);

      const mergedCameras = cameras.map((camera) => {
        const point = points.find(
          (p) => String(p.camera_id) === String(camera._id),
        );

        return {
          ...camera,
          density_percentage: point?.density_percentage ?? 0,
          people_count: point?.people_count ?? 0,
          intensity: point?.intensity ?? 0,
        };
      });

      setCameras(mergedCameras);

      console.table(
        mergedCameras.map((c) => ({
          name: c.name,
          density: c.density_percentage,
          people: c.people_count,
        })),
      );
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHeatmapData();
  }, [date]);

  const getColor = (density) => {
    if (density >= 85) return "#ef4444";
    if (density >= 70) return "#f97316";
    if (density >= 50) return "#f59e0b";
    return "#22c55e";
  };

  const getLabel = (density) => {
    if (density >= 85) return "Critical";
    if (density >= 70) return "High";
    if (density >= 50) return "Medium";
    return "Low";
  };

  return (
    <PageWrapper>
      <TopBar
        title="Crowd Density Heatmap"
        subtitle="Visualize crowd density across the city"
      />
      <div className="p-8 space-y-6">
        <div className="flex gap-2">
          {["Today", "Yesterday", "Last 7 Days"].map((d) => (
            <button
              key={d}
              onClick={() => setDate(d)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${date === d ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30" : "text-slate-500 hover:text-slate-200 bg-white/5 border border-white/8"}`}
            >
              {d}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {/* Main heatmap */}
          <div
            className="col-span-2 rounded-2xl overflow-hidden border border-white/8"
            style={{
              background: "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)",
              minHeight: 500,
            }}
          >
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-white font-semibold text-sm">
                Crowd Density Heatmap
              </h2>
            </div>
            <div className="relative" style={{ height: 450 }}>
              <div
                className="absolute inset-0 p-4"
                style={{
                  backgroundImage: `linear-gradient(rgba(6,182,212,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(6,182,212,0.06) 1px,transparent 1px)`,
                  backgroundSize: "40px 40px",
                  backgroundColor: "#070c1a",
                }}
              />
              <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 600 450"
                preserveAspectRatio="none"
              >
                <line
                  x1="0"
                  y1="150"
                  x2="600"
                  y2="150"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="12"
                />
                <line
                  x1="0"
                  y1="300"
                  x2="600"
                  y2="300"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="12"
                />
                <line
                  x1="150"
                  y1="0"
                  x2="150"
                  y2="450"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="12"
                />
                <line
                  x1="350"
                  y1="0"
                  x2="350"
                  y2="450"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="12"
                />
                <line
                  x1="500"
                  y1="0"
                  x2="500"
                  y2="450"
                  stroke="rgba(255,255,255,0.06)"
                  strokeWidth="8"
                />
              </svg>

              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-slate-500">
                    Loading heatmap data...
                  </span>
                </div>
              ) : heatmapData.length > 0 ? (
                heatmapData.slice(0, 8).map((point, i) => {
                  const color = getColor(point.density_percentage || 0);
                  const radius =
                    40 + ((point.density_percentage || 0) / 100) * 60;
                  return (
                    <div
                      key={point._id || i}
                      className="absolute group"
                      style={{
                        left: `${15 + (i % 4) * 22}%`,
                        top: `${15 + Math.floor(i / 4) * 35}%`,
                      }}
                    >
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
                        style={{
                          width: radius * 1.8,
                          height: radius * 1.8,
                          background: `radial-gradient(circle,${color}99 0%,transparent 70%)`,
                          filter: "blur(8px)",
                        }}
                      />
                      <div className="absolute -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
                        {point.camera_name || `Camera ${i + 1}`}:{" "}
                        {Math.round(point.density_percentage || 0)}%
                      </div>
                      <div
                        className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                        style={{ boxShadow: `0 0 8px ${color}` }}
                      />
                    </div>
                  );
                })
              ) : (
                // Fallback static locations when no API data
                <>
                  {[
                    {
                      x: 32,
                      y: 25,
                      r: 90,
                      color: "#ef4444",
                      label: "City Mall",
                    },
                    {
                      x: 62,
                      y: 45,
                      r: 75,
                      color: "#f97316",
                      label: "Metro Station",
                    },
                    {
                      x: 20,
                      y: 65,
                      r: 60,
                      color: "#22c55e",
                      label: "Park Zone",
                    },
                    {
                      x: 75,
                      y: 68,
                      r: 65,
                      color: "#f59e0b",
                      label: "Railway Station",
                    },
                    { x: 50, y: 75, r: 55, color: "#3b82f6", label: "College" },
                  ].map((blob, i) => (
                    <div
                      key={i}
                      className="absolute group"
                      style={{ left: `${blob.x}%`, top: `${blob.y}%` }}
                    >
                      <div
                        className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full animate-pulse"
                        style={{
                          width: blob.r * 1.8,
                          height: blob.r * 1.8,
                          background: `radial-gradient(circle,${blob.color}99 0%,transparent 70%)`,
                          filter: "blur(8px)",
                        }}
                      />
                      <div className="absolute -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white text-xs px-2 py-1 rounded-lg whitespace-nowrap z-10">
                        {blob.label}
                      </div>
                      <div
                        className="absolute w-2 h-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white"
                        style={{ boxShadow: `0 0 8px ${blob.color}` }}
                      />
                    </div>
                  ))}
                </>
              )}
            </div>
          </div>

          {/* Side panels */}
          <div className="space-y-4">
            <SectionCard title="Density Scale">
              <div className="space-y-3">
                <div
                  className="h-4 rounded-full w-full"
                  style={{
                    background:
                      "linear-gradient(to right,#22c55e,#f59e0b,#f97316,#ef4444)",
                  }}
                />
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Low</span>
                  <span>Moderate</span>
                  <span>High</span>
                  <span>Critical</span>
                </div>
              </div>
            </SectionCard>
            <SectionCard title="Location Summary">
              {loading ? (
                <div className="text-center text-slate-500 py-4">
                  Loading...
                </div>
              ) : cameras.length > 0 ? (
                <div className="space-y-3">
                  {cameras.slice(0, 8).map((loc, i) => {
                    const density = loc.density_percentage ?? 0;
                    const color = getColor(density);
                    return (
                      <div
                        key={loc._id || i}
                        className="flex items-center gap-3"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                          style={{
                            backgroundColor: color,
                            boxShadow: `0 0 8px ${color}`,
                          }}
                        />

                        <div className="flex-1 min-w-0">
                          <div className="dark:text-slate-300 text-black text-xs truncate">
                            {loc.name}
                          </div>

                          <div className="text-slate-500 text-[10px]">
                            👥 {loc.people_count || 0} people
                          </div>
                        </div>

                        <span className="text-xs font-bold" style={{ color }}>
                          {density.toFixed(0)}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-slate-500 py-4">
                  No camera data available
                </div>
              )}
            </SectionCard>
          </div>
        </div>
      </div>
    </PageWrapper>
  );
}
