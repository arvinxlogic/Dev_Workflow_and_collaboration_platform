'use client';

import { 
  BarChart3, 
  CheckCircle2, 
  Clock, 
  FolderKanban, 
  AlertCircle 
} from 'lucide-react';

interface Props {
  stats: {
    overview: {
      totalProjects: number;
      activeProjects: number;
      totalTasks: number;
      overdueTasks: number;
    };
    tasksByStatus: Record<string, number>;
    tasksByPriority: Record<string, number>;
  };
}

export default function DashboardStats({ stats }: Props) {
  const cards = [
    {
      title: 'Total Projects',
      value: stats.overview.totalProjects,
      icon: FolderKanban,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Active Projects',
      value: stats.overview.activeProjects,
      icon: BarChart3,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Tasks',
      value: stats.overview.totalTasks,
      icon: CheckCircle2,
      color: 'bg-purple-500',
      change: '+23%'
    },
    {
      title: 'Overdue Tasks',
      value: stats.overview.overdueTasks,
      icon: AlertCircle,
      color: 'bg-red-500',
      change: '-5%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div key={card.title} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.color} p-3 rounded-lg`}>
                <Icon className="text-white" size={24} />
              </div>
              <span className="text-sm text-green-600 font-medium">{card.change}</span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium mb-1">{card.title}</h3>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        );
      })}
    </div>
  );
}
