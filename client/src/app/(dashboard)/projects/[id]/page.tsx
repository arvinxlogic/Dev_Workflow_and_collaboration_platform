'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Task, Project } from '@/types';
import KanbanBoard from '@/components/Board/KanbanBoard';
import TaskTable from '@/components/Table/TaskTable';
import GanttChart from '@/components/Timeline/GanttChart';
import ModalNewTask from '@/components/Modal/ModalNewTask';
import { 
  LayoutGrid, 
  List, 
  Calendar, 
  ArrowLeft, 
  Plus,
  Users,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Check
} from 'lucide-react';
import { getDashboardRoute } from '@/lib/navigation';

type ViewMode = 'board' | 'table' | 'timeline';

export default function ProjectPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('board');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [markingComplete, setMarkingComplete] = useState(false);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
  }, []);

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks?projectId=${projectId}`)
      ]);
      
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setError('');
    } catch (error: any) {
      console.error('Error:', error);
      setError(error.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    fetchProjectData();
  };

  const handleMarkComplete = async () => {
    if (!window.confirm('Are you sure you want to mark this project as completed?')) {
      return;
    }

    setMarkingComplete(true);
    try {
      await api.put(`/projects/${projectId}`, { 
        ...project,
        status: 'completed' 
      });
      alert('Project marked as completed!');
      fetchProjectData(); // Refresh data
    } catch (error: any) {
      console.error('Error marking project complete:', error);
      alert(error.response?.data?.message || 'Failed to mark project as completed');
    } finally {
      setMarkingComplete(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  // Stats calculation
  const stats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in-progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading project...</p>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 dark:text-red-400 text-lg mb-4">
            {error || 'Project not found'}
          </p>
          <button
            onClick={() => router.push(getDashboardRoute())}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const isProjectCompleted = project.status === 'completed';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10 transition-colors">
        <div className="max-w-9xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Back Button */}
          <button
            onClick={() => router.push(getDashboardRoute())}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="font-medium">Back to Dashboard</span>
          </button>

          {/* Project Info */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  {project.name}
                </h1>
                {isProjectCompleted && (
                  <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 rounded-full text-sm font-medium">
                    <CheckCircle2 size={16} />
                    Completed
                  </span>
                )}
              </div>
              {project.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm">
                  {project.description}
                </p>
              )}
              
              {/* Quick Stats */}
              <div className="flex flex-wrap gap-4 mt-4">
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stats.completed} / {stats.total} Completed
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {stats.inProgress} In Progress
                  </span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {project.team?.length || 0} Members
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {isAdmin && !isProjectCompleted && (
                <button
                  onClick={handleMarkComplete}
                  disabled={markingComplete}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {markingComplete ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="font-medium">Completing...</span>
                    </>
                  ) : (
                    <>
                      <Check size={18} />
                      <span className="font-medium">Mark Complete</span>
                    </>
                  )}
                </button>
              )}
              
              {isAdmin && (
                <>
                  <button
                    onClick={() => router.push(`/projects/${projectId}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <Edit size={18} />
                    <span className="font-medium">Edit Project</span>
                  </button>
                  
                  <button
                    onClick={() => setIsModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                  >
                    <Plus size={18} />
                    <span className="font-medium">New Task</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode('board')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'board'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <LayoutGrid size={18} />
              <span>Board</span>
            </button>

            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'table'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <List size={18} />
              <span>Table</span>
            </button>

            <button
              onClick={() => setViewMode('timeline')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                viewMode === 'timeline'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Calendar size={18} />
              <span>Timeline</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-9xl mx-auto">
        {viewMode === 'board' && (
          <KanbanBoard 
            projectId={projectId} 
            onNewTask={() => setIsModalOpen(true)}
          />
        )}
        {viewMode === 'table' && (
          <div className="p-6">
            <TaskTable tasks={tasks} />
          </div>
        )}
        {viewMode === 'timeline' && (
          <div className="p-6">
            <GanttChart tasks={tasks} />
          </div>
        )}
      </div>

      {/* Modal */}
      <ModalNewTask
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        projectId={projectId}
        onSuccess={handleTaskCreated}
      />
    </div>
  );
}