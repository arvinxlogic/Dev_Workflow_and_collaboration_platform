'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from '@/lib/axios';
import { Task } from '@/types';
import { Plus, Trash2, Calendar, User as UserIcon, AlertCircle, GripVertical, Clipboard, Rocket, Eye, CheckCircle } from 'lucide-react';

const ITEM_TYPE = 'TASK';
const taskStatus = ['todo', 'in-progress', 'in-review', 'completed'];

const statusLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'In Progress',
  'in-review': 'In Review',
  'completed': 'Completed'
};

const statusConfig: Record<string, { bg: string; border: string; icon: JSX.Element }> = {
  'todo': { 
    bg: 'from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800', 
    border: 'border-slate-300 dark:border-slate-600',
    icon: <Clipboard className="w-5 h-5 text-gray-500 dark:text-gray-400" />
  },
  'in-progress': { 
    bg: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900', 
    border: 'border-blue-300 dark:border-blue-600',
    icon: <Rocket className="w-5 h-5 text-blue-500 dark:text-blue-400" />
  },
  'in-review': { 
    bg: 'from-amber-50 to-amber-100 dark:from-amber-950 dark:to-amber-900', 
    border: 'border-amber-300 dark:border-amber-600',
    icon: <Eye className="w-5 h-5 text-amber-500 dark:text-amber-400" />
  },
  'completed': { 
    bg: 'from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900', 
    border: 'border-emerald-300 dark:border-emerald-600',
    icon: <CheckCircle className="w-5 h-5 text-emerald-500 dark:text-emerald-400" />
  }
};

interface BoardProps {
  projectId: string;
  onNewTask: () => void;
}

interface TaskCardProps {
  task: Task;
  onTaskClick?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isAdmin: boolean;
}

const TaskCard = ({ task, onTaskClick, onDelete, isAdmin }: TaskCardProps) => {
  const [{ isDragging }, drag] = useDrag({
    type: ITEM_TYPE,
    item: { id: task._id, status: task.status },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const priorityStyles = {
    low: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:border-slate-600',
    medium: 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-700',
    high: 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-900 dark:text-amber-300 dark:border-amber-700',
    urgent: 'bg-red-100 text-red-700 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-700',
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Delete this task?')) return;
    if (onDelete) onDelete(task._id);
  };

  return (
    <div
      ref={drag}
      onClick={() => onTaskClick?.(task)}
      className={`group relative bg-white dark:bg-gray-800 rounded-xl p-4 mb-3 border-2 border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer ${
        isDragging ? 'opacity-40 scale-95 rotate-2' : 'opacity-100 hover:-translate-y-1'
      }`}
    >
      {/* Drag Handle */}
      <div className="absolute left-2 top-2 opacity-0 group-hover:opacity-40 transition-opacity">
        <GripVertical className="w-4 h-4 text-gray-400" />
      </div>

      {/* Delete Button */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/30"
        >
          <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        </button>
      )}

      {/* Title */}
      <h4 className="font-semibold text-gray-900 dark:text-white mb-2 pr-8 text-sm leading-tight">
        {task.title}
      </h4>

      {/* Description */}
      {task.description && (
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* Priority Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-xs px-2.5 py-1 rounded-md font-medium border ${priorityStyles[task.priority]}`}>
          {task.priority.toUpperCase()}
        </span>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        {/* Assignee */}
        {task.assignedTo && (
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shadow-sm">
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </div>
            <span className="text-xs text-gray-700 dark:text-gray-300 font-medium truncate max-w-[80px]">
              {task.assignedTo.name.split(' ')[0]}
            </span>
          </div>
        )}

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}
      </div>

      {/* Tags */}
      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {task.tags.slice(0, 2).map((tag, index) => (
            <span
              key={index}
              className="text-xs px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 font-medium"
            >
              #{tag}
            </span>
          ))}
          {task.tags.length > 2 && (
            <span className="text-xs text-gray-400 dark:text-gray-500">+{task.tags.length - 2}</span>
          )}
        </div>
      )}
    </div>
  );
};

interface ColumnProps {
  status: string;
  tasks: Task[];
  moveTask: (taskId: string, toStatus: string) => void;
  onNewTask: () => void;
  onTaskClick?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  isAdmin: boolean;
}

const TaskColumn = ({ status, tasks, moveTask, onNewTask, onTaskClick, onDelete, isAdmin }: ColumnProps) => {
  const [{ isOver }, drop] = useDrop({
    accept: ITEM_TYPE,
    drop: (item: { id: string; status: string }) => {
      if (item.status !== status) {
        moveTask(item.id, status);
      }
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  const config = statusConfig[status];

  return (
    <div
      ref={drop}
      className={`relative flex flex-col rounded-2xl border-2 ${config.border} bg-gradient-to-b ${config.bg} p-4 min-h-[600px] transition-all ${
        isOver ? 'ring-4 ring-blue-400 ring-opacity-50 scale-[1.02]' : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b-2 border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{config.icon}</span>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">
              {statusLabels[status]}
            </h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
        </div>
        
        {isAdmin && status === 'todo' && (
          <button
            onClick={onNewTask}
            className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-all hover:scale-110 shadow-md"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tasks */}
      <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
        {tasks.map((task) => (
          <TaskCard
            key={task._id}
            task={task}
            onTaskClick={onTaskClick}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
        
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="text-4xl mb-3 opacity-20">{config.icon}</div>
            <p className="text-sm text-gray-400 dark:text-gray-600 font-medium">
              No tasks yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default function KanbanBoard({ projectId, onNewTask }: BoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      setCurrentUser(JSON.parse(userStr));
    }
    if (projectId) {
      fetchTasks();
    }
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const { data } = await api.get(`/tasks?projectId=${projectId}`);
      setTasks(data);
      setError('');
    } catch (error: any) {
      console.error('Error fetching tasks:', error);
      setError('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const moveTask = async (taskId: string, toStatus: string) => {
    if (currentUser?.role !== 'admin') {
      alert('Only admins can move tasks');
      return;
    }

    setTasks((prevTasks) =>
      prevTasks.map((task) =>
        task._id === taskId ? { ...task, status: toStatus as any } : task
      )
    );

    try {
      await api.put(`/tasks/${taskId}`, { status: toStatus });
    } catch (error: any) {
      console.error('Error updating task:', error);
      alert(error.response?.data?.message || 'Failed to update task');
      fetchTasks();
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      await api.delete(`/tasks/${taskId}`);
      setTasks(tasks.filter(task => task._id !== taskId));
    } catch (error: any) {
      console.error('Error deleting task:', error);
      alert(error.response?.data?.message || 'Failed to delete task');
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  const isAdmin = currentUser?.role === 'admin';

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <AlertCircle className="w-16 h-16 text-red-500" />
        <p className="text-red-600 dark:text-red-400 text-lg">{error}</p>
        <button
          onClick={fetchTasks}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {taskStatus.map((status) => (
            <TaskColumn
              key={status}
              status={status}
              tasks={getTasksByStatus(status)}
              moveTask={moveTask}
              onNewTask={onNewTask}
              onDelete={handleDeleteTask}
              isAdmin={isAdmin}
            />
          ))}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #475569;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }
      `}</style>
    </DndProvider>
  );
}
