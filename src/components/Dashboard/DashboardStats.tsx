import React from "react";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { useApp } from "../../context/AppContext";

const DashboardStats: React.FC = () => {
  const { state } = useApp();

  console.log("DashboardStats: Rendering with state", {
    meetingsCount: state.meetings.length,
    actionItemsCount: state.actionItems.length,
    analytics: state.analytics,
  });

  const stats = [
    {
      label: "Total Meetings",
      value: state.meetings.length,
      icon: FileText,
      color: "bg-blue-500",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      label: "Completed Tasks",
      value: state.actionItems.filter((item) => item.status === "completed")
        .length,
      icon: CheckCircle,
      color: "bg-green-500",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      label: "Pending Tasks",
      value: state.actionItems.filter((item) => item.status === "pending")
        .length,
      icon: Clock,
      color: "bg-yellow-500",
      bgColor: "bg-yellow-50",
      textColor: "text-yellow-600",
    },
    {
      label: "Overdue Tasks",
      value: state.actionItems.filter((item) => {
        const deadlineDate = new Date(item.deadline);
        return item.status !== "completed" && deadlineDate < new Date();
      }).length,
      icon: AlertTriangle,
      color: "bg-red-500",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
    },
  ];

  console.log("DashboardStats: Calculated stats", stats);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <div
            key={index}
            className="card flex flex-col items-center justify-center text-center bg-white/70 dark:bg-dark-card/80 backdrop-blur-xl border border-white/10 dark:border-dark-border shadow-xl hover:shadow-2xl hover:scale-105 transition-all"
          >
            <div className="mb-2 text-5xl font-extrabold text-pop drop-shadow-lg bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent animate-gradient-x">
              {stat.value}
            </div>
            <div className="text-lg font-semibold text-black dark:text-white text-pop mb-1">
              {stat.label}
            </div>
            <div className="mt-2 text-3xl">
              <span className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                <Icon className="w-8 h-8 drop-shadow-md" />
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DashboardStats;
