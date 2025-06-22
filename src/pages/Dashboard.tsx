// @refresh reset
import React from "react";
import DashboardStats from "../components/Dashboard/DashboardStats";
import RecentMeetings from "../components/Dashboard/RecentMeetings";
import ActionItemsWidget from "../components/Dashboard/ActionItemsWidget";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import { RefreshCw } from "lucide-react";

const Dashboard: React.FC = () => {
  const { state: authState } = useAuth();
  const {
    state: appState,
    fetchMeetings,
    fetchActionItems,
    fetchAnalytics,
  } = useApp();

  const handleRefresh = async () => {
    try {
      await Promise.all([
        fetchMeetings(),
        fetchActionItems(),
        fetchAnalytics(),
      ]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  if (appState.isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (appState.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {appState.error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with refresh button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-pop text-black dark:text-white drop-shadow-lg mb-1">
            Dashboard
          </h1>
          <button
            onClick={handleRefresh}
            className="btn-accent flex items-center space-x-2 px-6 py-2 text-lg shadow-lg hover:scale-105 focus:ring-2 focus:ring-accent"
          >
            <RefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <DashboardStats />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <RecentMeetings />
          <ActionItemsWidget />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
