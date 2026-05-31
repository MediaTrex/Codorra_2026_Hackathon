import { useState, useEffect } from "react";
import {
  TopBar,
  DensityBadge,
  DensityBar,
  PageWrapper,
} from "../components/UI";
import { Grid2X2, List, RefreshCw, Users } from "lucide-react";
import { api } from "../Services/api";

export default function LiveMonitoring() {
  const [loading, setLoading] = useState(true);
  const [cameras, setCameras] = useState([]);
  const [location, setLocation] = useState("All Locations");
  const [view, setView] = useState("grid");


  const fetchCameras = async () => {
    setLoading(true);

    try {
      const [camerasRes, heatmapRes] = await Promise.all([
        api.listCameras({ limit: 20 }),
        api.getHeatmapData({ period_hours: 56 }), // 56 hours
      ]);

      const cameras = camerasRes?.data?.cameras || [];
      const points = heatmapRes?.data?.data?.points || [];

      const mergedCameras = cameras.map((camera) => {
        const point = points.find(
          (p) => p.camera_id === camera._id
        );

        return {
          ...camera,
          density_percentage:
            point?.density_percentage ?? 0,
          people_count:
            point?.people_count ?? 0,
          intensity:
            point?.intensity ?? 0,
          timestamp:
            point?.timestamp ?? null,
        };
      });

      console.table(
        mergedCameras.map((c) => ({
          name: c.name,
          density: c.density_percentage,
          people: c.people_count,
          capacity: c.capacity,
        }))
      );

      setCameras(mergedCameras);
    } catch (err) {
      console.error("Failed to fetch cameras:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCameras();
  }, []);

  const filteredCameras =
    location === "All Locations"
      ? cameras
      : cameras.filter((c) => c.name === location);

  const getDensityColor = (density) => {
    if (density >= 85) return "text-red-400";
    if (density >= 70) return "text-orange-400";
    if (density >= 50) return "text-yellow-400";
    return "text-green-400";
  };

  return (
    <PageWrapper>
      <TopBar
        title="Live Monitoring"
        subtitle="Real-time camera feeds with privacy protection"
      />

      <div className="p-8 space-y-6">

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <select
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
              className="bg-white/5 border dark:border-white/10 border-black dark:text-slate-300 text-black text-sm rounded-xl px-4 py-2 focus:outline-none focus:border-cyan-500/40"
            >
              <option>All Locations</option>

              {cameras.map((c, i) => (
                <option
                  key={c._id || i}
                  value={c.name}
                >
                  {c.name}
                </option>
              ))}
            </select>

            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-green-500/15 border border-green-500/20">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-green-400 text-xs font-semibold">
                Live
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchCameras}
              className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border dark:border-white/8 border-black dark:text-slate-300 text-black text-sm"
            >
              <RefreshCw
                size={14}
                className={
                  loading ? "animate-spin" : ""
                }
              />
              Refresh
            </button>

            <div className="flex gap-1 bg-white/5 rounded-xl p-1 border dark:border-white/8 border-black">
              <button
                onClick={() => setView("grid")}
                className={`p-2 rounded-lg ${
                  view === "grid"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-500"
                }`}
              >
                <Grid2X2 size={16} />
              </button>

              <button
                onClick={() => setView("list")}
                className={`p-2 rounded-lg ${
                  view === "list"
                    ? "bg-cyan-500/20 text-cyan-400"
                    : "text-slate-500"
                }`}
              >
                <List size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="rounded-2xl overflow-hidden border border-white/8 animate-pulse"
                style={{
                  background:
                    "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)",
                  height: 320,
                }}
              >
                <div className="h-44 bg-white/5" />
              </div>
            ))}
          </div>
        ) : filteredCameras.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            No cameras found.
          </div>
        ) : (
          <div
            className={`grid ${
              view === "grid"
                ? "grid-cols-3"
                : "grid-cols-1"
            } gap-4`}
          >
            {filteredCameras.map((feed, i) => {
              const density =
                feed.density_percentage || 0;

              const occupancy =
                feed.capacity > 0
                  ? (
                      (feed.people_count /
                        feed.capacity) *
                      100
                    ).toFixed(1)
                  : "0";

              const isLive =
                feed.status === "active";

              return (
                <div
                  key={feed._id || i}
                  className="rounded-2xl overflow-hidden border border-white/8 group hover:border-cyan-500/30 transition-all duration-300"
                  style={{
                    background:
                      "linear-gradient(135deg,#0d1225 0%,#080c1a 100%)",
                  }}
                >
                  {/* Video */}
                  <div className="relative h-44 overflow-hidden bg-slate-900">
                    <video
                      autoPlay
                      muted
                      loop
                      playsInline
                      src={feed.stream_url}
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />

                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                    <div className="absolute top-2 left-2">
                      {isLive ? (
                        <div className="flex items-center gap-1 bg-red-500 px-2 py-1 rounded-full">
                          <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                          <span className="text-[10px] text-white font-bold">
                            LIVE
                          </span>
                        </div>
                      ) : (
                        <div className="bg-slate-700 px-2 py-1 rounded-full text-[10px] text-slate-300">
                          OFFLINE
                        </div>
                      )}
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <div
                        className={`text-3xl font-black ${getDensityColor(
                          density
                        )}`}
                        style={{
                          textShadow:
                            "0 0 15px currentColor",
                        }}
                      >
                        {density.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-white text-sm font-semibold">
                        {feed.name}
                      </span>

                      <DensityBadge
                        value={density}
                      />
                    </div>

                    <DensityBar
                      value={Math.min(
                        density,
                        100
                      )}
                    />

                    <div className="mt-4 space-y-2 text-xs">

                      <div className="flex justify-between">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Users size={12} />
                          People
                        </span>

                        <span className="text-cyan-400 font-semibold">
                          {(
                            feed.people_count || 0
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Capacity
                        </span>

                        <span className="text-white">
                          {(
                            feed.capacity || 0
                          ).toLocaleString()}
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Occupancy
                        </span>

                        <span className="text-cyan-400">
                          {occupancy}%
                        </span>
                      </div>

                      <div className="flex justify-between">
                        <span className="text-slate-400">
                          Status
                        </span>

                        <span
                          className={
                            isLive
                              ? "text-green-400"
                              : "text-red-400"
                          }
                        >
                          {feed.status}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-white/5 text-[11px] text-slate-500">
                      {feed.location}
                    </div>
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