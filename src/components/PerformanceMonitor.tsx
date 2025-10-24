import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { usePerformance } from '@/hooks/use-performance';
import { useMobile } from '@/hooks/use-mobile';
import { 
  Activity, 
  Cpu, 
  HardDrive, 
  Zap, 
  AlertTriangle, 
  CheckCircle,
  TrendingUp,
  TrendingDown
} from 'lucide-react';

const PerformanceMonitor: React.FC = () => {
  const metrics = usePerformance();
  const { isMobile } = useMobile();
  const [isVisible, setIsVisible] = useState(false);

  // Only show in development
  if (process.env.NODE_ENV !== 'production' && !isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 bg-gray-800 border border-gray-700 rounded-lg p-2 text-gray-400 hover:text-white"
      >
        <Activity className="h-4 w-4" />
      </button>
    );
  }

  if (process.env.NODE_ENV === 'production') {
    return null;
  }

  const getPerformanceGrade = (fps: number) => {
    if (fps >= 55) return { grade: 'A', color: 'text-green-400', icon: CheckCircle };
    if (fps >= 45) return { grade: 'B', color: 'text-yellow-400', icon: TrendingUp };
    if (fps >= 30) return { grade: 'C', color: 'text-orange-400', icon: AlertTriangle };
    return { grade: 'D', color: 'text-red-400', icon: TrendingDown };
  };

  const getMemoryStatus = (usage: number) => {
    if (usage < 50) return { status: 'Good', color: 'text-green-400' };
    if (usage < 100) return { status: 'Moderate', color: 'text-yellow-400' };
    if (usage < 200) return { status: 'High', color: 'text-orange-400' };
    return { status: 'Critical', color: 'text-red-400' };
  };

  const fpsGrade = getPerformanceGrade(metrics.fps);
  const memoryStatus = getMemoryStatus(metrics.memoryUsage);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl">
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-gray-200 flex items-center">
              <Activity className="h-4 w-4 mr-2 text-indigo-400" />
              Performance Monitor
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-300"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* FPS */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Zap className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">FPS</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${fpsGrade.color}`}>
                  {metrics.fps}
                </span>
                <Badge variant="outline" className={`text-xs ${fpsGrade.color} border-current`}>
                  {fpsGrade.grade}
                </Badge>
              </div>
            </div>
            <Progress 
              value={(metrics.fps / 60) * 100} 
              className="h-2"
            />
          </div>

          {/* Memory Usage */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <HardDrive className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-300">Memory</span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-300">
                  {metrics.memoryUsage.toFixed(1)} MB
                </span>
                <Badge variant="outline" className={`text-xs ${memoryStatus.color} border-current`}>
                  {memoryStatus.status}
                </Badge>
              </div>
            </div>
            <Progress 
              value={Math.min((metrics.memoryUsage / 200) * 100, 100)} 
              className="h-2"
            />
          </div>

          {/* Load Time */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-300">Load Time</span>
            </div>
            <span className="text-sm font-medium text-gray-300">
              {metrics.loadTime.toFixed(0)}ms
            </span>
          </div>

          {/* Performance Tips */}
          {metrics.fps < 45 && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded p-2">
              <p className="text-xs text-yellow-400">
                ⚠️ Low FPS detected. Consider optimizing animations or reducing component complexity.
              </p>
            </div>
          )}

          {metrics.memoryUsage > 150 && (
            <div className="bg-orange-900/20 border border-orange-700/50 rounded p-2">
              <p className="text-xs text-orange-400">
                ⚠️ High memory usage. Check for memory leaks or large data structures.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMonitor;