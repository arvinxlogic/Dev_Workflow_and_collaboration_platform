'use client';

import { Trophy, TrendingUp } from 'lucide-react';

interface Contributor {
  _id: string;
  name: string;
  email: string;
  completedTasks: number;
}

interface Props {
  contributors: Contributor[];
}

export default function TopContributors({ contributors }: Props) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="text-yellow-500" size={24} />
        <h3 className="text-lg font-semibold">Top Contributors</h3>
      </div>
      
      <div className="space-y-4">
        {contributors.map((contributor, index) => (
          <div key={contributor._id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                ${index === 0 ? 'bg-yellow-100 text-yellow-700' : ''}
                ${index === 1 ? 'bg-gray-100 text-gray-700' : ''}
                ${index === 2 ? 'bg-orange-100 text-orange-700' : ''}
                ${index > 2 ? 'bg-blue-100 text-blue-700' : ''}
              `}>
                #{index + 1}
              </div>
              
              <div>
                <p className="font-medium text-sm">{contributor.name}</p>
                <p className="text-xs text-gray-500">{contributor.email}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <TrendingUp size={16} className="text-green-500" />
              <span className="font-semibold text-sm">{contributor.completedTasks} tasks</span>
            </div>
          </div>
        ))}
        
        {contributors.length === 0 && (
          <p className="text-center text-gray-500 py-8">No data available</p>
        )}
      </div>
    </div>
  );
}
