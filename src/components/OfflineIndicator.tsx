import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useOffline } from '@/hooks/use-offline';
import { WifiOff, Wifi } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const { isOffline } = useOffline();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="fixed top-4 left-4 z-50">
      <Badge variant="destructive" className="flex items-center gap-2">
        <WifiOff className="h-3 w-3" />
        Offline Mode
      </Badge>
    </div>
  );
};