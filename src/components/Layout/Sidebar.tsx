import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Home,
  Upload,
  BarChart3,
  FileText,
  CheckSquare,
  Users,
  Settings,
} from "lucide-react";

const Sidebar: React.FC = () => {
  const location = useLocation();

  const menuItems = [
    { icon: Home, label: "Dashboard", path: "/dashboard" },
    { icon: Upload, label: "Upload Meeting", path: "/upload" },
    { icon: FileText, label: "Meetings", path: "/meetings" },
    { icon: CheckSquare, label: "Action Items", path: "/action-items" },
    { icon: BarChart3, label: "Analytics", path: "/analytics" },
    { icon: Users, label: "Team", path: "/team" },
    { icon: Settings, label: "Settings", path: "/settings" },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-[calc(100vh-4rem)] overflow-y-auto">
      <nav className="p-4">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
};

export default React.memo(Sidebar);
