import React from 'react';
import { useOffline } from '@/hooks/use-offline';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff } from 'lucide-react';

const OfflineIndicator: React.FC = () => {
  const { isOnline, isOffline } = useOffline();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      <Badge variant="destructive" className="flex items-center gap-2">
        <WifiOff className="h-4 w-4" />
        Offline Mode
      </Badge>
    </div>
  );
};

export default OfflineIndicator;