import { Home, Video, Map, BarChart3, Bell, FileText, Settings, LogOut, ShieldCheck, User } from 'lucide-react';
import { NavLink } from 'react-router-dom';

const navItems = [
  { to: "/", icon: Home, label: "Dashboard" },
  { to: "/live", icon: Video, label: "Live Monitoring" },
  { to: "/heatmap", icon: Map, label: "Heatmap" },
  { to: "/analytics", icon: BarChart3, label: "Analytics" },
  { to: "/alerts", icon: Bell, label: "Alerts" },
  { to: "/reports", icon: FileText, label: "Reports" },
  { to: "/settings", icon: Settings, label: "Settings" },
];

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed">
      <div className="p-6 flex items-center gap-3 border-b">
        <div className="w-10 h-10 bg-blue-600 rounded-2xl flex items-center justify-center">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-2xl text-gray-900">CrowdGuard</h1>
          <p className="text-xs text-gray-500 -mt-1">Crowd Density Estimator</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                ? 'bg-blue-50 text-blue-600'
                : 'text-gray-700 hover:bg-gray-100'
              }`
            }
          >
            <Icon className="w-5 h-5" />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t mt-auto">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <p className="font-medium text-sm">Admin</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
        </div>
        <button className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-xl text-sm font-medium">
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}