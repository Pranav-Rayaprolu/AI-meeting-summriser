import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { TrendingUp, Users, Target, Calendar } from "lucide-react";
import { useApp } from "../../context/AppContext";

const AnalyticsDashboard: React.FC = () => {
  const { state } = useApp();

  // Mock data for demonstration
  const meetingTrends = [
    { date: "2025-01-01", meetings: 3, tasks: 12 },
    { date: "2025-01-02", meetings: 2, tasks: 8 },
    { date: "2025-01-03", meetings: 4, tasks: 15 },
    { date: "2025-01-04", meetings: 1, tasks: 5 },
    { date: "2025-01-05", meetings: 3, tasks: 11 },
    { date: "2025-01-06", meetings: 2, tasks: 9 },
    { date: "2025-01-07", meetings: 5, tasks: 18 },
  ];

  const taskStatusData = [
    {
      name: "Completed",
      value: state.actionItems.filter((item) => item.status === "completed")
        .length,
      color: "#10B981",
    },
    {
      name: "In Progress",
      value: state.actionItems.filter((item) => item.status === "in-progress")
        .length,
      color: "#3B82F6",
    },
    {
      name: "Pending",
      value: state.actionItems.filter((item) => item.status === "pending")
        .length,
      color: "#F59E0B",
    },
    {
      name: "Overdue",
      value: state.actionItems.filter(
        (item) => item.status !== "completed" && item.deadline < new Date()
      ).length,
      color: "#EF4444",
    },
  ];

  const keywordData = [
    { keyword: "Planning", frequency: 15 },
    { keyword: "Development", frequency: 12 },
    { keyword: "Testing", frequency: 10 },
    { keyword: "Deployment", frequency: 8 },
    { keyword: "Review", frequency: 7 },
  ];

  const completionRate =
    state.actionItems.length > 0
      ? Math.round(
          (state.actionItems.filter((item) => item.status === "completed")
            .length /
            state.actionItems.length) *
            100
        )
      : 0;

  const insights = [
    {
      title: "Meeting Efficiency",
      value: "85%",
      change: "+12%",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Avg Participants",
      value: "6.2",
      change: "+0.8",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Task Completion",
      value: `${completionRate}%`,
      change: "+5%",
      icon: Target,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Avg Meeting Length",
      value: "42min",
      change: "-8min",
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-light-border dark:border-dark-border p-6">
        <h1 className="text-3xl font-extrabold text-pop text-black dark:text-white drop-shadow-lg mb-2">
          Analytics Dashboard
        </h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 font-medium mb-2">
          Insights into your meeting productivity and task management
          performance.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {insights.map((insight, index) => {
          const Icon = insight.icon;
          return (
            <div
              key={index}
              className="card bg-white/80 dark:bg-dark-card/80 rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6 hover:scale-105 transition-all"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-base font-semibold text-black dark:text-white text-pop mb-1">
                    {insight.title}
                  </p>
                  <p className="text-3xl font-extrabold text-pop text-primary dark:text-accent drop-shadow-lg mt-1">
                    {insight.value}
                  </p>
                  <p className={`text-sm ${insight.color} mt-1`}>
                    {insight.change} from last week
                  </p>
                </div>
                <div
                  className={`p-3 rounded-lg bg-white/70 dark:bg-dark-card/70 shadow-md`}
                >
                  <Icon className={`w-8 h-8 text-accent drop-shadow-md`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Meeting Trends */}
        <div className="card bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-light-border dark:border-dark-border p-6">
          <h3 className="text-2xl font-extrabold text-pop text-black dark:text-white mb-4">
            Meeting & Task Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={meetingTrends}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <YAxis />
              <Tooltip
                labelFormatter={(value) => new Date(value).toLocaleDateString()}
              />
              <Line
                type="monotone"
                dataKey="meetings"
                stroke="#3B82F6"
                strokeWidth={2}
                name="Meetings"
              />
              <Line
                type="monotone"
                dataKey="tasks"
                stroke="#8B5CF6"
                strokeWidth={2}
                name="Tasks"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Task Status Distribution */}
        <div className="card bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-light-border dark:border-dark-border p-6">
          <h3 className="text-2xl font-extrabold text-pop text-black dark:text-white mb-4">
            Task Status Distribution
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={taskStatusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {taskStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Keyword Frequency */}
        <div className="card bg-white/90 dark:bg-dark-card/90 backdrop-blur-xl rounded-2xl shadow-xl border border-light-border dark:border-dark-border p-6">
          <h3 className="text-xl font-extrabold text-black dark:text-white mb-4 text-pop drop-shadow-lg">
            Common Keywords
          </h3>
          <div style={{ width: "100%", height: 300, overflow: "visible" }}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={keywordData}
                layout="horizontal"
                margin={{ left: 40, right: 20, top: 10, bottom: 10 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={
                    window.matchMedia &&
                    window.matchMedia("(prefers-color-scheme: dark)").matches
                      ? "#444"
                      : "#ccc"
                  }
                />
                <XAxis
                  type="number"
                  tick={{
                    fill:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                    fontWeight: 600,
                  }}
                  axisLine={{
                    stroke:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                  }}
                  tickLine={{
                    stroke:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                  }}
                />
                <YAxis
                  dataKey="keyword"
                  type="category"
                  width={140}
                  tick={{
                    fill:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                    fontWeight: 600,
                  }}
                  axisLine={{
                    stroke:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                  }}
                  tickLine={{
                    stroke:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                  }}
                />
                <Tooltip
                  contentStyle={{
                    background:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#23232b"
                        : "#fff",
                    color:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                    borderRadius: 12,
                    fontWeight: 600,
                  }}
                  itemStyle={{
                    color:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                  }}
                  labelStyle={{
                    color:
                      window.matchMedia &&
                      window.matchMedia("(prefers-color-scheme: dark)").matches
                        ? "#fff"
                        : "#222",
                    fontWeight: 700,
                  }}
                />
                <Bar dataKey="frequency" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Productivity Summary */}
        <div className="card bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md dark:shadow-[0_2px_8px_rgba(0,0,0,0.6)] border border-light-border dark:border-dark-border p-6">
          <h3 className="text-2xl font-extrabold text-black dark:text-white mb-6 text-pop drop-shadow-lg">
            Productivity Summary
          </h3>
          <div className="space-y-5">
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                Total Meetings This Month
              </span>
              <span className="font-extrabold text-xl text-appleblue dark:text-appleblue drop-shadow">
                {state.meetings.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                Action Items Generated
              </span>
              <span className="font-extrabold text-xl text-applepurple dark:text-applepurple drop-shadow">
                {state.actionItems.length}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                Completion Rate
              </span>
              <span className="font-extrabold text-xl text-green-500 dark:text-green-400 drop-shadow">
                {completionRate}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-medium text-gray-700 dark:text-gray-300">
                Avg Tasks per Meeting
              </span>
              <span className="font-extrabold text-xl text-appleblue dark:text-appleblue drop-shadow">
                {state.meetings.length > 0
                  ? Math.round(
                      (state.actionItems.length / state.meetings.length) * 10
                    ) / 10
                  : 0}
              </span>
            </div>
          </div>

          <div className="mt-8 flex items-center gap-4 px-6 py-4 rounded-2xl shadow-2xl bg-white/90 dark:bg-dark-card/90 backdrop-blur-2xl hover:shadow-3xl transition-all border-none ring-1 ring-appleblue/10 dark:ring-appleblue/20">
            <span className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-appleblue to-applepurple text-white text-3xl shadow-lg mr-2">
              💡
            </span>
            <div>
              <h4 className="font-extrabold text-xl text-black dark:text-white mb-1 text-pop drop-shadow-lg tracking-tight">
                Insight
              </h4>
              <p className="text-lg font-bold text-black dark:text-white text-pop drop-shadow-sm">
                Your meeting productivity has improved by
                <span className="font-extrabold text-appleblue dark:text-appleblue text-xl drop-shadow-md mx-1">
                  15%
                </span>
                this month. Keep up the great work!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
