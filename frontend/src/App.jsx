import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import Heatmap from "./pages/Heatmap";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isLoggedIn) {
    return <Login onLogin={() => setIsLoggedIn(true)} />;
  }

  // Map state keys directly to your component modular architecture pages
  const pages = {
    dashboard: <Dashboard />,
    monitoring: <LiveMonitoring />,
    heatmap: <Heatmap />,
    analytics: <Analytics />,
    alerts: <Alerts />,
    reports: <Reports />,
    settings: <Settings />,
  };

  return (
    <div className="flex h-screen bg-[#05070f] overflow-hidden text-slate-100 font-sans">
      <Sidebar 
        activePage={activePage} 
        setActivePage={setActivePage} 
        collapsed={sidebarCollapsed} 
        setCollapsed={setSidebarCollapsed}
        onLogout={() => setIsLoggedIn(false)}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 p-8`}>
        {pages[activePage] || <Dashboard />}
      </main>
    </div>
  );
}