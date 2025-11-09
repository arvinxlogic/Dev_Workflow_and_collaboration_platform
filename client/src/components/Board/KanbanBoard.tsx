'use client';

import { useState, useEffect } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import api from '@/lib/axios';
import { Task } from '@/types';
import { Plus, Trash2, Edit2 } from 'lucide-react';

const ITEM_TYPE = 'TASK';

const taskStatus = ['todo', 'in-progress', 'in-review', 'completed'];
const statusLabels: Record<string, string> = {
  'todo': 'To Do',
  'in-progress': 'Work In Progress',
  'in-review': 'Under Review',
  'completed': 'Completed'
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

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    if (onDelete) {
      onDelete(task._id);
    }
  };

  return (
    <div
      ref={drag}
      onClick={() => onTaskClick?.(task)}
      className={`bg-white rounded-lg p-4 mb-3 shadow-sm cursor-move hover:shadow-md transition-shadow relative group ${
        isDragging ? 'opacity-50' : 'opacity-100'
      }`}
    >
      {/* Delete button - shows on hover for admins */}
      {isAdmin && (
        <button
          onClick={handleDelete}
          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
          title="Delete task"
        >
          <Trash2 size={14} />
        </button>
      )}

      <h4 className="font-medium text-sm mb-2 line-clamp-2 pr-8">{task.title}</h4>
      
      {task.description && (
        <p className="text-xs text-gray-600 mb-3 line-clamp-2">{task.description}</p>
      )}

      <div className="flex items-center justify-between">
        <span className={`text-xs px-2 py-1 rounded ${priorityColors[task.priority]}`}>
          {task.priority}
        </span>

        {task.assignedTo && (
          <div className="flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
              {task.assignedTo.name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      {task.tags && task.tags.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {task.tags.map((tag, index) => (
            <span key={index} className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
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

  const columnColors: Record<string, string> = {
    'todo': 'bg-gray-200',
    'in-progress': 'bg-blue-200',
    'in-review': 'bg-yellow-200',
    'completed': 'bg-green-200'
  };

  return (
    <div
      ref={drop}
      className={`flex flex-col bg-gray-50 rounded-lg p-4 min-h-[500px] ${
        isOver ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${columnColors[status]}`}></div>
          <h3 className="font-semibold text-sm">{statusLabels[status]}</h3>
          <span className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        
        {isAdmin && status === 'todo' && (
          <button
            onClick={onNewTask}
            className="p-1 hover:bg-gray-200 rounded transition-colors"
            title="Add task"
          >
            <Plus size={18} />
          </button>
        )}
      </div>

      <div className="flex-1 space-y-2">
        {tasks.map((task) => (
          <TaskCard 
            key={task._id} 
            task={task} 
            onTaskClick={onTaskClick}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        ))}
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
    // Get current user from localStorage
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
    // Check if user is admin
    if (currentUser?.role !== 'admin') {
      alert('Only admins can move tasks');
      return;
    }

    // Optimistic update
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
      // Revert on error
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
      <div className="flex justify-center items-center p-8 min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={fetchTasks}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="p-6 bg-gray-100 min-h-screen">
        {/* Role indicator */}
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {isAdmin ? '👑 Admin' : '👤 User'} - {currentUser?.name}
            </span>
          </div>
          
          {!isAdmin && (
            <div className="text-sm text-gray-600">
              ℹ️ View-only mode. Only admins can create/edit/delete tasks.
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
    </DndProvider>
  );
}
