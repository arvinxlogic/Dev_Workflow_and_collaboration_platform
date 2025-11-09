"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  TrendingUp,
  Activity,
  Calendar,
  Loader2,
} from "lucide-react";

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setCurrentUser(user);
      if (user.role !== "admin") {
        router.replace("/dashboard");
      } else {
        fetchAnalytics();
      }
    } else {
      router.replace("/login");
    }
  }, [router]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/analytics/admin");
      setAnalytics(data);
      setError("");
    } catch (error: any) {
      console.error("Analytics error:", error);
      setError(error.response?.data?.message || "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  if (loading || !currentUser || currentUser.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">{error}</p>
          <button
            onClick={fetchAnalytics}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!analytics) return null;

  const {
    projectStats = {},
    taskStats = {},
    userStats = {},
    recentProjects = [],
    tasksByPriority = [],
    tasksByStatus = [],
  } = analytics;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 md:p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-2">
          Admin Analytics Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Real-time project management insights and team performance metrics
        </p>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Projects */}
        <MetricCard
          icon={<FolderKanban className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          title="Total Projects"
          value={projectStats.total || 0}
          subtitle={`${projectStats.active || 0} active · ${projectStats.completed || 0} completed`}
          trend="+12%"
          trendPositive
          bgColor="bg-blue-100 dark:bg-blue-900"
        />

        {/* Total Tasks */}
        <MetricCard
          icon={<CheckCircle2 className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          title="Total Tasks"
          value={taskStats.total || 0}
          subtitle={`${taskStats.completed || 0} completed · ${taskStats.inProgress || 0} in progress`}
          trend="+8%"
          trendPositive
          bgColor="bg-purple-100 dark:bg-purple-900"
        />

        {/* Overdue Tasks */}
        <MetricCard
          icon={<AlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />}
          title="Overdue Tasks"
          value={taskStats.overdue || 0}
          subtitle={`${taskStats.total ? Math.round(((taskStats.overdue || 0) / taskStats.total) * 100) : 0}% of total tasks`}
          trend="Needs Attention"
          trendPositive={false}
          bgColor="bg-red-100 dark:bg-red-900"
        />

        {/* Active Users */}
        <MetricCard
          icon={<Users className="w-6 h-6 text-green-600 dark:text-green-400" />}
          title="Active Users"
          value={userStats.active || 0}
          subtitle={`Out of ${userStats.total || 0} total · ${userStats.teams || 0} teams`}
          trend="+5%"
          trendPositive
          bgColor="bg-green-100 dark:bg-green-900"
        />
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Tasks by Priority */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tasks by Priority</h2>
            <Activity className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {tasksByPriority.length > 0 ? (
              tasksByPriority.map((item: any) => (
                <PriorityBar key={item.priority} item={item} total={taskStats.total || 1} />
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-center py-4">No data available</p>
            )}
          </div>
        </div>

        {/* Project Completion Rate */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Completion Rate</h2>
            <TrendingUp className="w-5 h-5 text-gray-400" />
          </div>
          <div className="flex flex-col items-center justify-center py-8">
            <CircularProgress value={projectStats.completionRate || 0} />
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-4 text-center">
              Across all active projects
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Quick Stats</h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            <QuickStat label="On-time Delivery" value={`${taskStats.onTimePercentage || 0}%`} color="text-green-600 dark:text-green-400" />
            <QuickStat label="Avg. Task Duration" value={`${taskStats.avgDuration || 0} days`} color="text-gray-900 dark:text-white" />
            <QuickStat label="Team Utilization" value={`${userStats.utilization || 0}%`} color="text-blue-600 dark:text-blue-400" />
            <QuickStat label="Projects This Month" value={`${projectStats.thisMonth || 0} New`} color="text-purple-600 dark:text-purple-400" />
          </div>
        </div>
      </div>

      {/* Recent Projects Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Recent Projects</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Project Name
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Status
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Completion
                </th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody>
              {recentProjects.length > 0 ? (
                recentProjects.map((project: any) => (
                  <ProjectRow key={project._id} project={project} />
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 dark:text-gray-400">
                    No projects found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, trend, trendPositive, bgColor }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 ${bgColor} rounded-lg`}>{icon}</div>
        <span
          className={`text-xs font-semibold px-2 py-1 rounded-full ${
            trendPositive
              ? "text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900"
              : "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900"
          }`}
        >
          {trend}
        </span>
      </div>
      <h3 className="text-gray-600 dark:text-gray-400 text-sm font-medium mb-1">{title}</h3>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{subtitle}</p>
    </div>
  );
}

function PriorityBar({ item, total }: any) {
  const colors: any = {
    urgent: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-green-500",
  };
  const percentage = (item.count / total) * 100;
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className={`w-3 h-3 rounded-full ${colors[item.priority]}`} />
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300 capitalize">
          {item.priority}
        </span>
      </div>
      <div className="flex items-center space-x-3">
        <div className="w-32 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div className={`h-2 rounded-full ${colors[item.priority]}`} style={{ width: `${percentage}%` }} />
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white w-8 text-right">{item.count}</span>
      </div>
    </div>
  );
}

function CircularProgress({ value }: { value: number }) {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - value / 100);

  return (
    <div className="relative w-40 h-40">
      <svg className="w-full h-full transform -rotate-90">
        <circle cx="80" cy="80" r={radius} stroke="currentColor" strokeWidth="12" fill="none" className="text-gray-200 dark:text-gray-700" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="text-blue-600 dark:text-blue-400 transition-all duration-500"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-gray-900 dark:text-white">{value}%</span>
        <span className="text-xs text-gray-500 dark:text-gray-400">Average</span>
      </div>
    </div>
  );
}

function QuickStat({ label, value, color }: any) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className={`text-lg font-bold ${color}`}>{value}</span>
    </div>
  );
}

function ProjectRow({ project }: any) {
  const completion = project.completionPercentage || 0;
  const statusColors: any = {
    completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    "on-hold": "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  };

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      <td className="py-4 px-4 text-sm font-medium text-gray-900 dark:text-white">{project.name}</td>
      <td className="py-4 px-4">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[project.status] || statusColors.active}`}>
          {project.status}
        </span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center space-x-2">
          <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 dark:bg-blue-400 h-2 rounded-full" style={{ width: `${completion}%` }} />
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{completion}%</span>
        </div>
      </td>
      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400">
        {project.endDate ? new Date(project.endDate).toLocaleDateString() : "No due date"}
      </td>
    </tr>
  );
}
