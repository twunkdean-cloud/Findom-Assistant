import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useOffline } from '@/hooks/use-offline';
import { Wifi, WifiOff, AlertCircle, CheckCircle } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { isOffline, queue } = useOffline();

  if (!isOffline && queue.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-20 left-4 z-40">
      <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-lg">
        <div className="flex items-center space-x-2">
          {isOffline ? (
            <>
              <WifiOff className="h-4 w-4 text-red-400" />
              <Badge variant="destructive" className="text-xs">
                Offline
              </Badge>
            </>
          ) : queue.length > 0 ? (
            <>
              <AlertCircle className="h-4 w-4 text-yellow-400" />
              <Badge variant="outline" className="text-xs text-yellow-400 border-yellow-400">
                Syncing {queue.length}
              </Badge>
            </>
          ) : (
            <>
              <CheckCircle className="h-4 w-4 text-green-400" />
              <Badge variant="outline" className="text-xs text-green-400 border-green-400">
                Online
              </Badge>
            </>
          )}
        </div>
        
        {queue.length > 0 && (
          <p className="text-xs text-gray-400 mt-2">
            {queue.length} action{queue.length !== 1 ? 's' : ''} queued
          </p>
        )}
      </div>
    </div>
  );
};

export default OfflineIndicator;