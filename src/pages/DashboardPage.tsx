import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFindom } from '@/context/FindomContext';
import { useFindomActions } from '@/hooks/use-findom-actions';
import { useMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import {
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
  Target,
  Brain,
  Bell,
  Settings,
  Plus,
  ChevronRight,
  Activity,
  AlertTriangle,
  Sparkles
} from 'lucide-react';
import { LazyWrapper, ComponentLoadingFallback } from '@/utils/lazy-loading';
import { LazyTributeChart, LazyAIInsightsDashboard } from '@/components/lazy';
import PushNotificationManager from '@/components/PushNotificationManager';

const DashboardPage = () => {
  const { appData, setAppData } = useFindom();
  const { updateAppData } = useFindomActions(appData, setAppData);
  const { isMobile } = useMobile();
  const [activeTab, setActiveTab] = useState('overview');

  // Calculate metrics
  const totalTributes = appData.tributes.reduce((sum, t) => sum + Number(t.amount), 0);
  const totalSubs = appData.subs.length;
  const avgTribute = appData.tributes.length > 0 ? totalTributes / appData.tributes.length : 0;
  
  // Recent activity
  const recentTributes = appData.tributes
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Top subs
  const topSubs = appData.subs
    .sort((a, b) => b.total - a.total)
    .slice(0, 5);

  // Weekly progress
  const weeklyGoal = appData.goal?.weekly || 0;
  const currentWeekTotal = appData.tributes
    .filter(t => {
      const tributeDate = new Date(t.date);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return tributeDate >= sevenDaysAgo;
    })
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const weeklyProgress = weeklyGoal > 0 ? (currentWeekTotal / weeklyGoal) * 100 : 0;

  // Quick stats
  const stats = [
    {
      title: 'Total Revenue',
      value: `$${totalTributes.toFixed(2)}`,
      icon: DollarSign,
      change: '+12%',
      color: 'text-green-400',
      bgColor: 'bg-green-900/20'
    },
    {
      title: 'Active Subs',
      value: totalSubs.toString(),
      icon: Users,
      change: '+3',
      color: 'text-blue-400',
      bgColor: 'bg-blue-900/20'
    },
    {
      title: 'Avg Tribute',
      value: `$${avgTribute.toFixed(2)}`,
      icon: Target,
      change: '+8%',
      color: 'text-purple-400',
      bgColor: 'bg-purple-900/20'
    },
    {
      title: 'Weekly Goal',
      value: `${weeklyProgress.toFixed(0)}%`,
      icon: Calendar,
      change: weeklyProgress >= 100 ? '✓' : `${weeklyProgress.toFixed(0)}%`,
      color: weeklyProgress >= 100 ? 'text-green-400' : 'text-yellow-400',
      bgColor: weeklyProgress >= 100 ? 'bg-green-900/20' : 'bg-yellow-900/20'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-100">Dashboard</h1>
          <p className="text-gray-400 mt-1">Welcome back! Here's your business overview</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
            <Bell className="mr-2 h-4 w-4" />
            {isMobile ? '' : 'Notifications'}
          </Button>
          <Button size={isMobile ? 'sm' : 'default'}>
            <Plus className="mr-2 h-4 w-4" />
            {isMobile ? '' : 'Add Tribute'}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-3' : 'grid-cols-4'} bg-gray-800 border border-gray-700`}>
          <TabsTrigger value="overview" className="data-[state=active]:bg-indigo-600">
            <Activity className="mr-2 h-4 w-4" />
            {isMobile ? 'Overview' : 'Overview'}
          </TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-indigo-600">
            <Brain className="mr-2 h-4 w-4" />
            {isMobile ? 'AI' : 'AI Insights'}
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-indigo-600">
            <TrendingUp className="mr-2 h-4 w-4" />
            {isMobile ? 'Analytics' : 'Analytics'}
          </TabsTrigger>
          <TabsTrigger value="settings" className="data-[state=active]:bg-indigo-600">
            <Settings className="mr-2 h-4 w-4" />
            {isMobile ? 'Settings' : 'Settings'}
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stats Grid */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {stats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className={`${stat.bgColor} border-gray-700`}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Icon className={`h-5 w-5 ${stat.color}`} />
                      <span className="text-xs text-green-400 font-medium">{stat.change}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-100">{stat.value}</div>
                    <div className="text-xs text-gray-500">{stat.title}</div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Weekly Progress */}
          {weeklyGoal > 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-200">Weekly Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Current: ${currentWeekTotal.toFixed(2)}</span>
                  <span className="text-gray-400">Goal: ${weeklyGoal.toFixed(2)}</span>
                </div>
                <Progress value={weeklyProgress} className="h-3" />
                <div className="text-center">
                  <span className={`text-2xl font-bold ${weeklyProgress >= 100 ? 'text-green-400' : 'text-yellow-400'}`}>
                    {weeklyProgress.toFixed(0)}%
                  </span>
                  <p className="text-sm text-gray-500">
                    {weeklyProgress >= 100 ? 'Goal achieved! 🎉' : 'Keep going!'}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity & Top Subs */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {/* Recent Tributes */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-200">Recent Tributes</CardTitle>
              </CardHeader>
              <CardContent>
                {recentTributes.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No recent tributes</p>
                ) : (
                  <div className="space-y-3">
                    {recentTributes.map((tribute) => (
                      <div key={tribute.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-gray-200">{tribute.from_sub}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(tribute.date).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">${Number(tribute.amount).toFixed(2)}</p>
                          <Badge variant="outline" className="text-xs">
                            {tribute.source}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Top Subs */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-gray-200">Top Subs</CardTitle>
              </CardHeader>
              <CardContent>
                {topSubs.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No subs yet</p>
                ) : (
                  <div className="space-y-3">
                    {topSubs.map((sub, index) => (
                      <div key={sub.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                            {index + 1}
                          </div>
                          <div>
                            <p className="font-medium text-gray-200">{sub.name}</p>
                            <p className="text-xs text-gray-500">
                              {sub.lastTribute ? `Last: ${new Date(sub.lastTribute).toLocaleDateString()}` : 'No tributes yet'}
                            </p>
                          </div>
                        </div>
                        <p className="font-semibold text-green-400">${sub.total.toFixed(2)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* AI Insights Tab */}
        <TabsContent value="insights">
          <LazyWrapper fallback={<ComponentLoadingFallback message="Loading AI Insights..." />}>
            <LazyAIInsightsDashboard />
          </LazyWrapper>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-gray-800 border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-200">Tribute Trends</CardTitle>
            </CardHeader>
            <CardContent>
              <LazyWrapper fallback={<ComponentLoadingFallback message="Loading chart..." />}>
                <LazyTributeChart tributes={appData.tributes} />
              </LazyWrapper>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <PushNotificationManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DashboardPage;