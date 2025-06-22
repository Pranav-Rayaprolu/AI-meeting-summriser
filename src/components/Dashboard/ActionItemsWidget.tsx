import React from "react";
import { Link } from "react-router-dom";
import { CheckSquare, Clock, AlertTriangle, User } from "lucide-react";
import { useApp } from "../../context/AppContext";

const ActionItemsWidget: React.FC = () => {
  const { state, updateActionItem } = useApp();

  const recentActionItems = state.actionItems
    .sort((a, b) => a.deadline.getTime() - b.deadline.getTime())
    .slice(0, 5);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-100";
      case "medium":
        return "text-yellow-600 bg-yellow-100";
      case "low":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckSquare className="w-4 h-4 text-green-500" />;
      case "in-progress":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "overdue":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const isOverdue = (deadline: Date) => {
    return new Date() > deadline;
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    updateActionItem(itemId, { status: newStatus as any });
  };

  if (recentActionItems.length === 0) {
    return (
      <div className="card bg-white/80 dark:bg-dark-card/80 rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8">
        <h3 className="text-2xl font-extrabold text-pop text-black dark:text-white mb-6">
          Action Items
        </h3>
        <div className="text-center py-8">
          <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No action items yet</p>
          <p className="text-sm text-gray-400">
            Upload a meeting to generate action items
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white/80 dark:bg-dark-card/80 rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-extrabold text-pop text-black dark:text-white">
          Action Items
        </h3>
        <Link
          to="/action-items"
          className="btn-accent text-sm px-4 py-1 font-bold shadow-md hover:scale-105"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {recentActionItems.map((item) => (
          <div className="card group transition-all hover:shadow-2xl hover:scale-105 bg-white/90 dark:bg-dark-card/90 border border-light-border dark:border-dark-border backdrop-blur-xl shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`badge ${item.status === "completed" ? "badge-completed" : item.status === "in-progress" ? "badge-inprogress" : ""}`}
              >
                {item.status.replace("_", " ")}
              </span>
              <span
                className={`badge ${item.priority === "high" ? "badge-high" : item.priority === "low" ? "badge-low" : ""}`}
              >
                {item.priority}
              </span>
            </div>
            <div className="text-xl font-extrabold text-pop text-black dark:text-white mb-1">
              {item.description}
            </div>
            <div className="text-secondary text-base font-medium">
              Owner: {item.owner}
            </div>
            <div className="text-disabled text-xs mt-2">
              Due: {item.deadline.toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActionItemsWidget;
