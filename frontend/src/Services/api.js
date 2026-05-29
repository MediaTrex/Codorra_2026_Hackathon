const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function request(path, options = {}) {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export const api = {
  getDashboardStats: () => request("/api/dashboard/stats"),
  getRecentAlerts:   () => request("/api/alerts/recent"),
  getLiveFeeds:      () => request("/api/feeds/live"),
  getHeatmapData:    (date = "today") => request(`/api/heatmap?date=${date}`),
  getAnalytics:      (range = "7d")   => request(`/api/analytics?range=${range}`),
  getAlerts:         (filter = "all") => request(`/api/alerts?filter=${filter}`),
  dismissAlert:      (id) => request(`/api/alerts/${id}/dismiss`, { method: "PUT" }),
  getReports:        (s, e, l) => request(`/api/reports?start=${s}&end=${e}&location=${l}`),
  downloadReport:    (id) => `${BASE_URL}/api/reports/${id}/download`,
  getSettings:       () => request("/api/settings"),
  updateSettings:    (data) => request("/api/settings", { method: "PUT", body: JSON.stringify(data) }),
  login:             (email, password) => request("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
  signup:            (data) => request("/api/auth/signup", { method: "POST", body: JSON.stringify(data) }),
  logout:            () => request("/api/auth/logout", { method: "POST" }),
};

export const mockData = {
  stats: { totalLocations: 24, liveFeeds: 18, highDensityAlerts: 7, avgDensity: 63 },
  locations: [
    { id: 1, name: "City Mall Entrance",  density: 85, status: "critical" },
    { id: 2, name: "Metro Station Gate",  density: 74, status: "high"     },
    { id: 3, name: "Bus Stand Platform",  density: 58, status: "moderate" },
    { id: 4, name: "Park Entrance",       density: 32, status: "low"      },
    { id: 5, name: "College Campus",      density: 46, status: "moderate" },
    { id: 6, name: "Railway Station",     density: 67, status: "high"     },
  ],
  alerts: [
    { id: 1, location: "City Mall Entrance",  type: "Critical Density Alert", density: 85, time: "2 mins ago",  level: "critical" },
    { id: 2, location: "Metro Station Gate",  type: "High Density Alert",     density: 74, time: "5 mins ago",  level: "high"     },
    { id: 3, location: "Railway Station",     type: "High Density Alert",     density: 67, time: "8 mins ago",  level: "high"     },
    { id: 4, location: "Bus Stand Platform",  type: "Moderate Density Alert", density: 58, time: "12 mins ago", level: "moderate" },
    { id: 5, location: "College Campus",      type: "Moderate Density Alert", density: 46, time: "18 mins ago", level: "moderate" },
    { id: 6, location: "Park Entrance",       type: "Low Density Alert",      density: 32, time: "25 mins ago", level: "low"      },
  ],
  densityDistribution: [
    { label: "Low (0-30%)",        value: 26, color: "#22c55e" },
    { label: "Moderate (30-60%)",  value: 34, color: "#f59e0b" },
    { label: "High (60-80%)",      value: 28, color: "#f97316" },
    { label: "Critical (80-100%)", value: 12, color: "#ef4444" },
  ],
  analyticsData: {
    totalPeople: 125430, peakDensity: 92, avgDailyDensity: 63, totalAlerts: 36,
    densityTrend: [
      { date: "12 May", value: 45 }, { date: "13 May", value: 62 },
      { date: "14 May", value: 38 }, { date: "15 May", value: 75 },
      { date: "16 May", value: 55 }, { date: "17 May", value: 88 },
      { date: "18 May", value: 70 },
    ],
  },
};