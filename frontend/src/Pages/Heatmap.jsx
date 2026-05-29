import { useState } from 'react';

export default function Heatmap() {
  const [selectedDate] = useState("Today");

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Crowd Density Heatmap</h1>
          <p className="text-gray-500">Visualize crowd density across the city</p>
        </div>
        <select className="bg-white border border-gray-300 rounded-xl px-5 py-2.5">
          <option>Today</option>
          <option>Yesterday</option>
          <option>Last 7 Days</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="flex justify-between mb-6">
          <h3 className="font-semibold text-lg">City-Wide Density Heatmap</h3>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-green-400 rounded"></div>
              <span>Low</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-yellow-400 rounded"></div>
              <span>Moderate</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-orange-500 rounded"></div>
              <span>High</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-2 bg-red-500 rounded"></div>
              <span>Critical</span>
            </div>
          </div>
        </div>

        {/* Heatmap Placeholder */}
        <div className="h-[560px] bg-gray-100 rounded-2xl relative overflow-hidden flex items-center justify-center border border-dashed">
          <div className="text-center">
            <p className="text-2xl mb-4">🌍 City Heatmap Visualization</p>
            <p className="text-gray-500 max-w-md">
              This area will contain your actual heatmap (using Leaflet + Heatmap Layer or Canvas)
            </p>
          </div>

          {/* Sample Heat Overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 via-yellow-400/40 to-red-500/60 opacity-70"></div>
          
          {/* Sample Location Labels */}
          <div className="absolute top-20 left-1/4 bg-white/90 px-4 py-2 rounded-xl shadow text-sm font-medium">City Mall - 85%</div>
          <div className="absolute top-1/3 right-1/3 bg-white/90 px-4 py-2 rounded-xl shadow text-sm font-medium">Metro Station - 74%</div>
          <div className="absolute bottom-1/3 left-1/2 bg-white/90 px-4 py-2 rounded-xl shadow text-sm font-medium">Railway Station - 67%</div>
        </div>
      </div>
    </div>
  );
}