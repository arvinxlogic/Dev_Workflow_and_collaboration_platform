'use client';

import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
} from '@tanstack/react-table';
import { Task } from '@/types';
import { 
  ChevronDown, 
  ChevronUp, 
  ChevronsUpDown, 
  Search,
  Calendar,
  User as UserIcon
} from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function TaskTable({ tasks, onTaskClick }: Props) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const priorityColors = {
    low: 'bg-gray-100 text-gray-700',
    medium: 'bg-blue-100 text-blue-700',
    high: 'bg-orange-100 text-orange-700',
    urgent: 'bg-red-100 text-red-700',
  };

  const statusColors = {
    'todo': 'bg-gray-200 text-gray-800',
    'in-progress': 'bg-blue-200 text-blue-800',
    'in-review': 'bg-yellow-200 text-yellow-800',
    'completed': 'bg-green-200 text-green-800',
  };

  const columns = useMemo<ColumnDef<Task>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Task',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="font-medium text-sm">{row.original.title}</span>
            {row.original.description && (
              <span className="text-xs text-gray-500 truncate max-w-md dark:text-gray-400">
                {row.original.description}
              </span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[row.original.status]}`}>
            {row.original.status.replace('-', ' ').toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[row.original.priority]}`}>
            {row.original.priority.toUpperCase()}
          </span>
        ),
      },
      {
        accessorKey: 'assignedTo',
        header: 'Assigned To',
        cell: ({ row }) => (
          <div className="flex items-center gap-2">
            {row.original.assignedTo ? (
              <>
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                  {row.original.assignedTo.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm">{row.original.assignedTo.name}</span>
              </>
            ) : (
              <span className="text-gray-400 text-sm">Unassigned</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'project',
        header: 'Project',
        cell: ({ row }) => (
          <span className="text-sm text-gray-700 dark:text-gray-300">
            {row.original.project?.name || 'N/A'}
          </span>
        ),
      },
      {
        accessorKey: 'dueDate',
        header: 'Due Date',
        cell: ({ row }) => (
          <div className="flex items-center gap-1 text-sm text-gray-700 dark:text-gray-400">
            {row.original.dueDate ? (
              <>
                <Calendar size={14} className="text-gray-500 dark:text-gray-400" />
                <span>{format(new Date(row.original.dueDate), 'MMM dd, yyyy')}</span>
              </>
            ) : (
              <span className="text-gray-400 dark:text-gray-600">No due date</span>
            )}
          </div>
        ),
      },
      {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => (
          <div className="flex flex-wrap gap-1">
            {row.original.tags?.slice(0, 2).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs dark:bg-purple-900 dark:text-purple-300">
                {tag}
              </span>
            ))}
            {row.original.tags?.length > 2 && (
              <span className="text-xs text-gray-500 dark:text-gray-400">+{row.original.tags.length - 2}</span>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const table = useReactTable({
    data: tasks,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Search */}
      <div className="flex items-center gap-2 bg-white p-4 rounded-lg shadow-sm dark:bg-gray-800">
        <Search size={20} className="text-gray-400 dark:text-gray-500" />
        <input
          type="text"
          placeholder="Search tasks..."
          value={globalFilter ?? ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="flex-1 outline-none text-sm bg-transparent text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b dark:bg-gray-700 dark:border-gray-600">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400"
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={`flex items-center gap-2 ${
                            header.column.getCanSort() ? 'cursor-pointer select-none' : ''
                          }`}
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {header.column.getCanSort() && (
                            <span>
                              {header.column.getIsSorted() === 'asc' ? (
                                <ChevronUp size={16} />
                              ) : header.column.getIsSorted() === 'desc' ? (
                                <ChevronDown size={16} />
                              ) : (
                                <ChevronsUpDown size={16} className="text-gray-400 dark:text-gray-500" />
                              )}
                            </span>
                          )}
                        </div>
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800 dark:divide-gray-700">
              {table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  onClick={() => onTaskClick?.(row.original)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors dark:hover:bg-gray-700"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-6 py-4 whitespace-nowrap">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t dark:border-gray-700">
          <div className="flex items-center gap-2">
            <button
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm dark:hover:bg-gray-700"
            >
              Previous
            </button>
            <button
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm dark:hover:bg-gray-700"
            >
              Next
            </button>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
        </div>
      </div>
    </div>
  );
}
