import React, { useMemo } from 'react';
import { Sub } from '@/types';
import { Crown } from 'lucide-react';

interface TopSubsCardProps {
  subs: Sub[];
}

const TopSubsCard: React.FC<TopSubsCardProps> = ({ subs }) => {
  // Memoize the sorting operation to prevent unnecessary re-computations
  const topSubs = useMemo(() =>
    [...subs]
      .sort((a, b) => b.total - a.total)
      .slice(0, 5),
    [subs]
  );

  if (topSubs.length === 0) {
    return <div className="flex items-center justify-center h-full text-gray-500">No subs to display</div>;
  }

  return (
    <div className="space-y-4">
      {topSubs.map((sub, index) => (
        <div key={sub.id} className="flex items-center justify-between">
          <div className="flex items-center">
            {index === 0 && <Crown className="h-5 w-5 text-yellow-400 mr-3" />}
            {index === 1 && <div className="w-5 h-5 bg-gray-400 rounded-full mr-3" />}
            {index === 2 && <div className="w-5 h-5 bg-yellow-700 rounded-full mr-3" />}
            {index > 2 && <div className="w-5 text-center mr-3 text-gray-500">{index + 1}</div>}
            <span className="font-medium text-white">{sub.name}</span>
          </div>
          <span className="font-bold text-green-400">${sub.total.toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(TopSubsCard);