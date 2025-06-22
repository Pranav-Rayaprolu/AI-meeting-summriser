import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search, Calendar, Clock, FileText, Filter } from "lucide-react";
import { useApp } from "../context/AppContext";
import { Meeting } from "../types";

const Meetings: React.FC = () => {
  const { state, fetchMeetings } = useApp();
  const { meetings } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadMeetings = async () => {
      setIsLoading(true);
      try {
        await fetchMeetings();
      } catch (error) {
        console.error("Failed to fetch meetings:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadMeetings();
  }, [fetchMeetings]);

  const filteredMeetings = meetings.filter((meeting: Meeting) => {
    const matchesSearch =
      meeting.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      meeting.transcript?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || meeting.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "processing":
        return "bg-yellow-100 text-yellow-800";
      case "pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-pop text-black dark:text-white drop-shadow-lg mb-1">
            Meetings
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-2">
            Manage and view all your meetings
          </p>
        </div>
        <Link
          to="/upload"
          className="btn-accent flex items-center space-x-2 px-6 py-2 text-lg shadow-lg hover:scale-105 focus:ring-2 focus:ring-accent"
        >
          <FileText className="w-4 h-4" />
          <span>Upload New Meeting</span>
        </Link>
      </div>

      {/* Search and Filters */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm border border-light-border dark:border-dark-border p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search meetings by title or content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-light-border dark:border-dark-border rounded-xl bg-white/70 dark:bg-dark-card/70 text-black dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm"
            />
          </div>
          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-light-border dark:border-dark-border rounded-xl bg-white/70 dark:bg-dark-card/70 text-black dark:text-white focus:ring-2 focus:ring-accent focus:border-transparent shadow-sm"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>
      </div>

      {/* Meetings List */}
      <div className="space-y-6">
        {filteredMeetings.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No meetings found
            </h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload your first meeting to get started"}
            </p>
            {!searchTerm && statusFilter === "all" && (
              <Link
                to="/upload"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Upload Meeting
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredMeetings.map((meeting: Meeting) => (
              <div
                key={meeting.id}
                className="card group flex flex-col gap-2 transition-all hover:shadow-2xl hover:scale-[1.025] bg-white/80 dark:bg-dark-card/80 border border-light-border dark:border-dark-border backdrop-blur-xl shadow-xl"
              >
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xl font-extrabold text-pop text-black dark:text-white truncate">
                    {meeting.title}
                  </span>
                  <span className="ml-auto px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-green-400/90 to-green-600/90 text-white shadow border border-green-500/30 animate-fade-in">
                    {meeting.status}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-secondary text-sm">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-accent" />{" "}
                    {formatDate(meeting.createdAt)}
                  </span>
                  <span className="flex items-center gap-1">
                    <FileText className="w-4 h-4 text-accent" />{" "}
                    {meeting.transcript
                      ? `${Math.ceil(meeting.transcript.split(" ").length / 150)} min read`
                      : "No transcript"}
                  </span>
                </div>
                {meeting.transcript && (
                  <p className="text-secondary text-shadow text-base mb-2 line-clamp-2">
                    {meeting.transcript.length > 200
                      ? `${meeting.transcript.substring(0, 200)}...`
                      : meeting.transcript}
                  </p>
                )}
                <Link
                  to={`/meeting/${meeting.id}`}
                  className="btn-accent self-end mt-2 px-5 py-2 text-base font-bold shadow-lg hover:scale-105 focus:ring-2 focus:ring-accent"
                >
                  View Details
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-lg shadow-sm border border-light-border dark:border-dark-border p-4">
        <div className="flex justify-between items-center text-sm text-gray-600">
          <span className="text-pop text-black dark:text-white">
            Showing {filteredMeetings.length} of {meetings.length} meetings
          </span>
          <span className="text-pop text-black dark:text-white">
            Total meetings: {meetings.length}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Meetings;
