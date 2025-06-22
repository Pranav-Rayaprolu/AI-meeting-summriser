import React from "react";
import { Link, useLocation } from "react-router-dom";
import { LogOut, User, Bell, Settings } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/AppContext";

const Header: React.FC = () => {
  const { state: authState, logout } = useAuth();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { path: "/dashboard", label: "Dashboard" },
    { path: "/upload", label: "Upload" },
    { path: "/analytics", label: "Analytics" },
  ];

  return (
    <header className="backdrop-blur-xl bg-white/70 dark:bg-dark-card/80 shadow-xl dark:shadow-[0_2px_16px_rgba(0,0,0,0.7)] sticky top-0 z-50 border-b border-transparent">
      <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">
        <div className="flex items-center h-20 w-full justify-between">
          {/* Logo */}
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-appleblue to-applepurple rounded-2xl flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <span className="text-white font-extrabold text-lg tracking-tight">
                MS
              </span>
            </div>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-appleblue to-applepurple bg-clip-text text-transparent tracking-tight drop-shadow-sm group-hover:drop-shadow-lg transition-all">
              MeetingSummarizer
            </span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex gap-6 flex-1 justify-center">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`px-4 py-2 rounded-xl text-base font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-appleblue/30
                  ${
                    isActive(item.path)
                      ? "text-appleblue dark:text-appleblue bg-white/80 dark:bg-dark-elevated shadow-md ring-2 ring-appleblue/20 dark:ring-appleblue/30"
                      : "text-gray-700 dark:text-gray-200 hover:text-appleblue hover:bg-white/60 dark:hover:bg-dark-elevated/60 hover:shadow-sm"
                  }
                `}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* User menu */}
          <div className="flex items-center gap-6 justify-end">
            <button className="p-2 rounded-full bg-white/60 dark:bg-dark-elevated/60 shadow hover:shadow-lg text-gray-500 hover:text-appleblue transition-all focus:outline-none focus:ring-2 focus:ring-appleblue/20">
              <Bell className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4 pl-4 border-l border-light-border dark:border-dark-border">
              <div className="flex items-center gap-2">
                {authState.user?.avatar ? (
                  <img
                    src={authState.user.avatar}
                    alt={authState.user.name}
                    className="w-9 h-9 rounded-full border-2 border-appleblue/30 shadow-sm"
                  />
                ) : (
                  <User className="w-9 h-9 p-1 bg-gray-100 dark:bg-dark-elevated rounded-full text-gray-600 dark:text-gray-300 border-2 border-appleblue/20" />
                )}
                <span className="text-base font-semibold text-gray-800 dark:text-gray-100 hidden sm:block truncate max-w-[140px]">
                  {authState.user?.name}
                </span>
              </div>

              <button
                onClick={logout}
                className="p-2 rounded-full bg-white/60 dark:bg-dark-elevated/60 shadow hover:shadow-lg text-gray-500 hover:text-red-500 transition-all focus:outline-none focus:ring-2 focus:ring-red-200"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={toggleTheme}
              className="ml-2 bg-gradient-to-br from-appleblue to-applepurple text-white rounded-full p-2 shadow-md hover:scale-110 focus:outline-none focus:ring-2 focus:ring-appleblue/30 transition-all"
              aria-label="Toggle dark mode"
              title={
                theme === "dark"
                  ? "Switch to light mode"
                  : "Switch to dark mode"
              }
            >
              {theme === "dark" ? "🌙" : "☀️"}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default React.memo(Header);
