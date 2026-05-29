import React, { useState } from 'react';
import Layout from './components/Layout';
import Dashboard from './Pages/Dashboard';
import Livemonitoring from './Pages/Livemonitoring';
import Heatmap from './Pages/Heatmap';
import Analytics from './Pages/Analytics';

// Fallback module wrappers for ancillary settings screens
const ConfigurationPlaceholder = ({ label }) => (
  <div className="p-8 bg-white border border-slate-100 rounded-2xl shadow-sm max-w-xl">
    <h3 className="text-base font-bold text-slate-800">{label} Portal</h3>
    <p className="text-xs text-slate-400 mt-1">Component placeholder matching project layout modules.</p>
    <div className="mt-6 p-4 bg-slate-50 border border-dashed rounded-xl text-[11px] font-mono text-slate-500">
      SYSTEM_STATE: "READY_FOR_INTEGRATION"
    </div>
  </div>
);

export default function App() {
  const [currentPageId, setCurrentPageId] = useState('dashboard');

  const executeViewRouting = () => {
    switch (currentPageId) {
      case 'dashboard':
        return <Dashboard />;
      case 'live-monitoring':
        return <Livemonitoring />;
      case 'heatmap':
        return <Heatmap />;
      case 'analytics':
        return <Analytics />;
      case 'alerts':
        return <ConfigurationPlaceholder label="System Emergency Alerts Log" />;
      case 'reports':
        return <ConfigurationPlaceholder label="Analytical PDF Summary Reports" />;
      case 'settings':
        return <ConfigurationPlaceholder label="Global Core Privacy Configuration Settings" />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout activePage={currentPageId} setActivePage={setCurrentPageId}>
      {executeViewRouting()}
    </Layout>
  );
}