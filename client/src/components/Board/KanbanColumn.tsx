'use client';

import { useState, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, arrayMove } from '@dnd-kit/sortable';
import api from '@/lib/axios';
import { Task } from '@/types';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';

interface Column {
  id: string;
  title: string;
  color: string;
}

const COLUMNS: Column[] = [
  { id: 'todo', title: 'To Do', color: 'bg-gray-200' },
  { id: 'in-progress', title: 'In Progress', color: 'bg-blue-200' },
  { id: 'in-review', title: 'In Review', color: 'bg-yellow-200' },
  { id: 'completed', title: 'Completed', color: 'bg-green-200' },
];

interface Props {
  projectId?: string;
}

export default function KanbanBoard({ projectId }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    fetchTasks();
  }, [projectId]);

  const fetchTasks = async () => {
    try {
      const params = projectId ? { projectId } : {};
      const { data } = await api.get('/tasks', { params });
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t._id === active.id);
    setActiveTask(task || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const activeTask = tasks.find((t) => t._id === activeId);
    const overTask = tasks.find((t) => t._id === overId);

    if (!activeTask) return;

    // Dropping over a column
    const isOverColumn = COLUMNS.some((col) => col.id === overId);
    if (isOverColumn) {
      setTasks((tasks) => {
        return tasks.map((task) =>
          task._id === activeId
            ? { ...task, status: overId as Task['status'] }
            : task
        );
      });
      return;
    }

    // Dropping over a task
    if (overTask && activeTask.status !== overTask.status) {
      setTasks((tasks) => {
        return tasks.map((task) =>
          task._id === activeId
            ? { ...task, status: overTask.status }
            : task
        );
      });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const activeTask = tasks.find((t) => t._id === activeId);
    if (!activeTask) return;

    // Update task order in backend
    const updatedTasks = tasks.map((task, index) => ({
      id: task._id,
      order: index,
      status: task.status,
    }));

    try {
      await api.put('/tasks/reorder', { tasks: updatedTasks });
    } catch (error) {
      console.error('Error updating task order:', error);
      fetchTasks(); // Refetch on error
    }
  };

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status);
  };

  if (loading) {
    return <div className="flex justify-center p-8">Loading...</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {COLUMNS.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              tasks={getTasksByStatus(column.id)}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
