import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFindom } from '@/context/FindomContext';
import { toast } from '@/utils/toast';
import { Plus, Trash2, Edit } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

const ChecklistPage = () => {
  const { appData, updateAppData, addChecklistTask, editChecklistTask, deleteChecklistTask, handleToggleWeeklyTask } = useFindom();
  const { checklist } = appData;
  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
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

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && editedTaskName.trim()) {
      editChecklistTask(editingTask, editedTaskName.trim());
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Daily Checklist</h2>
      <p className="text-sm text-gray-400">Tasks for {todayFormatted}</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Daily Tasks</CardTitle>
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
                    setEditingTask(task);
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
                placeholder="Add a new task"
                className="bg-gray-900 border-gray-600 text-white"
              />
              <Button onClick={handleAddTask} size="icon">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-white">Weekly Tasks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {checklist.weeklyTasks?.map((task, index) => (
              <div key={index} className="flex items-center space-x-3 p-2">
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
            ))}
          </CardContent>
        </Card>
      </div>
      
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