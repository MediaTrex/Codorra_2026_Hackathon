import { useEffect, useMemo, useState } from "react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Dashboard";
import LiveMonitoring from "./pages/LiveMonitoring";
import Heatmap from "./pages/Heatmap";
import Analytics from "./pages/Analytics";
import Alerts from "./pages/Alerts";
import Reports from "./pages/Reports";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { AuthProvider, useAuth } from "./context/AuthContext";

function AppInner() {
  const { user, loading, logout } = useAuth();
  const [activePage, setActivePage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    if (!user) setActivePage("dashboard");
  }, [user]);

  const pages = useMemo(
    () => ({
      dashboard: <Dashboard />,
      monitoring: <LiveMonitoring />,
      heatmap: <Heatmap />,
      analytics: <Analytics />,
      alerts: <Alerts />,
      reports: <Reports />,
      settings: <Settings />,
    }),
    []
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#05070f]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  if (!user) return <Login />;

  return (
    <div className="flex h-screen bg-[#05070f] overflow-hidden">
      <Sidebar
        activePage={activePage}
        setActivePage={setActivePage}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={() => logout()}
      />
      <main
        className={`flex-1 overflow-y-auto transition-all duration-300 ${sidebarCollapsed ? "ml-16" : "ml-64"}`}
      >
        {pages[activePage] || <Dashboard />}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppInner />
    </AuthProvider>
  );
}

