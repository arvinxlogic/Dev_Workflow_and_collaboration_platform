'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { Task, Project } from '@/types';
import KanbanBoard from '@/components/Board/KanbanBoard';
import TaskTable from '@/components/Table/TaskTable';
import GanttChart from '@/components/Timeline/GanttChart';
import ModalNewTask from '@/components/Modal/ModalNewTask';
import { LayoutGrid, List, Calendar, ArrowLeft } from 'lucide-react';

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

useEffect(() => {
  const userStr = localStorage.getItem('user');
  if (userStr) {
    setCurrentUser(JSON.parse(userStr));
  }
  // ... rest of existing useEffect
}, [projectId]);

const isAdmin = currentUser?.role === 'admin';

  useEffect(() => {
    if (projectId) {
      fetchProjectData();
    }
  }, [projectId]);

  const fetchProjectData = async () => {
    try {
      const [projectRes, tasksRes] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/tasks?projectId=${projectId}`)
      ]);
      
      setProject(projectRes.data);
      setTasks(tasksRes.data);
      setError('');
    } catch (error: any) {
      console.error('Error:', error);
      setError('Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskCreated = () => {
    setIsModalOpen(false);
    fetchProjectData(); // Refresh data
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Project not found'}</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3"
          >
            <ArrowLeft size={20} />
            <span>Back</span>
          </button>

         <div className="flex items-center justify-between">
  <div>
    <h1 className="text-2xl font-bold">{project.name}</h1>
    {project.description && (
      <p className="text-gray-600 text-sm mt-1">{project.description}</p>
    )}
  </div>

  <div className="flex items-center gap-2">
    {/* View Buttons */}
    <button
      onClick={() => setViewMode('board')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        viewMode === 'board'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <LayoutGrid size={18} />
      <span>Board</span>
    </button>

    <button
      onClick={() => setViewMode('table')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        viewMode === 'table'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <List size={18} />
      <span>Table</span>
    </button>

    <button
      onClick={() => setViewMode('timeline')}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
        viewMode === 'timeline'
          ? 'bg-blue-600 text-white'
          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
      }`}
    >
      <Calendar size={18} />
      <span>Timeline</span>
    </button>
  </div>
</div>

        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto">
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
