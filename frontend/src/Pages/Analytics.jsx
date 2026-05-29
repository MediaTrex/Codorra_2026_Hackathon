import { TrendingUp, Users } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const trendData = [
  { day: '12 May', density: 42 }, { day: '13 May', density: 48 },
  { day: '14 May', density: 55 }, { day: '15 May', density: 61 },
  { day: '16 May', density: 58 }, { day: '17 May', density: 72 },
  { day: '18 May', density: 68 },
];

const categoryData = [
  { name: 'Low', value: 28, color: '#22c55e' },
  { name: 'Moderate', value: 34, color: '#eab308' },
  { name: 'High', value: 26, color: '#f97316' },
  { name: 'Critical', value: 12, color: '#ef4444' },
];

export default function Analytics() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold text-gray-900">Analytics</h1>
        <p className="text-gray-500">Detailed insights and trends</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500">Total People Count</p>
          <p className="text-5xl font-bold mt-3">125,430</p>
          <p className="text-green-600 text-sm mt-2">+5.2% from last week</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500">Average Density</p>
          <p className="text-5xl font-bold mt-3">63%</p>
          <p className="text-green-600 text-sm mt-2">+7% from yesterday</p>
        </div>
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <p className="text-gray-500">Peak Hour Alerts</p>
          <p className="text-5xl font-bold mt-3">36</p>
          <p className="text-orange-600 text-sm mt-2">-12% from last week</p>
        </div>
      </div>

      {/* Trend Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <h3 className="font-semibold text-lg mb-6">Density Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={trendData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Line type="natural" dataKey="density" stroke="#3b82f6" strokeWidth={4} dot={{ fill: '#1e40af', r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Top Locations + Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-6">Top Locations by Density</h3>
          <div className="space-y-5">
            {[
              { place: "City Mall", percent: "85%", color: "red" },
              { place: "Metro Station", percent: "74%", color: "orange" },
              { place: "Railway Station", percent: "67%", color: "yellow" },
              { place: "Bus Stand", percent: "58%", color: "green" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="font-medium">{item.place}</span>
                <div className="flex items-center gap-3">
                  <div className="h-2.5 w-40 bg-gray-100 rounded">
                    <div className={`h-2.5 rounded bg-${item.color}-500`} style={{ width: item.percent }}></div>
                  </div>
                  <span className="font-bold w-12 text-right">{item.percent}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-semibold mb-6">Density by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" outerRadius={110} dataKey="value">
                {categoryData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}