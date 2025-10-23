import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useFindom } from '@/context/FindomContext';
import { CalendarEvent } from '@/types/index';
import { toast } from 'sonner';
import { PlusCircle, Calendar, CheckSquare, Trash2, Edit } from 'lucide-react';
import { DEFAULT_WEEKLY_TASKS } from '@/constants/default-data';

const ChecklistPage = () => {
  const { appData, updateChecklist, updateCalendar, handleToggleWeeklyTask } = useFindom();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [editTaskIndex, setEditTaskIndex] = useState<number | null>(null);
  const [editTaskText, setEditTaskText] = useState('');

  // Calendar event state
  const [eventDatetime, setEventDatetime] = useState('');
  const [eventPlatform, setEventPlatform] = useState('');
  const [eventContent, setEventContent] = useState('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = appData.checklist.tasks;
  const todayCompleted = appData.checklist.completed;
  const weeklyTasks = appData.checklist.weeklyTasks || DEFAULT_WEEKLY_TASKS;
  const weeklyCompleted = appData.checklist.weeklyCompleted || [];

  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast.error('Please enter a task');
      return;
    }

    const updatedTasks = [...todayTasks, newTask.trim()];
    updateChecklist('tasks', updatedTasks);
    setNewTask('');
    setIsTaskDialogOpen(false);
    toast.success('Task added!');
  };

  const handleToggleTask = (taskIndex: number) => {
    const task = todayTasks[taskIndex];
    const isCompleted = todayCompleted.includes(task);
    
    if (isCompleted) {
      // Remove from completed
      const updatedCompleted = todayCompleted.filter(t => t !== task);
      updateChecklist('completed', updatedCompleted);
    } else {
      // Add to completed
      const updatedCompleted = [...todayCompleted, task];
      updateChecklist('completed', updatedCompleted);
    }
  };

  const handleDeleteTask = (taskIndex: number) => {
    const task = todayTasks[taskIndex];
    const updatedTasks = todayTasks.filter((_, i) => i !== taskIndex);
    const updatedCompleted = todayCompleted.filter(t => t !== task);

    updateChecklist('tasks', updatedTasks);
    updateChecklist('completed', updatedCompleted);
    toast.success('Task deleted');
  };

  const handleEditTask = (taskIndex: number) => {
    setEditTaskIndex(taskIndex);
    setEditTaskText(todayTasks[taskIndex]);
  };

  const handleSaveEdit = () => {
    if (!editTaskText.trim() || editTaskIndex === null) return;

    const oldTask = todayTasks[editTaskIndex];
    const updatedTasks = [...todayTasks];
    updatedTasks[editTaskIndex] = editTaskText.trim();
    
    const updatedCompleted = todayCompleted.map(t => 
      t === oldTask ? editTaskText.trim() : t
    );

    updateChecklist('tasks', updatedTasks);
    updateChecklist('completed', updatedCompleted);
    setEditTaskIndex(null);
    setEditTaskText('');
    toast.success('Task updated');
  };

  const handleAddEvent = async () => {
    if (!eventDatetime || !eventPlatform || !eventContent) {
      toast.error('All fields are required');
      return;
    }

    const newEvent: CalendarEvent = {
      id: Date.now().toString(),
      datetime: eventDatetime,
      platform: eventPlatform,
      content: eventContent,
    };

    const updatedCalendar = editingEvent
      ? appData.calendar.map(e => e.id === editingEvent.id ? newEvent : e)
      : [...appData.calendar, newEvent];

    await updateCalendar(updatedCalendar);
    
    setEventDatetime('');
    setEventPlatform('');
    setEventContent('');
    setEditingEvent(null);
    setIsEventDialogOpen(false);
    
    toast.success(editingEvent ? 'Event updated!' : 'Event scheduled!');
  };

  const handleDeleteEvent = async (id: string) => {
    const updatedCalendar = appData.calendar.filter(e => e.id !== id);
    await updateCalendar(updatedCalendar);
    toast.success('Event deleted');
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setEventDatetime(event.datetime);
    setEventPlatform(event.platform);
    setEventContent(event.content);
    setIsEventDialogOpen(true);
  };

  const sortedEvents = [...appData.calendar].sort((a, b) => 
    new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">Daily Checklist & Calendar</h2>
          <p className="text-sm text-gray-400 mt-1">Manage your daily tasks and content schedule</p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={isEventDialogOpen} onOpenChange={setIsEventDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-purple-600 hover:bg-purple-700">
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Event
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingEvent ? 'Edit Event' : 'Schedule New Event'}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label className="text-gray-300">Date & Time</Label>
                  <Input
                    type="datetime-local"
                    value={eventDatetime}
                    onChange={(e) => setEventDatetime(e.target.value)}
                    className="bg-gray-900 border-gray-600 text-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Platform</Label>
                  <Input
                    placeholder="Twitter, OF, Reddit, etc."
                    value={eventPlatform}
                    onChange={(e) => setEventPlatform(e.target.value)}
                    className="bg-gray-900 border-gray-600 text-gray-200"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Content Description</Label>
                  <Input
                    placeholder="What will you post?"
                    value={eventContent}
                    onChange={(e) => setEventContent(e.target.value)}
                    className="bg-gray-900 border-gray-600 text-gray-200"
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleAddEvent} className="bg-purple-600 hover:bg-purple-700">
                    {editingEvent ? 'Update' : 'Schedule'}
                  </Button>
                </DialogFooter>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Tasks */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-white flex items-center">
                <CheckSquare className="mr-2 h-5 w-5 text-green-400" />
                Daily Tasks
              </CardTitle>
              <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-800 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Add New Daily Task</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <Input
                      placeholder="Enter task..."
                      value={newTask}
                      onChange={(e) => setNewTask(e.target.value)}
                      className="bg-gray-900 border-gray-600 text-gray-200"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                    />
                    <DialogFooter>
                      <Button onClick={handleAddTask} className="bg-green-600 hover:bg-green-700">
                        Add Task
                      </Button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks for today</p>
              ) : (
                todayTasks.map((task, index) => {
                  const isCompleted = todayCompleted.includes(task);
                  const isEditing = editTaskIndex === index;
                  
                  return (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleToggleTask(index)}
                      />
                      {isEditing ? (
                        <div className="flex-1 flex space-x-2">
                          <Input
                            value={editTaskText}
                            onChange={(e) => setEditTaskText(e.target.value)}
                            className="bg-gray-900 border-gray-600 text-gray-200"
                          />
                          <Button size="sm" onClick={handleSaveEdit} className="bg-green-600 hover:bg-green-700">
                            Save
                          </Button>
                        </div>
                      ) : (
                        <>
                          <span className={`flex-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                            {task}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEditTask(index)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTask(index)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Progress: {todayCompleted.length}/{todayTasks.length} tasks completed
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Weekly Tasks */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-blue-400" />
              Weekly Tasks
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {weeklyTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No weekly tasks</p>
              ) : (
                weeklyTasks.map((task, index) => {
                  const isCompleted = weeklyCompleted.includes(task);
                  
                  return (
                    <div key={index} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleToggleWeeklyTask(task)}
                      />
                      <span className={`flex-1 ${isCompleted ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                        {task}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              <p className="text-sm text-gray-400">
                Progress: {weeklyCompleted.length}/{weeklyTasks.length} weekly tasks completed
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Events */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-white flex items-center">
            <Calendar className="mr-2 h-5 w-5 text-purple-400" />
            Scheduled Events
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortedEvents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No scheduled events</p>
            ) : (
              sortedEvents.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-3 rounded bg-gray-700">
                  <div className="flex-1">
                    <p className="text-white font-medium">{event.platform}</p>
                    <p className="text-gray-400 text-sm">{event.content}</p>
                    <p className="text-gray-500 text-xs">
                      {new Date(event.datetime).toLocaleString()}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditEvent(event)}
                      className="text-blue-400 hover:text-blue-300"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteEvent(event.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistPage;