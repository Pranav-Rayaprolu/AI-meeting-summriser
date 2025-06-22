import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  User,
  Clock,
  CheckSquare,
  FileText,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { getMeetingSummary, getMeetingActionItems } from "../services/api";

const MeetingDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { state, updateActionItem } = useApp();

  const meeting = state.meetings.find((m) => m.id === id);
  const actionItems = state.actionItems.filter((item) => item.meetingId === id);

  // Local state for summary and action items
  const [summary, setSummary] = useState<string | null>(null);
  const [quickActionItems, setQuickActionItems] = useState<any[]>([]);
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  useEffect(() => {
    if (meeting && meeting.status === "completed") {
      setLoadingInsights(true);
      setInsightsError(null);
      Promise.all([
        getMeetingSummary(meeting.id),
        getMeetingActionItems(meeting.id),
      ])
        .then(([summaryRes, actionItemsRes]) => {
          setSummary(summaryRes.summary);
          setQuickActionItems(actionItemsRes.data);
        })
        .catch((err) => {
          setInsightsError("Failed to load insights. Please refresh the page.");
        })
        .finally(() => setLoadingInsights(false));
    }
  }, [meeting]);

  if (!meeting) {
    return (
      <div className="text-center py-16">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          Meeting not found
        </h2>
        <p className="text-gray-600">
          The meeting you're looking for doesn't exist.
        </p>
        <Link
          to="/dashboard"
          className="btn-accent inline-flex items-center text-white font-bold px-5 py-2 rounded-xl shadow-lg hover:scale-105 focus:ring-2 focus:ring-accent transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "text-green-600 bg-green-100";
      case "in-progress":
        return "text-blue-600 bg-blue-100";
      case "overdue":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleStatusChange = (itemId: string, newStatus: string) => {
    updateActionItem(itemId, { status: newStatus as any });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Link
          to="/dashboard"
          className="btn-accent inline-flex items-center text-white font-bold px-5 py-2 rounded-xl shadow-lg hover:scale-105 focus:ring-2 focus:ring-accent transition-all"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      {/* Meeting Info */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-light-border dark:border-dark-border p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-4xl font-extrabold text-pop text-black dark:text-white drop-shadow-lg mb-1">
            {meeting.title}
          </h1>
          <span
            className={`badge ${meeting.status === "completed" ? "badge-completed" : meeting.status === "processing" ? "badge-processing" : meeting.status === "failed" ? "badge-failed" : ""}`}
          >
            {meeting.status.replace("_", " ")}
          </span>
        </div>

        <div className="flex items-center space-x-6 text-gray-600 mb-8">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5" />
            <span>{new Date(meeting.createdAt).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5" />
            <span>{new Date(meeting.createdAt).toLocaleTimeString()}</span>
          </div>
        </div>

        {/* Processing Status */}
        {meeting.status === "processing" && (
          <div className="mb-8 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-2" />
              <span className="text-blue-800 font-medium">
                AI Processing in Progress
              </span>
            </div>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${meeting.processingProgress || 0}%` }}
              />
            </div>
            <p className="text-blue-700 text-sm mt-2">
              Analyzing transcript and generating insights...
            </p>
          </div>
        )}

        {/* Quick Insights Section */}
        {meeting.status === "completed" && (
          <div className="mb-8 card bg-white/80 dark:bg-dark-card/80 border-l-4 border-yellow-400 rounded-2xl p-6 shadow-xl">
            <h2 className="text-2xl font-extrabold text-pop text-yellow-700 mb-2">
              Quick Insights
            </h2>
            {loadingInsights ? (
              <div className="flex items-center space-x-2 text-yellow-700">
                <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                <span>Loading insights...</span>
              </div>
            ) : insightsError ? (
              <div className="text-red-600">{insightsError}</div>
            ) : summary ? (
              <>
                <ul className="list-disc pl-6 text-gray-800 space-y-1">
                  {summary
                    .split(/\n|\u2022|\*/)
                    .filter(Boolean)
                    .map((point, idx) => (
                      <li
                        key={idx}
                        className="text-lg font-medium text-black dark:text-white text-shadow"
                      >
                        {point.trim()}
                      </li>
                    ))}
                </ul>
                {Array.isArray(quickActionItems) &&
                  quickActionItems.length > 0 && (
                    <div className="mt-4">
                      <h3 className="text-md font-semibold text-yellow-700 mb-1">
                        Tasks Assigned:
                      </h3>
                      <ul className="list-decimal pl-6 text-gray-700 space-y-1">
                        {quickActionItems.map((item, idx) => (
                          <li
                            key={item.id || idx}
                            className="text-base font-semibold text-black dark:text-white text-shadow"
                          >
                            {item.description}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
              </>
            ) : (
              <div className="text-yellow-700">No insights available.</div>
            )}
          </div>
        )}

        {meeting.status === "processing" && (
          <div className="mb-8 bg-yellow-50 border-l-4 border-yellow-400 rounded-lg p-6 shadow-sm flex items-center space-x-4">
            <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h2 className="text-lg font-bold text-yellow-800 mb-1">
                Quick Insights
              </h2>
              <p className="text-yellow-700">
                Generating insights... Please wait while we analyze your meeting
                transcript.
              </p>
            </div>
          </div>
        )}

        {/* Summary */}
        {meeting.summary && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Meeting Summary
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="whitespace-pre-line text-gray-700 leading-relaxed">
                {meeting.summary}
              </div>
            </div>
          </div>
        )}

        {/* Action Items */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Action Items
            </h2>
            <span className="text-sm text-gray-500">
              {actionItems.length} {actionItems.length === 1 ? "item" : "items"}
            </span>
          </div>

          {actionItems.length > 0 ? (
            <div className="space-y-4">
              {actionItems.map((item) => (
                <div
                  key={item.id}
                  className="bg-light-surface dark:bg-dark-elevated rounded-lg p-6 hover:shadow-sm transition-shadow"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-gray-900 dark:text-gray-100 flex-1">
                      {item.description}
                    </h3>
                    <div className="flex items-center space-x-2 ml-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(item.priority)}`}
                      >
                        {item.priority}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4" />
                      <span>{item.owner}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4" />
                      <span>{item.deadline.toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4" />
                      <span>Created {item.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value)
                      }
                      className="bg-blue-600 dark:bg-dark-accent text-white rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>

                    {item.deadline < new Date() &&
                      item.status !== "completed" && (
                        <span className="text-sm text-red-600 font-medium bg-red-50 px-3 py-1 rounded-full">
                          Overdue
                        </span>
                      )}
                  </div>

                  {item.notes && (
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700">{item.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-gray-50 rounded-lg">
              <CheckSquare className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No action items generated yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MeetingDetail;
