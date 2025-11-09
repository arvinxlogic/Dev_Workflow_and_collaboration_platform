'use client';

import { format } from 'date-fns';
import { Clock, User, Edit, Trash2, Plus, CheckCircle } from 'lucide-react';

interface Activity {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  action: string;
  entity: string;
  createdAt: string;
}

interface Props {
  activities: Activity[];
}

const ACTION_ICONS: Record<string, any> = {
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
  COMPLETE_TASK: CheckCircle,
  LOGIN: User
};

const ACTION_COLORS: Record<string, string> = {
  CREATE: 'text-green-600 bg-green-50',
  UPDATE: 'text-blue-600 bg-blue-50',
  DELETE: 'text-red-600 bg-red-50',
  COMPLETE_TASK: 'text-purple-600 bg-purple-50',
  LOGIN: 'text-gray-600 bg-gray-50'
};

export default function RecentActivity({ activities }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
      
      <div className="space-y-4">
        {activities.map((activity) => {
          const Icon = ACTION_ICONS[activity.action] || Clock;
          const colorClass = ACTION_COLORS[activity.action] || 'text-gray-600 bg-gray-50';
          
          return (
            <div key={activity._id} className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon size={20} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  {activity.user.name} {activity.action.toLowerCase().replace('_', ' ')} a {activity.entity}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(activity.createdAt), 'MMM dd, yyyy HH:mm')}
                </p>
              </div>
            </div>
          );
        })}
        
        {activities.length === 0 && (
          <p className="text-center text-gray-500 py-8">No recent activity</p>
        )}
      </div>
    </div>
  );
}
