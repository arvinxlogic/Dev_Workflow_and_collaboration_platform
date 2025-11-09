'use client';

import { useEffect, useRef } from 'react';
import { Task } from '@/types';
import { format } from 'date-fns';

interface Props {
  tasks: Task[];
  viewMode?: 'Day' | 'Week' | 'Month';
}

export default function GanttChart({ tasks, viewMode = 'Week' }: Props) {
  const ganttRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ganttRef.current) return;

    // For now, show a simple list view
    // We'll add proper Gantt chart library later
    renderSimpleTimeline();
  }, [tasks, viewMode]);

  const renderSimpleTimeline = () => {
    if (!ganttRef.current) return;

    const tasksWithDates = tasks.filter(task => task.dueDate);

    if (tasksWithDates.length === 0) {
      ganttRef.current.innerHTML = `
        <div class="text-center py-12 text-gray-600 dark:text-gray-400">
          <p class="text-lg mb-2">No tasks with due dates</p>
          <p class="text-sm">Add due dates to tasks to see them in timeline view</p>
        </div>
      `;
      return;
    }

    const html = tasksWithDates.map(task => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : new Date();
      const createdDate = new Date(task.createdAt);
      const daysLeft = Math.ceil((dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
      
      let statusColor = 'bg-gray-200';
      let progressWidth = '0%';
      
      switch(task.status) {
        case 'completed':
          statusColor = 'bg-green-500';
          progressWidth = '100%';
          break;
        case 'in-review':
          statusColor = 'bg-yellow-500';
          progressWidth = '75%';
          break;
        case 'in-progress':
          statusColor = 'bg-blue-500';
          progressWidth = '50%';
          break;
        default:
          statusColor = 'bg-gray-300';
          progressWidth = '10%';
      }

      return `
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-4 hover:shadow-md transition-shadow">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="font-semibold text-gray-900 dark:text-white mb-1">${task.title}</h3>
              ${task.description ? `<p class="text-sm text-gray-600 dark:text-gray-300">${task.description}</p>` : ''}
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-medium ${
              task.priority === 'urgent' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
              task.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
              task.priority === 'medium' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
            }">
              ${task.priority.toUpperCase()}
            </span>
          </div>
          
          <div class="space-y-2">
            <div class="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>Created: ${format(createdDate, 'MMM dd, yyyy')}</span>
              <span>Due: ${format(dueDate, 'MMM dd, yyyy')}</span>
            </div>
            
            <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div class="${statusColor} h-2 rounded-full transition-all duration-300" style="width: ${progressWidth}"></div>
            </div>
            
            <div class="flex items-center justify-between text-sm">
              <span class="text-gray-600 dark:text-gray-300">Status: <span class="font-medium capitalize">${task.status.replace('-', ' ')}</span></span>
              <span class="${daysLeft < 0 ? 'text-red-600 dark:text-red-400' : daysLeft < 3 ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'} font-medium">
                ${daysLeft < 0 ? `${Math.abs(daysLeft)} days overdue` : `${daysLeft} days left`}
              </span>
            </div>
            
            ${task.assignedTo ? `
              <div class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 pt-2 border-t border-gray-200 dark:border-gray-700">
                <div class="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                  ${task.assignedTo.name.charAt(0).toUpperCase()}
                </div>
                <span>Assigned to: ${task.assignedTo.name}</span>
              </div>
            ` : ''}
          </div>
        </div>
      `;
    }).join('');

    ganttRef.current.innerHTML = `
      <div class="space-y-4">
        <div class="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
          <p class="text-blue-800 dark:text-blue-300 text-sm">
            Timeline View - Showing ${tasksWithDates.length} task${tasksWithDates.length === 1 ? '' : 's'} with due dates
          </p>
        </div>
        ${html}
      </div>
    `;
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6">
      <div ref={ganttRef} className="min-h-[200px]">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading timeline...</p>
        </div>
      </div>
    </div>
  );
}
