import { useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./Pages/Dashboard";
import LiveMonitoring from "./Pages/LiveMonitoring";
import Heatmap from "./Pages/Heatmap";
import Analytics from "./Pages/Analytics";
import Alerts from "./Pages/Alerts";
import Reports from "./pages/Reports";
import Settings from "./Pages/Settings";
import Login from "./Pages/Login";

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!isLoggedIn) return <Login onLogin={() => setIsLoggedIn(true)} />;

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
    <div className="flex h-screen bg-[#05070f] overflow-hidden">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={() => setIsLoggedIn(false)}
      />
      <main className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}>
        {pages[activePage] || <Dashboard />}
      </main>
    </div>
  );
}