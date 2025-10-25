import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useFindom } from '@/context/FindomContext';
import { useMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Users, 
  TrendingUp, 
  Calendar,
  Brain,
  MessageSquare,
  Crown,
  Activity
} from 'lucide-react';
import { LazyWrapper } from '@/utils/lazy-loading';

// Lazy load dashboard components
import {
  LazyTributeChart,
  LazyAIInsightsDashboard
} from '@/components/lazy';

const DashboardPage: React.FC = () => {
  const { appData } = useFindom();
  const { isMobile } = useMobile();

  const totalTributes = appData.tributes.reduce((sum, tribute) => sum + tribute.amount, 0);
  const activeSubs = appData.subs.filter(sub => sub.lastTribute && 
    new Date(sub.lastTribute) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  ).length;

  const handleExportData = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'findom-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported successfully');
  };

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: string;
    color?: string;
  }> = ({ title, value, icon, trend, color = 'text-blue-600' }) => (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend && (
              <p className="text-sm text-green-600 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                {trend}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-full bg-muted ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isMobile) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <Button variant="outline" size="sm" onClick={handleExportData}>
            Export Data
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <StatCard
            title="Total Tributes"
            value={`$${totalTributes.toFixed(2)}`}
            icon={<DollarSign className="h-6 w-6" />}
            trend="+12% from last month"
          />
          <StatCard
            title="Active Subs"
            value={activeSubs}
            icon={<Users className="h-6 w-6" />}
            trend="+3 this week"
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-blue-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {appData.tributes.slice(0, 3).map((tribute, index) => (
                <div key={tribute.id} className="flex items-center justify-between p-3 bg-muted rounded">
                  <div>
                    <p className="font-medium">{tribute.fromSub}</p>
                    <p className="text-sm text-muted-foreground">{tribute.reason}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${tribute.amount}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(tribute.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <LazyWrapper>
          <LazyTributeChart />
        </LazyWrapper>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportData}>
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Tributes"
          value={`$${totalTributes.toFixed(2)}`}
          icon={<DollarSign className="h-6 w-6" />}
          trend="+12% from last month"
        />
        <StatCard
          title="Active Subs"
          value={activeSubs}
          icon={<Users className="h-6 w-6" />}
          trend="+3 this week"
          color="text-green-600"
        />
        <StatCard
          title="Total Subs"
          value={appData.subs.length}
          icon={<Crown className="h-6 w-6" />}
          color="text-purple-600"
        />
        <StatCard
          title="Avg Tribute"
          value={`$${appData.tributes.length > 0 ? (totalTributes / appData.tributes.length).toFixed(2) : '0'}`}
          icon={<TrendingUp className="h-6 w-6" />}
          color="text-orange-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <LazyWrapper>
          <LazyTributeChart />
        </LazyWrapper>
        
        <LazyWrapper>
          <LazyAIInsightsDashboard />
        </LazyWrapper>
      </div>
    </div>
  );
};

export default DashboardPage;