import React, { useEffect, useState } from 'react';
import { usePerformance } from '@/hooks/use-performance';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity, Clock, Zap } from 'lucide-react';

interface PerformanceMonitorProps {
  componentName: string;
  enabled?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  componentName, 
  enabled = process.env.NODE_ENV === 'development' 
}) => {
  const { getMetrics, renderCount } = usePerformance(componentName);
  const [metrics, setMetrics] = useState(getMetrics());

  useEffect(() => {
    if (!enabled) return;

    const interval = setInterval(() => {
      setMetrics(getMetrics());
    }, 1000);

    return () => clearInterval(interval);
  }, [enabled, getMetrics]);

  if (!enabled) {
    return null;
  }

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-sm">
          <Activity className="mr-2 h-4 w-4 text-indigo-400" />
          Performance: {componentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Render Time</span>
          <Badge variant="outline" className="text-xs">
            <Clock className="mr-1 h-3 w-3" />
            {metrics.renderTime}ms
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Render Count</span>
          <Badge variant="outline" className="text-xs">
            <Zap className="mr-1 h-3 w-3" />
            {renderCount}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMonitor;