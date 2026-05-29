export default function Alerts() {
  const alerts = [
    { location: "City Mall Entrance", level: "Critical", density: "85%", time: "2 mins ago", type: "High Density Alert" },
    { location: "Metro Station Gate", level: "High", density: "74%", time: "5 mins ago", type: "High Density Alert" },
    { location: "Railway Station", level: "High", density: "67%", time: "8 mins ago", type: "Crowd Buildup" },
    { location: "Bus Stand Platform", level: "Moderate", density: "58%", time: "12 mins ago", type: "Moderate Density" },
    { location: "College Campus", level: "Moderate", density: "46%", time: "18 mins ago", type: "Normal Activity" },
  ];

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-4xl font-bold text-gray-900">Alerts</h1>
        <div className="flex gap-3">
          <button className="px-5 py-2 bg-white border rounded-xl text-sm font-medium">All Alerts</button>
          <button className="px-5 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium">Critical Only</button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {alerts.map((alert, i) => (
          <div key={i} className="border-b last:border-none p-6 hover:bg-gray-50 transition-all flex items-center gap-6">
            <div className={`w-3 h-3 rounded-full ${alert.level === 'Critical' ? 'bg-red-500 animate-pulse' : alert.level === 'High' ? 'bg-orange-500' : 'bg-yellow-500'}`} />
            
            <div className="flex-1">
              <div className="flex justify-between">
                <h4 className="font-semibold">{alert.location}</h4>
                <span className="text-sm text-gray-500">{alert.time}</span>
              </div>
              <p className="text-gray-600">{alert.type}</p>
            </div>

            <div className="text-right">
              <p className="text-3xl font-bold">{alert.density}</p>
              <span className={`text-xs font-medium px-4 py-1 rounded-full ${alert.level === 'Critical' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                {alert.level}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}