import React, { useState } from 'react';

export default function Settings() {
  const [config, setConfig] = useState({
    faceBlur: true, dataAnon: true, metaOnly: true,
    critAlert: true, highAlert: true, modAlert: false, lowAlert: false,
    darkMode: false, notify: true, refresh: "10"
  });

  const toggle = (field) => setConfig({ ...config, [field]: !config[field] });

  const ToggleSwitch = ({ active, onClick }) => (
    <button 
      onClick={onClick}
      className={`w-10 h-5 rounded-full p-0.5 transition-all duration-200 focus:outline-none ${active ? 'bg-emerald-500 flex justify-end' : 'bg-slate-200 flex justify-start'}`}
    >
      <span className="w-4 h-4 rounded-full bg-white shadow-md block"></span>
    </button>
  );

  return (
    <div className="space-y-6 max-w-3xl animate-fadeIn">
      <div>
        <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Settings</h2>
        <p className="text-slate-500 text-xs mt-1">Configure your edge application settings and privacy parameters</p>
      </div>

      {/* PRIVACY PANEL SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider border-b pb-2">Privacy Settings</h3>
        <div className="space-y-4">
          {[
            { id: 'faceBlur', title: 'Face Blurring', desc: 'Anonymize human identities automatically on feed ingest vectors.' },
            { id: 'dataAnon', title: 'Data Anonymization', desc: 'Strip out identifiable network signatures and track IDs.' },
            { id: 'metaOnly', title: 'Store Only Metadata', desc: 'Discard direct raw media formats post inference cycles.' }
          ].map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-4">
              <div>
                <h4 className="font-bold text-xs text-slate-800">{item.title}</h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{item.desc}</p>
              </div>
              <ToggleSwitch active={config[item.id]} onClick={() => toggle(item.id)} />
            </div>
          ))}
        </div>
      </div>

      {/* ALERTS THRESHOLDS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider border-b pb-2">Alert Triggers</h3>
        <div className="grid grid-cols-2 gap-4">
          {['Critical Alerts', 'High Alerts', 'Moderate Alerts', 'Low Alerts'].map((label, index) => {
            const key = ['critAlert', 'highAlert', 'modAlert', 'lowAlert'][index];
            return (
              <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-xs font-semibold text-slate-700">{label}</span>
                <ToggleSwitch active={config[key]} onClick={() => toggle(key)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* CONTROL PARAMETERS SECTION */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-sm text-slate-400 uppercase tracking-wider border-b pb-2">General Engine Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Dark Mode</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Toggle interface design skin elements.</p>
            </div>
            <ToggleSwitch active={config.darkMode} onClick={() => toggle('darkMode')} />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Push Notifications</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Broadcast threshold messages immediately.</p>
            </div>
            <ToggleSwitch active={config.notify} onClick={() => toggle('notify')} />
          </div>
          <div className="flex items-center justify-between gap-4 pt-2">
            <div>
              <h4 className="font-bold text-xs text-slate-800">Auto Refresh (seconds)</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Telemetry matrix loop execution clock interval.</p>
            </div>
            <input 
              type="number" 
              value={config.refresh} 
              onChange={(e) => setConfig({...config, refresh: e.target.value})}
              className="bg-slate-50 border w-24 text-center border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold focus:outline-none focus:border-blue-500" 
            />
          </div>
        </div>
      </div>
    </div>
  );
}