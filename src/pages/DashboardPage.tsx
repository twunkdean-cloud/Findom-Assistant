import React, { useEffect, useState } from 'react';
import { useFindom } from '@/context/FindomContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { CalendarIcon, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const DashboardPage = () => {
  const { appData, updateAppData } = useFindom();
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
      // Timer was running and stopped, save the final screen time
      updateAppData('screenTime', appData.screenTime + Math.floor((Date.now() - appData.timerStart!) / 1000));
      updateAppData('timerStart', null);
    }
    return () => clearInterval(interval);
  }, [timerRunning, appData.timerStart, appData.screenTime, updateAppData]);

  const handleSaveGoal = () => {
    updateAppData('goal', { target: goalAmount, current: goalProgressInput });
    toast.success('Goal updated!');
  };

  const handleAddRedFlag = () => {
    if (redflagUsername.trim() && redflagReason.trim()) {
      const newRedFlag = { id: Date.now(), username: redflagUsername.trim(), reason: redflagReason.trim() };
      updateAppData('redflags', [...appData.redflags, newRedFlag]);
      setRedflagUsername('');
      setRedflagReason('');
      toast.success('Red flag added!');
    } else {
      toast.error('Username and reason are required.');
    }
  };

  const handleRemoveRedFlag = (id: number) => {
    updateAppData('redflags', appData.redflags.filter(flag => flag.id !== id));
    toast.success('Red flag removed.');
  };

  const handleAddCalendarEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (calendarDatetime && calendarPlatform && calendarContent) {
      const newEvent = {
        id: Date.now(),
        datetime: calendarDatetime,
        platform: calendarPlatform,
        content: calendarContent,
      };
      updateAppData('calendar', [...appData.calendar, newEvent]);
      setCalendarDatetime('');
      setCalendarPlatform('');
      setCalendarContent('');
      setCalendarOpen(false);
      toast.success('Content scheduled!');
    } else {
      toast.error('All calendar fields are required.');
    }
  };

  const handleRemoveCalendarEvent = (id: number) => {
    updateAppData('calendar', appData.calendar.filter(item => item.id !== id));
    toast.success('Schedule removed.');
  };

  const handleStartTimer = () => {
    if (!timerRunning) {
      updateAppData('timerStart', Date.now());
      setTimerRunning(true);
      toast.info('Session timer started!');
    } else {
      // Stop timer and save elapsed time
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

  const sortedCalendar = [...appData.calendar].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime());

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Dashboard</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Monthly Goal</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-400">${appData.goal.current} / ${appData.goal.target}</p>
            <Progress value={Math.min(goalProgress, 100)} className="w-full h-2 mt-2 bg-gray-700 [&>*]:bg-green-500" />
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Active Subs</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-indigo-400">{appData.subs.length}</p>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border border-gray-700">
          <CardHeader>
            <CardTitle className="text-sm text-gray-400">Screen Time Today</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-purple-400">{formatTime(screenTime)}</p>
            <Button onClick={handleStartTimer} className={cn("mt-2 text-xs", timerRunning ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700")}>
              {timerRunning ? 'Stop Session' : 'Start Session'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardTitle className="text-lg font-semibold mb-3">Monthly Goal Settings</CardTitle>
        <div className="flex flex-col sm:flex-row gap-3">
          <Input
            type="number"
            placeholder="Target Amount"
            value={goalAmount}
            onChange={(e) => setGoalAmount(parseFloat(e.target.value) || 0)}
            className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
          />
          <Input
            type="number"
            placeholder="Current Progress"
            value={goalProgressInput}
            onChange={(e) => setGoalProgressInput(parseFloat(e.target.value) || 0)}
            className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
          />
          <Button onClick={handleSaveGoal} className="bg-green-600 px-4 py-2 rounded hover:bg-green-700">
            Save
          </Button>
        </div>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardTitle className="text-lg font-semibold mb-3">Content Calendar</CardTitle>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {sortedCalendar.length === 0 ? (
            <p className="text-gray-500 text-sm">No scheduled content yet</p>
          ) : (
            sortedCalendar.map(item => (
              <div key={item.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                <div>
                  <span className="text-indigo-400 font-semibold text-sm">{item.platform}</span>
                  <span className="text-gray-400 text-xs ml-2">
                    {new Date(item.datetime).toLocaleDateString()} {new Date(item.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <p className="text-gray-300 text-sm">{item.content}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveCalendarEvent(item.id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
        <Dialog open={calendarOpen} onOpenChange={setCalendarOpen}>
          <DialogTrigger asChild>
            <Button className="mt-3 bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 text-sm">
              Add Content Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">Add Content Schedule</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddCalendarEvent} className="space-y-3">
              <div>
                <Label htmlFor="calendar-datetime">Date and Time</Label>
                <Input
                  id="calendar-datetime"
                  type="datetime-local"
                  value={calendarDatetime}
                  onChange={(e) => setCalendarDatetime(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  required
                />
              </div>
              <div>
                <Label htmlFor="calendar-platform">Platform</Label>
                <Input
                  id="calendar-platform"
                  placeholder="Platform (Twitter, OF, etc.)"
                  value={calendarPlatform}
                  onChange={(e) => setCalendarPlatform(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  required
                />
              </div>
              <div>
                <Label htmlFor="calendar-content">Content Description</Label>
                <Input
                  id="calendar-content"
                  placeholder="Content description"
                  value={calendarContent}
                  onChange={(e) => setCalendarContent(e.target.value)}
                  className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                  required
                />
              </div>
              <DialogFooter className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                  Save
                </Button>
                <Button type="button" variant="secondary" onClick={() => setCalendarOpen(false)} className="flex-1 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700">
                  Cancel
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardTitle className="text-lg font-semibold mb-3">Red Flag Database</CardTitle>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Input
            type="text"
            placeholder="Username"
            value={redflagUsername}
            onChange={(e) => setRedflagUsername(e.target.value)}
            className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
          />
          <Input
            type="text"
            placeholder="Reason"
            value={redflagReason}
            onChange={(e) => setRedflagReason(e.target.value)}
            className="flex-1 p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
          />
          <Button onClick={handleAddRedFlag} className="bg-red-600 px-4 py-2 rounded hover:bg-red-700">
            Add
          </Button>
        </div>
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {appData.redflags.length === 0 ? (
            <p className="text-gray-500 text-sm">No red flags yet</p>
          ) : (
            appData.redflags.map(flag => (
              <div key={flag.id} className="flex justify-between items-center bg-gray-700 p-2 rounded">
                <div>
                  <span className="font-semibold text-red-400">{flag.username}</span>
                  <span className="text-gray-400 text-sm ml-2">{flag.reason}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveRedFlag(flag.id)} className="text-gray-500 hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;