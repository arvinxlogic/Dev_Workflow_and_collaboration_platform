'use client';

import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

interface Props {
  tasksByStatus: Record<string, number>;
  tasksByPriority: Record<string, number>;
}

export default function Charts({ tasksByStatus, tasksByPriority }: Props) {
  // Transform data for charts
  const statusData = Object.entries(tasksByStatus).map(([name, value]) => ({
    name: name.replace('-', ' ').toUpperCase(),
    value
  }));

  const priorityData = Object.entries(tasksByPriority).map(([name, value]) => ({
    name: name.toUpperCase(),
    value
  }));

  const STATUS_COLORS = {
    'TODO': '#6b7280',
    'IN PROGRESS': '#3b82f6',
    'IN REVIEW': '#fbbf24',
    'COMPLETED': '#10b981'
  };

  const PRIORITY_COLORS = {
    'LOW': '#6b7280',
    'MEDIUM': '#3b82f6',
    'HIGH': '#f97316',
    'URGENT': '#ef4444'
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Tasks by Status - Pie Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Tasks by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {statusData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tasks by Priority - Bar Chart */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Tasks by Priority</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={priorityData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#8884d8">
              {priorityData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name as keyof typeof PRIORITY_COLORS]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
