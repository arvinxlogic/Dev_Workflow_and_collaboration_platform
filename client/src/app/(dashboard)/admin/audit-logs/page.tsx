'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/axios';
import { FileText, Filter, Download } from 'lucide-react';
import { format } from 'date-fns';

interface AuditLog {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  action: string;
  entity: string;
  entityId?: string;
  ipAddress?: string;
  createdAt: string;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    entity: '',
    action: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    total: 0,
    pages: 0,
    page: 1
  });

  // Check user role once on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [router]);

  // Fetch logs when filters change
  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.entity) params.append('entity', filters.entity);
      if (filters.action) params.append('action', filters.action);
      params.append('page', filters.page.toString());

      const { data } = await api.get(`/audit-logs?${params.toString()}`);
      setLogs(data.logs);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Safe updateFilters to avoid redundant state updates
  const updateFilters = (newFilters: Partial<typeof filters>) => {
    setFilters(prev => {
      const merged = { ...prev, ...newFilters };
      if (
        prev.entity === merged.entity &&
        prev.action === merged.action &&
        prev.page === merged.page
      ) {
        return prev;
      }
      return merged;
    });
  };

  const handleExport = () => {
    const csv = [
      ['Date', 'User', 'Action', 'Entity', 'IP Address'],
      ...logs.map(log => [
        format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        log.user.name,
        log.action,
        log.entity,
        log.ipAddress || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400"></div>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-9xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <FileText className="text-blue-600 dark:text-blue-400" size={32} />
              <div>
                <h1 className="text-2xl font-bold">Audit Logs</h1>
                <p className="text-gray-600 dark:text-gray-400 text-sm">Track all system activities</p>
              </div>
            </div>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Download size={18} />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-9xl mx-auto p-6">
        {/* Filters */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center gap-4">
            <Filter size={20} className="text-gray-400 dark:text-gray-500" />
            <select
              value={filters.entity}
              onChange={(e) => updateFilters({ entity: e.target.value, page: 1 })}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Entities</option>
              <option value="user">User</option>
              <option value="project">Project</option>
              <option value="task">Task</option>
              <option value="team">Team</option>
            </select>
            <select
              value={filters.action}
              onChange={(e) => updateFilters({ action: e.target.value, page: 1 })}
              className="px-3 py-2 border rounded-lg bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100"
            >
              <option value="">All Actions</option>
              <option value="CREATE">Create</option>
              <option value="UPDATE">Update</option>
              <option value="DELETE">Delete</option>
              <option value="LOGIN">Login</option>
            </select>
          </div>
        </div>

        {/* Logs Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Action</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">Entity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {logs.map((log) => (
                <tr key={log._id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">
                    {format(new Date(log.createdAt), 'MMM dd, yyyy HH:mm:ss')}
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium">{log.user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{log.user.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.action === 'CREATE' ? 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300' :
                      log.action === 'UPDATE' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                      log.action === 'DELETE' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
                      'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm capitalize">{log.entity}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-400">{log.ipAddress || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={() => updateFilters({ page: Math.max(filters.page - 1, 1) })}
              disabled={filters.page === 1}
              className="px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <span className="text-sm text-gray-700 dark:text-gray-300">
              Page {pagination.page} of {pagination.pages}
            </span>
            <button
              onClick={() => updateFilters({ page: Math.min(filters.page + 1, pagination.pages) })}
              disabled={filters.page === pagination.pages}
              className="px-3 py-1 border rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
