import { Users, Camera, AlertTriangle, TrendingUp, MapPin } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

const stats = [
  { label: "Total Locations", value: "24", change: "+2% from yesterday", icon: Users, color: "blue" },
  { label: "Live Feeds", value: "18", change: "All Online", icon: Camera, color: "green" },
  { label: "High Density Alerts", value: "7", change: "Active Now", icon: AlertTriangle, color: "orange" },
  { label: "Avg Density", value: "63%", change: "+8% from yesterday", icon: TrendingUp, color: "purple" },
];

const densityData = [
  { name: 'Low (0-30%)', value: 26, color: '#22c55e' },
  { name: 'Moderate (30-60%)', value: 34, color: '#eab308' },
  { name: 'High (60-80%)', value: 28, color: '#f97316' },
  { name: 'Critical (80-100%)', value: 12, color: '#ef4444' },
];

const trendData = [
  { time: '10:00', density: 45 }, { time: '11:00', density: 52 },
  { time: '12:00', density: 68 }, { time: '13:00', density: 75 },
  { time: '14:00', density: 82 }, { time: '15:00', density: 71 },
];

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">Real-time overview of crowd density across all locations</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-gray-500 text-sm">{stat.label}</p>
                <p className="text-4xl font-bold mt-3 text-gray-900">{stat.value}</p>
              </div>
              <stat.icon className={`w-10 h-10 text-${stat.color}-500`} />
            </div>
            <p className="text-sm text-green-600 mt-4 font-medium">{stat.change}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
        {/* Live Overview Map */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-semibold text-lg">Live Overview</h3>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <MapPin className="w-4 h-4" /> 24 Locations
            </div>
          </div>
          <div className="h-96 bg-gray-100 rounded-xl flex items-center justify-center border border-dashed border-gray-300 relative overflow-hidden">
            <div className="text-center">
              <p className="text-gray-400 mb-2">🗺️ Interactive City Map</p>
              <p className="text-xs text-gray-500">Replace this with Leaflet / Google Maps component</p>
            </div>
            {/* Sample markers */}
            <div className="absolute top-12 left-12 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
            <div className="absolute top-1/3 right-1/4 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center animate-pulse">
              <div className="w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        </div>

        {/* Density Distribution */}
        <div className="lg:col-span-3 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold text-lg mb-6">Density Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <PieChart>
              <Pie
                data={densityData}
                cx="50%"
                cy="50%"
                innerRadius={85}
                outerRadius={130}
                dataKey="value"
              >
                {densityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-3 mt-4 text-sm">
            {densityData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                <span>{item.name}</span>
                <span className="ml-auto font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Alerts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-semibold text-lg">Recent Alerts</h3>
          <button className="text-blue-600 text-sm font-medium hover:underline">View All Alerts →</button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { location: "City Mall Area", density: "85%", time: "2 mins ago", level: "Critical", color: "red" },
            { location: "Metro Station Gate", density: "74%", time: "5 mins ago", level: "High", color: "orange" },
            { location: "Bus Stand Platform", density: "58%", time: "8 mins ago", level: "Moderate", color: "yellow" },
          ].map((alert, i) => (
            <div key={i} className="border border-gray-100 rounded-xl p-5 hover:border-gray-200 transition-all">
              <div className={`inline-block px-3 py-1 text-xs font-medium rounded-full bg-${alert.color}-100 text-${alert.color}-700`}>
                {alert.level}
              </div>
              <p className="font-semibold mt-4">{alert.location}</p>
              <p className="text-3xl font-bold text-gray-900 mt-1">{alert.density}</p>
              <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}