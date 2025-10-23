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

const ChecklistPage = () => {
  const { appData, updateChecklist, updateCalendar } = useFindom();
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const [editTaskId, setEditTaskId] = useState<string | null>(null);
  const [editTaskText, setEditTaskText] = useState('');

  // Calendar event state
  const [eventDatetime, setEventDatetime] = useState('');
  const [eventPlatform, setEventPlatform] = useState('');
  const [eventContent, setEventContent] = useState('');
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

  const today = new Date().toISOString().split('T')[0];
  const todayTasks = appData.checklist.tasks[currentDate] || [];
  const todayCompleted = appData.checklist.completed[currentDate] || [];

  const handleAddTask = () => {
    if (!newTask.trim()) {
      toast.error('Please enter a task');
      return;
    }

    const updatedTasks = {
      ...appData.checklist.tasks,
      [currentDate]: [...todayTasks, newTask.trim()]
    };

    updateChecklist('tasks', updatedTasks);
    setNewTask('');
    setIsTaskDialogOpen(false);
    toast.success('Task added!');
  };

  const handleToggleTask = (task: string) => {
    const isCompleted = todayCompleted.includes(task);
    
    if (isCompleted) {
      // Remove from completed
      const updatedCompleted = {
        ...appData.checklist.completed,
        [currentDate]: todayCompleted.filter(t => t !== task)
      };
      updateChecklist('completed', updatedCompleted);
    } else {
      // Add to completed
      const updatedCompleted = {
        ...appData.checklist.completed,
        [currentDate]: [...todayCompleted, task]
      };
      updateChecklist('completed', updatedCompleted);
    }
  };

  const handleDeleteTask = (task: string) => {
    const updatedTasks = {
      ...appData.checklist.tasks,
      [currentDate]: todayTasks.filter(t => t !== task)
    };
    const updatedCompleted = {
      ...appData.checklist.completed,
      [currentDate]: todayCompleted.filter(t => t !== task)
    };

    updateChecklist('tasks', updatedTasks);
    updateChecklist('completed', updatedCompleted);
    toast.success('Task deleted');
  };

  const handleEditTask = (taskId: string, taskText: string) => {
    setEditTaskId(taskId);
    setEditTaskText(taskText);
  };

  const handleSaveEdit = () => {
    if (!editTaskText.trim()) return;

    const updatedTasks = {
      ...appData.checklist.tasks,
      [currentDate]: todayTasks.map(t => t === editTaskId ? editTaskText.trim() : t)
    };
    const updatedCompleted = {
      ...appData.checklist.completed,
      [currentDate]: todayCompleted.map(t => t === editTaskId ? editTaskText.trim() : t)
    };

    updateChecklist('tasks', updatedTasks);
    updateChecklist('completed', updatedCompleted);
    setEditTaskId(null);
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
              <div className="flex items-center space-x-2">
                <Input
                  type="date"
                  value={currentDate}
                  onChange={(e) => setCurrentDate(e.target.value)}
                  className="w-40 bg-gray-900 border-gray-600 text-gray-200"
                />
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <PlusCircle className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-800 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Add New Task</DialogTitle>
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
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {todayTasks.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No tasks for this day</p>
              ) : (
                todayTasks.map((task) => {
                  const isCompleted = todayCompleted.includes(task);
                  const isEditing = editTaskId === task;
                  
                  return (
                    <div key={task} className="flex items-center space-x-2 p-2 rounded hover:bg-gray-700">
                      <Checkbox
                        checked={isCompleted}
                        onCheckedChange={() => handleToggleTask(task)}
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
                            onClick={() => handleEditTask(task, task)}
                            className="text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTask(task)}
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

        {/* Content Calendar */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-purple-400" />
              Content Calendar
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedEvents.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No scheduled events</p>
              ) : (
                sortedEvents.map((event) => (
                  <div key={event.id} className="p-3 bg-gray-700 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="text-sm font-medium text-purple-400">{event.platform}</span>
                          <span className="text-xs text-gray-500">
                            {new Date(event.datetime).toLocaleDateString()} {new Date(event.datetime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        <p className="text-sm text-gray-300">{event.content}</p>
                      </div>
                      <div className="flex space-x-1">
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
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChecklistPage;