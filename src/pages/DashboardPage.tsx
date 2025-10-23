import React, { useEffect, useState } from 'react';
import { useFindom } from '@/context/FindomContext';
import { RedFlag, CalendarEvent } from '@/types/index';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { CalendarIcon, Trash2, TrendingUp, Users, DollarSign, Clock, Target, CheckCircle, AlertCircle, Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';
import TributeChart from '@/components/TributeChart';

const DashboardPage = () => {
  const { appData, updateAppData, updateCalendar, updateRedflags } = useFindom();
  const [goalAmount, setGoalAmount] = useState(appData.goal.target);
  const [goalProgressInput, setGoalProgressInput] = useState(appData.goal.current);
  const [redflagUsername, setRedflagUsername] = useState('');
  const [redflagReason, setRedflagReason] = useState('');
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarDatetime, setCalendarDatetime] = useState('');
  const [calendarPlatform, setCalendarPlatform] = useState('');
  const [calendarContent, setCalendarContent] = useState('');
  const [screenTime, setScreenTime] = useState(appData.screenTime);
  const [timerRunning, setTimerRunning] = useState(appData.timerStart !== null);

  useEffect(() => {
    setGoalAmount(appData.goal.target);
    setGoalProgressInput(appData.goal.current);
    setScreenTime(appData.screenTime);
    setTimerRunning(appData.timerStart !== null);
  }, [appData.goal, appData.screenTime, appData.timerStart]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && appData.timerStart !== null) {
      interval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - appData.timerStart!) / 1000);
        setScreenTime(appData.screenTime + elapsed);
      }, 1000);
    } else if (!timerRunning && appData.timerStart !== null) {
      updateAppData('screenTime', appData.screenTime + Math.floor((Date.now() - appData.timerStart!) / 1000));
      updateAppData('timerStart', null);
    }
    return () => clearInterval(interval);
  }, [timerRunning, appData.timerStart, appData.screenTime, updateAppData]);

  const handleSaveGoal = () => {
    updateAppData('goal', { target: goalAmount, current: goalProgressInput });
    toast.success('Goal updated!');
  };

  const handleAddRedFlag = async () => {
    if (redflagUsername.trim() && redflagReason.trim()) {
      const newRedFlag: RedFlag = { 
        id: crypto.randomUUID(),
        username: redflagUsername.trim(), 
        reason: redflagReason.trim() 
      };
      const updatedRedflags: RedFlag[] = [...appData.redflags, newRedFlag];
      await updateRedflags(updatedRedflags);
      setRedflagUsername('');
      setRedflagReason('');
      toast.success('Red flag added!');
    } else {
      toast.error('Username and reason are required.');
    }
  };

  const handleRemoveRedFlag = async (id: string) => {
    const updatedRedflags = appData.redflags.filter(flag => flag.id !== id);
    await updateRedflags(updatedRedflags);
    toast.success('Red flag removed.');
  };

  const handleAddCalendarEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (calendarDatetime && calendarPlatform && calendarContent) {
      const newEvent: CalendarEvent = {
        id: crypto.randomUUID(),
        datetime: calendarDatetime,
        platform: calendarPlatform,
        content: calendarContent,
      };
      const updatedCalendar: CalendarEvent[] = [...appData.calendar, newEvent];
      await updateCalendar(updatedCalendar);
      setCalendarDatetime('');
      setCalendarPlatform('');
      setCalendarContent('');
      setCalendarOpen(false);
      toast.success('Content scheduled!');
    } else {
      toast.error('All calendar fields are required.');
    }
  };

  const handleRemoveCalendarEvent = async (id: string) => {
    const updatedCalendar = appData.calendar.filter(item => item.id !== id);
    await updateCalendar(updatedCalendar);
    toast.success('Schedule removed.');
  };

  const handleStartTimer = () => {
    if (!timerRunning) {
      updateAppData('timerStart', Date.now());
      setTimerRunning(true);
      toast.info('Session timer started!');
    } else {
      const elapsed = Math.floor((Date.now() - appData.timerStart!) / 1000);
      updateAppData('screenTime', appData.screenTime + elapsed);
      updateAppData('timerStart', null);
      setTimerRunning(false);
      toast.info('Session timer stopped!');
    }
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  const goalProgress = appData.goal.target > 0 ? (appData.goal.current / appData.goal.target) * 100 : 0;
  const totalTributes = appData.tributes.reduce((sum, tribute) => sum + tribute.amount, 0);
  const completedTasks = appData.checklist.completed.length;
  const totalTasks = appData.checklist.tasks.length;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const sortedCalendar = [...appData.calendar].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 mt-1">Welcome back! Here's your overview for today.</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="bg-green-500/10 border-green-500/30 text-green-400">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
            Active Session
          </Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Goal Progress Card */}
        <Card className="bg-gradient-to-br from-green-900/20 to-green-800/10 border-green-500/20 hover:border-green-500/40 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-green-400">Monthly Goal</CardTitle>
              <Target className="h-4 w-4 text-green-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-white">
                  ${appData.goal.current.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">of ${appData.goal.target.toFixed(2)}</p>
              </div>
              <Progress value={Math.min(goalProgress, 100)} className="h-2 bg-gray-700 [&>*]:bg-gradient-to-r [&>*]:from-green-500 [&>*]:to-green-400" />
              <p className="text-xs text-gray-500">{goalProgress.toFixed(1)}% complete</p>
            </div>
          </CardContent>
        </Card>

        {/* Total Tributes Card */}
        <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/10 border-yellow-500/20 hover:border-yellow-500/40 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-yellow-400">Total Tributes</CardTitle>
              <DollarSign className="h-4 w-4 text-yellow-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-white">
                  ${totalTributes.toFixed(2)}
                </p>
                <p className="text-sm text-gray-400">{appData.tributes.length} transactions</p>
              </div>
              <div className="flex items-center text-xs text-green-400">
                <TrendingUp className="h-3 w-3 mr-1" />
                <span>All time earnings</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Subs Card */}
        <Card className="bg-gradient-to-br from-indigo-900/20 to-indigo-800/10 border-indigo-500/20 hover:border-indigo-500/40 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-indigo-400">Active Subs</CardTitle>
              <Users className="h-4 w-4 text-indigo-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-white">
                  {appData.subs.length}
                </p>
                <p className="text-sm text-gray-400">Total subs</p>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <Users className="h-3 w-3 mr-1" />
                <span>Active connections</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Screen Time Card */}
        <Card className="bg-gradient-to-br from-purple-900/20 to-purple-800/10 border-purple-500/20 hover:border-purple-500/40 transition-all duration-200">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm text-purple-400">Screen Time</CardTitle>
              <Clock className="h-4 w-4 text-purple-400" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-2xl font-bold text-white">
                  {formatTime(screenTime)}
                </p>
                <p className="text-sm text-gray-400">Today's session</p>
              </div>
              <Button 
                onClick={handleStartTimer} 
                size="sm"
                className={cn(
                  "w-full text-xs transition-all",
                  timerRunning 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-purple-600 hover:bg-purple-700"
                )}
              >
                {timerRunning ? (
                  <>
                    <Pause className="h-3 w-3 mr-1" />
                    Stop Session
                  </>
                ) : (
                  <>
                    <Play className="h-3 w-3 mr-1" />
                    Start Session
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TributeChart tributes={appData.tributes} />
        </div>

        {/* Task Progress */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Daily Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="text-gray-300">Tasks Completed</span>
                </div>
                <span className="text-white font-medium">
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <Progress value={taskProgress} className="h-3 bg-gray-700 [&>*]:bg-gradient-to-r [&>*]:from-green-500 [&>*]:to-green-400" />
              <p className="text-xs text-gray-500">{taskProgress.toFixed(0)}% of daily tasks</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goal Settings */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Monthly Goal Settings</CardTitle>
          <p className="text-sm text-gray-400">Set your financial target and track progress</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="goal-target" className="text-gray-300">Target Amount ($)</Label>
              <Input
                id="goal-target"
                type="number"
                placeholder="e.g., 5000"
                value={goalAmount}
                onChange={(e) => setGoalAmount(parseFloat(e.target.value) || 0)}
                className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="goal-progress" className="text-gray-300">Current Progress ($)</Label>
              <Input
                id="goal-progress"
                type="number"
                placeholder="e.g., 1250"
                value={goalProgressInput}
                onChange={(e) => setGoalProgressInput(parseFloat(e.target.value) || 0)}
                className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-indigo-500"
              />
            </div>
          </div>
          <Button onClick={handleSaveGoal} className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600">
            Save Goal Settings
          </Button>
        </CardContent>
      </Card>

      {/* Content Calendar */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Content Calendar</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {sortedCalendar.length === 0 ? (
                <div className="text-center py-8">
                  <CalendarIcon className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No scheduled content yet</p>
                </div>
              ) : (
                sortedCalendar.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/30 text-indigo-400 text-xs">
                          {item.platform}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {new Date(item.datetime).toLocaleDateString()} {new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm">{item.content}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveCalendarEvent(item.id)} className="text-gray-500 hover:text-red-400 ml-3">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
            <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  Add Content Schedule
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border-gray-700 text-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold text-white">Add Content Schedule</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddCalendarEvent} className="space-y-4">
                  <div>
                    <Label htmlFor="calendar-datetime" className="text-gray-300">Date and Time</Label>
                    <Input
                      id="calendar-datetime"
                      type="datetime-local"
                      value={calendarDatetime}
                      onChange={(e) => setCalendarDatetime(e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-gray-200 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="calendar-platform" className="text-gray-300">Platform</Label>
                    <Input
                      id="calendar-platform"
                      placeholder="Platform (Twitter, OF, etc.)"
                      value={calendarPlatform}
                      onChange={(e) => setCalendarPlatform(e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="calendar-content" className="text-gray-300">Content Description</Label>
                    <Input
                      id="calendar-content"
                      placeholder="Content description"
                      value={calendarContent}
                      onChange={(e) => setCalendarContent(e.target.value)}
                      className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-indigo-500"
                      required
                    />
                  </div>
                  <DialogFooter className="flex gap-3">
                    <Button type="submit" className="flex-1 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600">
                      Save Schedule
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setCalendarOpen(false)} className="flex-1 bg-gray-600 hover:bg-gray-700">
                      Cancel
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Red Flag Database */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white">Red Flag Database</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="text"
                placeholder="Username"
                value={redflagUsername}
                onChange={(e) => setRedflagUsername(e.target.value)}
                className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-indigo-500"
              />
              <Input
                type="text"
                placeholder="Reason"
                value={redflagReason}
                onChange={(e) => setRedflagReason(e.target.value)}
                className="bg-gray-900/50 border-gray-600 text-gray-200 placeholder-gray-500 focus:border-indigo-500"
              />
              <Button onClick={handleAddRedFlag} className="bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 whitespace-nowrap">
                <AlertCircle className="h-4 w-4 mr-2" />
                Add Flag
              </Button>
            </div>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {appData.redflags.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-gray-500">No red flags yet</p>
                </div>
              ) : (
                appData.redflags.map(flag => (
                  <div key={flag.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline" className="bg-red-500/10 border-red-500/30 text-red-400 text-xs">
                          {flag.username}
                        </Badge>
                      </div>
                      <p className="text-gray-300 text-sm">{flag.reason}</p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => handleRemoveRedFlag(flag.id)} className="text-gray-500 hover:text-red-400 ml-3">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardPage;