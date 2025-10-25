import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/hooks/use-performance';
import { Activity, Clock, Zap } from 'lucide-react';

interface PerformanceData {
  renderTime: number;
  reRenderCount: number;
  memoryUsage?: number;
}

export const PerformanceMonitor: React.FC<{ componentName: string }> = ({ componentName }) => {
  const { getMetrics } = usePerformance(componentName);
  const [performanceData, setPerformanceData] = useState<PerformanceData>({
    renderTime: 0,
    reRenderCount: 0
  });

  useEffect(() => {
    const metrics = getMetrics();
    setPerformanceData(metrics);
  }, [getMetrics]);

  const getPerformanceColor = (renderTime: number) => {
    if (renderTime < 16) return 'text-green-600';
    if (renderTime < 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPerformanceBadge = (renderTime: number) => {
    if (renderTime < 16) return 'Good';
    if (renderTime < 50) return 'Slow';
    return 'Poor';
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="fixed bottom-4 right-4 w-64 z-50 bg-background/95 backdrop-blur">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance: {componentName}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-1">
            <Clock className="h-3 w-3" />
            Render Time
          </span>
          <span className={`text-xs font-medium ${getPerformanceColor(performanceData.renderTime)}`}>
            {performanceData.renderTime.toFixed(2)}ms
          </span>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Performance
          </span>
          <Badge variant={performanceData.renderTime < 16 ? 'default' : 'destructive'} className="text-xs">
            {getPerformanceBadge(performanceData.renderTime)}
          </Badge>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-xs">Re-renders</span>
          <span className="text-xs font-medium">{performanceData.reRenderCount}</span>
        </div>
      </CardContent>
    </Card>
  );
};