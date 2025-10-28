import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useFindom } from '@/context/FindomContext';
import { useNavigate } from 'react-router-dom';
import { 
  DollarSign, 
  Users, 
  CheckSquare, 
  Calendar,
  TrendingUp,
  Target,
  Crown
} from 'lucide-react';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import BaselineMetricsPanel from '@/components/BaselineMetricsPanel';

const Index = () => {
  const { appData } = useFindom();
  const navigate = useNavigate();

  const totalTributes = appData.tributes.reduce((sum, tribute) => sum + tribute.amount, 0);
  const goalProgress = appData.goal?.target && appData.goal?.target > 0 
    ? ((appData.goal?.current || 0) / appData.goal.target) * 100 
    : 0;
  const completedTasks = appData.checklist?.completed?.length || 0;
  const totalTasks = appData.checklist?.tasks?.length || 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const currentTime = new Date();
  const upcomingEvents = appData.calendarEvents
    .filter(event => new Date(event.datetime) > currentTime)
    .slice(0, 3);

  const recentTributes = appData.tributes
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* DEV-only performance HUD */}
      <PerformanceMonitor componentName="Index" />
      
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-1">
          Welcome back! Here's your {appData.profile?.gender === 'female' ? 'Femdom' : 'Findom'} overview.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Total Tributes</CardTitle>
            <DollarSign className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">${totalTributes.toFixed(2)}</div>
            <p className="text-xs text-gray-500 mt-1">All time earnings</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Active {appData.profile?.gender === 'female' ? 'Worshippers' : 'Subs'}</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{appData.subs.length}</div>
            <p className="text-xs text-gray-500 mt-1">Total registered</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Tasks Progress</CardTitle>
            <CheckSquare className="h-4 w-4 text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{completedTasks}/{totalTasks}</div>
            <Progress value={taskProgress} className="h-2 bg-gray-700 [&>*]:bg-purple-500" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-400">Goal Progress</CardTitle>
            <Target className="h-4 w-4 text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">${(appData.goal?.current || 0).toFixed(2)}</p>
              <p className="text-sm text-gray-400">of ${(appData.goal?.target || 0).toFixed(2)}</p>
              <Progress value={Math.min(goalProgress, 100)} className="h-2 bg-gray-700 [&>*]:bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Crown className="mr-2 h-5 w-5 text-yellow-400" />
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button
              onClick={() => navigate('/tributes')}
              className="bg-green-600 hover:bg-green-700 h-20 flex flex-col items-center justify-center"
            >
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Add Tribute</span>
            </Button>
            <Button
              onClick={() => navigate('/tasks')}
              className="bg-purple-600 hover:bg-purple-700 h-20 flex flex-col items-center justify-center"
            >
              <CheckSquare className="h-6 w-6 mb-2" />
              <span>Generate Task</span>
            </Button>
            <Button
              onClick={() => navigate('/twitter')}
              className="bg-blue-600 hover:bg-blue-700 h-20 flex flex-col items-center justify-center"
            >
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Create Tweet</span>
            </Button>
            <Button
              onClick={() => navigate('/checklist')}
              className="bg-orange-600 hover:bg-orange-700 h-20 flex flex-col items-center justify-center"
            >
              <Calendar className="h-6 w-6 mb-2" />
              <span>View Calendar</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tributes */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Recent Tributes</CardTitle>
          </CardHeader>
          <CardContent>
            {recentTributes.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No tributes yet</p>
            ) : (
              <div className="space-y-3">
                {recentTributes.map((tribute) => (
                  <div key={tribute.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">${tribute.amount.toFixed(2)}</p>
                      <p className="text-gray-400 text-sm">{tribute.from_sub}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">{new Date(tribute.date).toLocaleDateString()}</p>
                      <p className="text-gray-600 text-xs">{tribute.source}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No upcoming events</p>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between">
                    <div>
                      <p className="text-white font-medium">{event.content.split('\n')[0]}</p>
                      <p className="text-gray-400 text-sm">{event.platform}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-sm">{new Date(event.datetime).toLocaleDateString()}</p>
                      <p className="text-gray-600 text-xs">{new Date(event.datetime).toLocaleTimeString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Baseline metrics panel */}
      <BaselineMetricsPanel />
    </div>
  );
};

export default Index;