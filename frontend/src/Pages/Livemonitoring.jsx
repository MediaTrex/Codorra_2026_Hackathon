import { Camera, Play, Pause, AlertTriangle } from 'lucide-react';

const locations = [
  { name: "City Mall Entrance", density: "85%", status: "Critical", feed: "Live", color: "red" },
  { name: "Metro Station Gate", density: "74%", status: "High", feed: "Live", color: "orange" },
  { name: "Bus Stand Platform", density: "58%", status: "Moderate", feed: "Live", color: "yellow" },
  { name: "Park Entrance", density: "32%", status: "Low", feed: "Live", color: "green" },
  { name: "College Campus", density: "46%", status: "Moderate", feed: "Live", color: "yellow" },
  { name: "Railway Station", density: "67%", status: "High", feed: "Live", color: "orange" },
];

export default function Livemonitoring() {
  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold text-gray-900">Live Monitoring</h1>
          <p className="text-gray-500">Real-time camera feeds with privacy protection</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-medium">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            LIVE
          </div>
          <select className="bg-white border border-gray-300 rounded-xl px-4 py-2 text-sm">
            <option>All Locations</option>
            <option>City Mall</option>
            <option>Metro Station</option>
          </select>
        </div>
      </div>

      {/* Live Feeds Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((loc, index) => (
          <div key={index} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm card">
            {/* Video Placeholder */}
            <div className="relative h-56 bg-gray-900 flex items-center justify-center">
              <div className="text-center text-white">
                <Camera className="w-12 h-12 mx-auto mb-3 opacity-60" />
                <p className="text-sm">Live Camera Feed</p>
                <p className="text-xs text-gray-400">{loc.name}</p>
              </div>
              <div className="absolute top-4 right-4 bg-black/70 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                LIVE
              </div>
            </div>

            {/* Info */}
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{loc.name}</h3>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{loc.density}</p>
                </div>
                <span className={`px-4 py-1.5 text-sm font-medium rounded-full bg-${loc.color}-100 text-${loc.color}-700`}>
                  {loc.status}
                </span>
              </div>

              <div className="flex gap-3 mt-6">
                <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition">
                  <Play className="w-4 h-4" /> Pause Feed
                </button>
                <button className="flex-1 border border-gray-300 hover:bg-gray-50 py-3 rounded-xl text-sm font-medium">
                  View Details
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}