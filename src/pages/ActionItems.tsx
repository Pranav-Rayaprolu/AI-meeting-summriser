import React, { useState, useEffect } from "react";
import {
  Search,
  Calendar,
  User,
  Filter,
  SortAsc,
  SortDesc,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { useApp } from "../context/AppContext";
import { ActionItem } from "../types";

const ActionItems: React.FC = () => {
  const { state, fetchActionItems } = useApp();
  const { actionItems } = state;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"deadline" | "priority" | "createdAt">(
    "deadline"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadActionItems = async () => {
      setIsLoading(true);
      try {
        await fetchActionItems();
      } catch (error) {
        console.error("Failed to fetch action items:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadActionItems();
  }, [fetchActionItems]);

  const filteredAndSortedActionItems = actionItems
    .filter((item: ActionItem) => {
      const matchesSearch =
        item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.owner.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus =
        statusFilter === "all" || item.status === statusFilter;
      const matchesPriority =
        priorityFilter === "all" || item.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    })
    .sort((a: ActionItem, b: ActionItem) => {
      let comparison = 0;

      switch (sortBy) {
        case "deadline":
          comparison =
            new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
          break;
        case "priority":
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          comparison =
            (priorityOrder[a.priority as keyof typeof priorityOrder] || 0) -
            (priorityOrder[b.priority as keyof typeof priorityOrder] || 0);
          break;
        case "createdAt":
          comparison =
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          break;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "high":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      case "medium":
        return <Clock className="w-4 h-4 text-orange-600" />;
      case "low":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const formatDate = (dateString: string | Date) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isOverdue = (deadline: string | Date) => {
    return new Date(deadline) < new Date();
  };

  const getOverdueStatus = (item: ActionItem) => {
    if (item.status === "completed") return null;
    if (isOverdue(item.deadline)) {
      return <span className="text-red-600 text-sm font-medium">Overdue</span>;
    }
    return null;
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
            Action Items
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-2">
            Track and manage your meeting action items
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="w-full flex flex-col items-center">
        <div className="w-full flex flex-col md:flex-row items-center gap-4 bg-white/80 dark:bg-dark-card/80 backdrop-blur-xl rounded-full shadow-xl border border-light-border dark:border-dark-border px-4 py-3 mb-2 transition-all">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search action items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-2 rounded-full bg-transparent text-black dark:text-white placeholder:font-semibold placeholder:text-gray-400 dark:placeholder:text-gray-500 border-none focus:outline-none focus:ring-2 focus:ring-appleblue/60 focus:bg-white/90 dark:focus:bg-dark-card/90 transition-all shadow-inner"
            />
          </div>

          {/* Status Filter */}
          <div className="relative flex-1 min-w-[140px] flex items-center">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-transparent text-black dark:text-white border-none focus:outline-none focus:ring-2 focus:ring-appleblue/60 focus:bg-white/90 dark:focus:bg-dark-card/90 placeholder:font-semibold transition-all shadow-inner"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div className="relative flex-1 min-w-[140px] flex items-center">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-full bg-transparent text-black dark:text-white border-none focus:outline-none focus:ring-2 focus:ring-appleblue/60 focus:bg-white/90 dark:focus:bg-dark-card/90 placeholder:font-semibold transition-all shadow-inner"
            >
              <option value="all">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {/* Sort By */}
          <div className="relative flex-1 min-w-[180px] flex items-center gap-2">
            {sortOrder === "asc" ? (
              <SortAsc className="w-5 h-5 text-gray-400" />
            ) : (
              <SortDesc className="w-5 h-5 text-gray-400" />
            )}
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as "deadline" | "priority" | "createdAt"
                )
              }
              className="w-full pl-4 pr-4 py-2 rounded-full bg-transparent text-black dark:text-white border-none focus:outline-none focus:ring-2 focus:ring-appleblue/60 focus:bg-white/90 dark:focus:bg-dark-card/90 placeholder:font-semibold transition-all shadow-inner"
            >
              <option value="deadline">Sort by Deadline</option>
              <option value="priority">Sort by Priority</option>
              <option value="createdAt">Sort by Created</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === "asc" ? "desc" : "asc")}
              className="ml-2 p-2 rounded-full bg-gradient-to-r from-appleblue to-applepurple text-white shadow-md hover:scale-105 hover:shadow-lg focus:ring-2 focus:ring-appleblue/40 transition-all"
              aria-label="Toggle sort order"
            >
              {sortOrder === "asc" ? (
                <SortAsc className="w-5 h-5" />
              ) : (
                <SortDesc className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Action Items List */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-light-border dark:border-dark-border p-6">
        {filteredAndSortedActionItems.length === 0 ? (
          <div className="p-8 text-center">
            <CheckCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No action items found
            </h3>
            <p className="text-gray-600">
              {searchTerm || statusFilter !== "all" || priorityFilter !== "all"
                ? "Try adjusting your search or filters"
                : "Upload a meeting to generate action items"}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAndSortedActionItems.map((item: ActionItem) => (
              <div
                key={item.id}
                className="p-6 rounded-2xl mb-4 bg-white/90 dark:bg-dark-card/80 border border-light-border dark:border-dark-border shadow-xl transition-all group hover:shadow-2xl hover:bg-white/95 dark:hover:bg-dark-card/90 hover:border-appleblue/60 dark:hover:border-appleblue/80 hover:ring-2 hover:ring-appleblue/20"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-start space-x-3 mb-3">
                      <div className="flex-shrink-0 mt-1">
                        {getPriorityIcon(item.priority)}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-extrabold text-pop text-black dark:text-white mb-1">
                          {item.description}
                        </h3>
                        <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-2">
                          <div className="flex items-center space-x-1">
                            <User className="w-4 h-4" />
                            <span>{item.owner}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>Due: {formatDate(item.deadline)}</span>
                          </div>
                        </div>
                        {getOverdueStatus(item)}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
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

                    {item.notes && (
                      <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">
                        {item.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-light-border dark:border-dark-border p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {actionItems.length}
            </div>
            <div className="text-gray-600">Total Items</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {
                actionItems.filter(
                  (item: ActionItem) => item.status === "pending"
                ).length
              }
            </div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {
                actionItems.filter(
                  (item: ActionItem) => item.status === "in-progress"
                ).length
              }
            </div>
            <div className="text-gray-600">In Progress</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {
                actionItems.filter(
                  (item: ActionItem) => item.status === "completed"
                ).length
              }
            </div>
            <div className="text-gray-600">Completed</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActionItems;
