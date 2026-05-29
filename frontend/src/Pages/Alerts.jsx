import React, { useState } from 'react';

export default function Alerts() {
  const [activeTab, setActiveTab] = useState('all');
  
  const alertData = [
    { id: 1, location: "City Mall Entrance", status: "Critical Density Alert", level: "85%", time: "2 mins ago", type: "critical" },
    { id: 2, location: "Metro Station Gate", status: "High Density Alert", level: "74%", time: "5 mins ago", type: "high" },
    { id: 3, location: "Railway Station", status: "High Density Alert", level: "67%", time: "8 mins ago", type: "high" },
    { id: 4, location: "Bus Stand Platform", status: "Moderate Density Alert", level: "58%", time: "12 mins ago", type: "moderate" },
    { id: 5, location: "College Campus", status: "Moderate Density Alert", level: "46%", time: "15 mins ago", type: "moderate" },
    { id: 6, location: "Park Entrance", status: "Low Density Notification", level: "32%", time: "25 mins ago", type: "low" },
  ];

  const filteredAlerts = alertData.filter(alert => activeTab === 'all' || alert.type === activeTab);

  const getStyle = (type) => {
    switch(type) {
      case 'critical': return { bg: 'bg-red-50 text-red-700 border-red-100', badge: 'bg-red-500 text-white' };
      case 'high': return { bg: 'bg-orange-50 text-orange-700 border-orange-100', badge: 'bg-orange-500 text-white' };
      case 'moderate': return { bg: 'bg-amber-50 text-amber-700 border-amber-100', badge: 'bg-amber-500 text-white' };
      default: return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-100', badge: 'bg-emerald-500 text-white' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Alerts</h2>
        <p className="text-slate-500 text-xs mt-1">Real-time safety alerts and structural density warnings</p>
      </div>

      {/* FILTER TABS */}
      <div className="flex border-b border-slate-200 gap-2 overflow-x-auto">
        {['all', 'critical', 'high', 'moderate', 'low'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2.5 font-semibold text-xs uppercase tracking-wider border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab 
                ? 'border-blue-600 text-blue-600 font-bold' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab === 'all' ? 'All Alerts' : `${tab} logs`}
          </button>
        ))}
      </div>

      {/* ALERTS LOG STREAM */}
      <div className="space-y-3">
        {filteredAlerts.map((alert) => {
          const styles = getStyle(alert.type);
          return (
            <div key={alert.id} className={`p-4 bg-white border rounded-xl flex items-center justify-between shadow-sm transition-all hover:translate-x-1 ${styles.bg}`}>
              <div className="flex items-center gap-4">
                <div className={`w-2.5 h-2.5 rounded-full ${styles.badge} animate-pulse`}></div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{alert.location}</h4>
                  <p className="text-xs text-slate-500 mt-0.5">{alert.status}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <span className="text-xs font-semibold text-slate-400 font-mono">{alert.time}</span>
                <span className={`text-xs font-black px-3 py-1 rounded-lg ${styles.badge}`}>{alert.level}</span>
                <button className="text-slate-400 hover:text-slate-600 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}