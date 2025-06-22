import React from "react";
import { Link } from "react-router-dom";
import { FileText, Clock, CheckCircle, AlertCircle, Eye } from "lucide-react";
import { useApp } from "../../context/AppContext";

const RecentMeetings: React.FC = () => {
  const { state } = useApp();

  const recentMeetings = state.meetings
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "processing":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "failed":
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const baseClasses =
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    switch (status) {
      case "completed":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "processing":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "failed":
        return `${baseClasses} bg-red-100 text-red-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  if (recentMeetings.length === 0) {
    return (
      <div className="card bg-white/70 dark:bg-dark-card/80 backdrop-blur-xl border border-white/10 dark:border-dark-border rounded-2xl p-8 shadow-xl">
        <h3 className="text-2xl font-extrabold text-pop text-black dark:text-white mb-6">
          Recent Meetings
        </h3>
        <div className="text-center py-8">
          <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No meetings yet</p>
          <Link
            to="/upload"
            className="btn-accent inline-flex items-center px-5 py-2 font-bold shadow-md rounded-xl hover:scale-105 transition-all"
          >
            Upload Your First Meeting
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-white/70 dark:bg-dark-card/80 backdrop-blur-xl border border-white/10 dark:border-dark-border rounded-2xl p-6 shadow-xl">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-extrabold text-pop text-black dark:text-white">
          Recent Meetings
        </h3>
        <Link
          to="/meetings"
          className="btn-accent text-sm px-4 py-1 font-bold shadow-md rounded-xl hover:scale-105"
        >
          View all
        </Link>
      </div>

      <div className="space-y-4">
        {recentMeetings.map((meeting) => (
          <div
            key={meeting.id}
            className="card group transition-all hover:shadow-2xl hover:scale-105 bg-white/90 dark:bg-dark-card/90 border border-light-border dark:border-dark-border backdrop-blur-xl shadow-xl"
          >
            <div className="flex items-center gap-3 mb-2">
              <span
                className={`badge ${meeting.status === "completed" ? "badge-completed" : meeting.status === "processing" ? "badge-processing" : meeting.status === "failed" ? "badge-failed" : ""}`}
              >
                {meeting.status.replace("_", " ")}
              </span>
            </div>
            <div className="text-xl font-extrabold text-pop text-black dark:text-white mb-1">
              {meeting.title}
            </div>
            <div className="text-secondary text-base font-medium">
              Created: {meeting.createdAt.toLocaleDateString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentMeetings;
