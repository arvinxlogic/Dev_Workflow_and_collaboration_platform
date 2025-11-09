"use client";

import React, { useEffect, useState } from "react";
import axios from "@/lib/axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { 
  Users, 
  Briefcase, 
  CheckCircle, 
  Clock, 
  TrendingUp,
  Activity 
} from "lucide-react";

interface DashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
}

interface TaskByStatus {
  status: string;
  count: number;
}

interface TaskByPriority {
  priority: string;
  count: number;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const StatCard = ({
  icon: Icon,
  title,
  value,
  color,
}: {
  icon: React.ElementType;
  title: string;
  value: number | string;
  color: string;
}) => (
  <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
          {title}
        </p>
        <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
      <div className={`rounded-full p-3 ${color}`}>
        <Icon className="h-8 w-8 text-white" />
      </div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [tasksByStatus, setTasksByStatus] = useState<TaskByStatus[]>([]);
  const [tasksByPriority, setTasksByPriority] = useState<TaskByPriority[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsRes, tasksRes, projectsRes] = await Promise.all([
          axios.get("/analytics/dashboard-stats"),
          axios.get("/tasks"),
          axios.get("/projects"),
        ]);

        // Calculate stats
        const tasks = tasksRes.data || [];
        const dashboardStats: DashboardStats = {
          totalUsers: statsRes.data?.totalUsers || 0,
          totalProjects: projectsRes.data?.length || 0,
          totalTasks: tasks.length,
          completedTasks: tasks.filter((t: any) => t.status === "Completed").length,
          inProgressTasks: tasks.filter((t: any) => t.status === "In Progress").length,
          todoTasks: tasks.filter((t: any) => t.status === "To Do").length,
        };

        setStats(dashboardStats);

        // Tasks by status
        const statusCount = tasks.reduce((acc: any, task: any) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {});

        setTasksByStatus(
          Object.entries(statusCount).map(([status, count]) => ({
            status,
            count: count as number,
          }))
        );

        // Tasks by priority
        const priorityCount = tasks.reduce((acc: any, task: any) => {
          acc[task.priority] = (acc[task.priority] || 0) + 1;
          return acc;
        }, {});

        setTasksByPriority(
          Object.entries(priorityCount).map(([priority, count]) => ({
            priority,
            count: count as number,
          }))
        );

        setLoading(false);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-xl text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900 dark:text-white">
        Admin Dashboard
      </h1>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={Users}
          title="Total Users"
          value={stats?.totalUsers || 0}
          color="bg-blue-500"
        />
        <StatCard
          icon={Briefcase}
          title="Total Projects"
          value={stats?.totalProjects || 0}
          color="bg-green-500"
        />
        <StatCard
          icon={Activity}
          title="Total Tasks"
          value={stats?.totalTasks || 0}
          color="bg-purple-500"
        />
        <StatCard
          icon={CheckCircle}
          title="Completed Tasks"
          value={stats?.completedTasks || 0}
          color="bg-orange-500"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Tasks by Status - Bar Chart */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Tasks by Status
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={tasksByStatus}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="status" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Tasks by Priority - Pie Chart */}
        <div className="rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
          <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
            Tasks by Priority
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={tasksByPriority}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ priority, percent }) =>
                  `${priority}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="count"
              >
                {tasksByPriority.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Task Progress Overview */}
      <div className="mt-6 rounded-lg bg-white p-6 shadow-md dark:bg-gray-800">
        <h2 className="mb-4 text-xl font-bold text-gray-900 dark:text-white">
          Task Progress Overview
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-blue-900 dark:text-blue-300">
                To Do
              </span>
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-blue-900 dark:text-blue-300">
              {stats?.todoTasks || 0}
            </p>
          </div>

          <div className="rounded-lg bg-yellow-50 p-4 dark:bg-yellow-900/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-yellow-900 dark:text-yellow-300">
                In Progress
              </span>
              <TrendingUp className="h-5 w-5 text-yellow-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-yellow-900 dark:text-yellow-300">
              {stats?.inProgressTasks || 0}
            </p>
          </div>

          <div className="rounded-lg bg-green-50 p-4 dark:bg-green-900/20">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-green-900 dark:text-green-300">
                Completed
              </span>
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <p className="mt-2 text-2xl font-bold text-green-900 dark:text-green-300">
              {stats?.completedTasks || 0}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
