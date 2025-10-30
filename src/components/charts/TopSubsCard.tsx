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
    return <div className="flex items-center justify-center h-full text-gray-500" role="status">No subs to display</div>;
  }

  const getRankLabel = (index: number): string => {
    if (index === 0) return '1st place';
    if (index === 1) return '2nd place';
    if (index === 2) return '3rd place';
    return `${index + 1}th place`;
  };

  return (
    <ul className="space-y-4" role="list" aria-label="Top 5 subs by total tributes">
      {topSubs.map((sub, index) => (
        <li
          key={sub.id}
          className="flex items-center justify-between"
          role="listitem"
          aria-label={`${getRankLabel(index)}: ${sub.name} with $${sub.total.toFixed(2)} total tributes`}
        >
          <div className="flex items-center">
            {index === 0 && <Crown className="h-5 w-5 text-yellow-400 mr-3" aria-hidden="true" />}
            {index === 1 && <div className="w-5 h-5 bg-gray-400 rounded-full mr-3" aria-hidden="true" />}
            {index === 2 && <div className="w-5 h-5 bg-yellow-700 rounded-full mr-3" aria-hidden="true" />}
            {index > 2 && <div className="w-5 text-center mr-3 text-gray-500" aria-hidden="true">{index + 1}</div>}
            <span className="font-medium text-white">{sub.name}</span>
          </div>
          <span className="font-bold text-green-400">${sub.total.toFixed(2)}</span>
        </li>
      ))}
    </ul>
  );
};

// Memoize the component to prevent unnecessary re-renders
export default React.memo(TopSubsCard);