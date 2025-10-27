import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFindom } from '@/context/FindomContext';
import { toast } from '@/utils/toast';
import { Plus, Trash2, Edit, Brain } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAI } from '@/hooks/use-ai';

const ChecklistPage = () => {
  const { appData, updateAppData, addChecklistTask, editChecklistTask, deleteChecklistTask, handleToggleWeeklyTask } = useFindom();
  const { checklist } = appData;
  const { callGemini, isLoading: isAILoading } = useAI();
  
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [isAddWeeklyTaskDialogOpen, setIsAddWeeklyTaskDialogOpen] = useState(false);
  const [isEditWeeklyTaskDialogOpen, setIsEditWeeklyTaskDialogOpen] = useState(false);

  const [newTask, setNewTask] = useState('');
  const [newWeeklyTask, setNewWeeklyTask] = useState('');
  const [editingTask, setEditingTask] = useState<{ type: 'daily' | 'weekly', task: string } | null>(null);
  const [editedTaskName, setEditedTaskName] = useState('');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    if (checklist.date !== today) {
      updateAppData('checklist', { ...checklist, date: today, completed: [] });
      toast.info("Daily checklist reset for a new day!");
    }
  }, [checklist, updateAppData]);

  const todayFormatted = new Date(checklist.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleAddTask = () => {
    if (newTask.trim()) {
      addChecklistTask(newTask.trim());
      setNewTask('');
      setIsAddTaskDialogOpen(false);
    } else {
      toast.error('Task name cannot be empty.');
    }
  };

  const addWeeklyTaskLocal = async (task: string) => {
    const tasks = checklist.weeklyTasks || [];
    if (tasks.includes(task)) {
      toast.error('Task already exists.');
      return;
    }
    const updatedWeeklyTasks = [...tasks, task];
    await updateAppData('checklist', { ...checklist, weeklyTasks: updatedWeeklyTasks });
    toast.success('Weekly task added!');
  };

  const editWeeklyTaskLocal = async (oldTask: string, newTask: string) => {
    if (oldTask === newTask) {
      toast.info('No change made to task.');
      return;
    }
    const tasks = checklist.weeklyTasks || [];
    if (tasks.includes(newTask)) {
      toast.error('A task with this name already exists.');
      return;
    }
    const updatedWeeklyTasks = tasks.map(t => (t === oldTask ? newTask : t));
    const updatedWeeklyCompleted = (checklist.weeklyCompleted || []).map(t => (t === oldTask ? newTask : t));
    await updateAppData('checklist', { ...checklist, weeklyTasks: updatedWeeklyTasks, weeklyCompleted: updatedWeeklyCompleted });
    toast.success('Weekly task updated!');
  };

  const deleteWeeklyTaskLocal = async (task: string) => {
    const updatedWeeklyTasks = (checklist.weeklyTasks || []).filter(t => t !== task);
    const updatedWeeklyCompleted = (checklist.weeklyCompleted || []).filter(t => t !== task);
    await updateAppData('checklist', { ...checklist, weeklyTasks: updatedWeeklyTasks, weeklyCompleted: updatedWeeklyCompleted });
    toast.success('Weekly task deleted!');
  };

  const handleAddWeeklyTask = () => {
    if (newWeeklyTask.trim()) {
      addWeeklyTaskLocal(newWeeklyTask.trim());
      setNewWeeklyTask('');
      setIsAddWeeklyTaskDialogOpen(false);
    } else {
      toast.error('Task name cannot be empty.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && editedTaskName.trim()) {
      if (editingTask.type === 'daily') {
        editChecklistTask(editingTask.task, editedTaskName.trim());
      } else {
        editWeeklyTaskLocal(editingTask.task, editedTaskName.trim());
      }
      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
      setEditedTaskName('');
    } else {
      toast.error("Task name cannot be empty.");
    }
  };

  const handleToggleTask = (task: string) => {
    const newCompleted = checklist.completed.includes(task)
      ? checklist.completed.filter(t => t !== task)
      : [...checklist.completed, task];
    updateAppData('checklist', { ...checklist, completed: newCompleted });
  };

  const getAIGoalSuggestion = async (timeframe: 'daily' | 'weekly') => {
    const prompt = `Based on my findom assistant data, suggest one actionable ${timeframe} goal for me. My current daily tasks are: ${checklist.tasks.join(', ')}. My weekly tasks are: ${checklist.weeklyTasks?.join(', ')}.`;
    const result = await callGemini(prompt, `You are an expert findom coach. Provide a single, concise, and actionable goal suggestion.`);
    if (result) {
      toast.success(result, { duration: 10000 });
    } else {
      toast.error('Could not generate a suggestion at this time.');
    }
  };

  const dailyProgress = (checklist.tasks.length > 0 ? (checklist.completed.length / checklist.tasks.length) * 100 : 0);
  const weeklyProgress = (checklist.weeklyTasks && checklist.weeklyTasks.length > 0 ? ((checklist.weeklyCompleted?.length || 0) / checklist.weeklyTasks.length) * 100 : 0);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Checklist & Goals</h2>
      <p className="text-sm text-gray-400">Today is {todayFormatted}</p>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
        </TabsList>
        <TabsContent value="daily">
          <Card className="bg-gray-800 border-gray-700 mt-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Daily Tasks</CardTitle>
              <Progress value={dailyProgress} className="w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.tasks.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-900/50">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`task-${index}`}
                      checked={checklist.completed.includes(task)}
                      onCheckedChange={() => handleToggleTask(task)}
                    />
                    <label
                      htmlFor={`task-${index}`}
                      className={`text-sm font-medium leading-none cursor-pointer ${
                        checklist.completed.includes(task) ? 'line-through text-gray-500' : 'text-gray-200'
                      }`}
                    >
                      {task}
                    </label>
                  </div>
                  <div className="flex">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingTask({ type: 'daily', task });
                      setEditedTaskName(task);
                      setIsEditTaskDialogOpen(true);
                    }} className="text-blue-400 hover:text-blue-300 h-6 w-6">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteChecklistTask(task)} className="text-red-400 hover:text-red-300 h-6 w-6">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex space-x-2 pt-2">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
                  placeholder="Add a new daily task"
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Button onClick={handleAddTask} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={() => getAIGoalSuggestion('daily')} disabled={isAILoading}>
                <Brain className="mr-2 h-4 w-4" />
                {isAILoading ? 'Thinking...' : 'Get AI Suggestion'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="weekly">
          <Card className="bg-gray-800 border-gray-700 mt-4">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-white">Weekly Tasks</CardTitle>
              <Progress value={weeklyProgress} className="w-full mt-2" />
            </CardHeader>
            <CardContent className="space-y-3">
              {checklist.weeklyTasks?.map((task, index) => (
                <div key={index} className="flex items-center justify-between p-2 rounded-md bg-gray-900/50">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id={`weekly-task-${index}`}
                      checked={checklist.weeklyCompleted?.includes(task)}
                      onCheckedChange={() => handleToggleWeeklyTask(task)}
                    />
                    <label
                      htmlFor={`weekly-task-${index}`}
                      className={`text-sm font-medium leading-none cursor-pointer ${
                        checklist.weeklyCompleted?.includes(task) ? 'line-through text-gray-500' : 'text-gray-200'
                      }`}
                    >
                      {task}
                    </label>
                  </div>
                  <div className="flex">
                    <Button variant="ghost" size="icon" onClick={() => {
                      setEditingTask({ type: 'weekly', task });
                      setEditedTaskName(task);
                      setIsEditTaskDialogOpen(true);
                    }} className="text-blue-400 hover:text-blue-300 h-6 w-6">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteWeeklyTaskLocal(task)} className="text-red-400 hover:text-red-300 h-6 w-6">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex space-x-2 pt-2">
                <Input
                  value={newWeeklyTask}
                  onChange={(e) => setNewWeeklyTask(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddWeeklyTask()}
                  placeholder="Add a new weekly task"
                  className="bg-gray-900 border-gray-600 text-white"
                />
                <Button onClick={handleAddWeeklyTask} size="icon">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <Button variant="outline" className="w-full mt-2" onClick={() => getAIGoalSuggestion('weekly')} disabled={isAILoading}>
                <Brain className="mr-2 h-4 w-4" />
                {isAILoading ? 'Thinking...' : 'Get AI Suggestion'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <Label htmlFor="edit-task-name">Task Name</Label>
              <Input
                id="edit-task-name"
                value={editedTaskName}
                onChange={(e) => setEditedTaskName(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-white"
                required
              />
            </div>
            <DialogFooter className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                Save Changes
              </Button>
              <Button type="button" variant="secondary" onClick={() => setIsEditTaskDialogOpen(false)} className="flex-1 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700">
                Cancel
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChecklistPage;