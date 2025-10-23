import React, { useEffect, useState } from 'react';
import { useFindom } from '@/context/FindomContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  DollarSign, 
  Users, 
  Calendar, 
  CheckSquare, 
  TrendingUp,
  Clock,
  Target,
  AlertCircle,
  ArrowRight,
  Plus
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const { appData } = useFindom();
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalTributes = appData.tributes.reduce((sum, tribute) => sum + tribute.amount, 0);
  const goalProgress = appData.goal.target > 0 ? (appData.goal.current / appData.goal.target) * 100 : 0;
  const completedTasks = appData.checklist.completed?.length || 0;
  const totalTasks = appData.checklist.tasks?.length || 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const upcomingEvents = appData.calendar
    .filter(event => new Date(event.datetime) > currentTime)
    .sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime())
    .slice(0, 3);

  const recentTributes = appData.tributes
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3);

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const quickActions = [
    {
      title: 'Add Tribute',
      description: 'Log a new payment',
      icon: DollarSign,
      path: '/tributes',
      color: 'from-green-600 to-green-500'
    },
    {
      title: 'New Sub',
      description: 'Add a new subscriber',
      icon: Users,
      path: '/subs',
      color: 'from-indigo-600 to-indigo-500'
    },
    {
      title: 'Schedule Content',
      description: 'Plan your posts',
      icon: Calendar,
      path: '/checklist',
      color: 'from-purple-600 to-purple-500'
    },
    {
      title: 'Generate Task',
      description: 'Create a new task',
      icon: CheckSquare,
      path: '/tasks',
      color: 'from-yellow-600 to-yellow-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-white">Welcome Back</h1>
          <p className="text-gray-400 mt-2">
            {currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Active
          </Badge>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
          >
            View Dashboard
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-green-400">Monthly Goal</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">${appData.goal.current.toFixed(2)}</p>
              <p className="text-sm text-gray-400">of ${appData.goal.target.toFixed(2)}</p>
              <Progress value={Math.min(goalProgress, 100)} className="h-2 bg-gray-700 [&>*]:bg-green-500" />
              <p className="text-xs text-gray-500">{goalProgress.toFixed(1)}% complete</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-yellow-400">Total Earnings</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">${totalTributes.toFixed(2)}</p>
              <p className="text-sm text-gray-400">{appData.tributes.length} transactions</p>
              <div className="flex items-center text-xs text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                All time
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 border-indigo-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-indigo-400">Active Subs</CardTitle>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{appData.subs.length}</p>
              <p className="text-sm text-gray-400">Total subscribers</p>
              <div className="flex items-center text-xs text-indigo-400">
                <Users className="h-3 w-3 mr-1" />
                Active connections
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-purple-400">Screen Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-white">{formatTime(appData.screenTime)}</p>
              <p className="text-sm text-gray-400">Today's session</p>
              <div className="flex items-center text-xs text-purple-400">
                <Clock className="h-3 w-3 mr-1" />
                Active time
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action) => (
              <Button
                key={action.title}
                onClick={() => navigate(action.path)}
                className={`h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r ${action.color} hover:opacity-90 transition-opacity`}
              >
                <action.icon className="h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs opacity-90">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tributes */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">Recent Tributes</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/tributes')}
                className="text-gray-400 hover:text-white"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTributes.length === 0 ? (
                <div className="text-center py-6">
                  <DollarSign className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No recent tributes</p>
                </div>
              ) : (
                recentTributes.map((tribute) => (
                  <div key={tribute.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-500/10 rounded-lg">
                        <DollarSign className="h-4 w-4 text-green-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">${tribute.amount.toFixed(2)}</p>
                        <p className="text-gray-400 text-sm">{tribute.from}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        {new Date(tribute.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Upcoming Events */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold text-white">Upcoming Events</CardTitle>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/checklist')}
                className="text-gray-400 hover:text-white"
              >
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingEvents.length === 0 ? (
                <div className="text-center py-6">
                  <Calendar className="h-8 w-8 text-gray-600 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming events</p>
                </div>
              ) : (
                upcomingEvents.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-3 bg-gray-700/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-purple-500/10 rounded-lg">
                        <Calendar className="h-4 w-4 text-purple-400" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{event.platform}</p>
                        <p className="text-gray-400 text-sm">{event.content}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-400 text-sm">
                        {new Date(event.datetime).toLocaleDateString()}
                      </p>
                      <p className="text-gray-500 text-xs">
                        {new Date(event.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tasks Progress */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">Daily Tasks Progress</CardTitle>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate('/checklist')}
              className="text-gray-400 hover:text-white"
            >
              Manage Tasks
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-green-400" />
                <span className="text-gray-300">Tasks Completed</span>
              </div>
              <span className="text-white font-medium">
                {completedTasks}/{totalTasks}
              </span>
            </div>
            <Progress value={taskProgress} className="h-3 bg-gray-700 [&>*]:bg-gradient-to-r [&>*]:from-green-500 [&>*]:to-green-400" />
            <p className="text-sm text-gray-500">
              {taskProgress.toFixed(0)}% of daily tasks completed. Keep up the great work!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;