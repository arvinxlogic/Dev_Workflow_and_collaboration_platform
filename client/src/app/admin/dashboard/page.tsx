'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Users, FolderKanban, CheckSquare, Activity, ArrowLeft } from 'lucide-react';

export default function AdminDashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    activeProjects: 0,
    totalTeams: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersRes, projectsRes, tasksRes, teamsRes] = await Promise.all([
        api.get('/users'),
        api.get('/projects'),
        api.get('/tasks'),
        api.get('/teams').catch(() => ({ data: [] }))
      ]);

      const users = usersRes.data;
      const projects = projectsRes.data;
      const tasks = tasksRes.data;
      const teams = teamsRes.data;

      setStats({
        totalUsers: users.length,
        totalProjects: projects.length,
        totalTasks: tasks.length,
        completedTasks: tasks.filter((t: any) => t.status === 'completed').length,
        activeProjects: projects.filter((p: any) => p.status === 'active').length,
        totalTeams: teams.length
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft size={20} />
            <span>Back to Dashboard</span>
          </button>

          <div className="flex items-center gap-3">
            <Activity className="text-blue-600" size={32} />
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-gray-600 text-sm">Overview of your workspace</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
              <Users className="text-blue-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <FolderKanban className="text-green-600" size={40} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalTasks}</p>
              </div>
              <CheckSquare className="text-orange-600" size={40} />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <button
              onClick={() => router.push('/admin/users')}
              className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow"
            >
              <Users className="text-blue-600 mb-3" size={32} />
              <h3 className="text-lg font-semibold mb-1">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage all users</p>
            </button>

            <button
              onClick={() => router.push('/admin/teams')}
              className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow"
            >
              <Users className="text-green-600 mb-3" size={32} />
              <h3 className="text-lg font-semibold mb-1">Manage Teams</h3>
              <p className="text-sm text-gray-600">Create and manage teams</p>
            </button>

            <button
              onClick={() => router.push('/dashboard')}
              className="bg-white rounded-lg shadow-sm p-6 text-left hover:shadow-md transition-shadow"
            >
              <Activity className="text-purple-600 mb-3" size={32} />
              <h3 className="text-lg font-semibold mb-1">View Projects</h3>
              <p className="text-sm text-gray-600">Go to main dashboard</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
