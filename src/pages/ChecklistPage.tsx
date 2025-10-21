import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { RefreshCcw, PlusCircle, Edit, Trash2 } from 'lucide-react';

const ChecklistPage = () => {
  const { appData, updateAppData, addChecklistTask, editChecklistTask, deleteChecklistTask } = useFindom();
  const { checklist } = appData;

  const [isAddTaskDialogOpen, setIsAddTaskDialogOpen] = useState(false);
  const [isEditTaskDialogOpen, setIsEditTaskDialogOpen] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [editedTaskName, setEditedTaskName] = useState('');

  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Effect to handle daily reset if the date changes
  useEffect(() => {
    const todayDate = getTodayDate();
    if (checklist.date !== todayDate) {
      updateAppData('checklist', {
        ...checklist,
        date: todayDate,
        completed: [],
      });
      toast.info('Daily checklist reset for a new day!');
    }
  }, [checklist.date, updateAppData]);

  const handleTaskToggle = (task: string, checked: boolean) => {
    let newCompleted: string[];
    if (checked) {
      newCompleted = [...checklist.completed, task];
    } else {
      newCompleted = checklist.completed.filter((t) => t !== task);
    }
    updateAppData('checklist', { ...checklist, completed: newCompleted });
  };

  const handleResetChecklist = () => {
    if (window.confirm('Are you sure you want to reset today\'s checklist?')) {
      updateAppData('checklist', { ...checklist, completed: [] });
      toast.success('Checklist reset for today!');
    }
  };

  const handleAddNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      addChecklistTask(newTaskName.trim());
      setNewTaskName('');
      setIsAddTaskDialogOpen(false);
    } else {
      toast.error('Task name cannot be empty.');
    }
  };

  const openEditTaskDialog = (task: string) => {
    setEditingTask(task);
    setEditedTaskName(task);
    setIsEditTaskDialogOpen(true);
  };

  const handleEditTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTask && editedTaskName.trim()) {
      editChecklistTask(editingTask, editedTaskName.trim());
      setIsEditTaskDialogOpen(false);
      setEditingTask(null);
      setEditedTaskName('');
    } else {
      toast.error('Task name cannot be empty.');
    }
  };

  const handleDeleteTask = (task: string) => {
    if (window.confirm(`Are you sure you want to delete "${task}"? This cannot be undone.`)) {
      deleteChecklistTask(task);
    }
  };

  const todayFormatted = new Date(checklist.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const allTasksCompleted = checklist.tasks.length > 0 && checklist.completed.length === checklist.tasks.length;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Daily Checklist</h2>
      <p className="text-sm text-gray-400">
        Tasks for <span className="font-semibold text-indigo-400">{todayFormatted}</span>
      </p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Your Daily Tasks</CardTitle>
          <div className="flex space-x-2">
            <Dialog open={isAddTaskDialogOpen} onOpenChange={setIsAddTaskDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-500">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Task
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Add New Task</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddNewTask} className="space-y-4">
                  <div>
                    <Label htmlFor="new-task-name">Task Name</Label>
                    <Input
                      id="new-task-name"
                      placeholder="e.g., Meditate for 10 minutes"
                      value={newTaskName}
                      onChange={(e) => setNewTaskName(e.target.value)}
                      className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
                      required
                    />
                  </div>
                  <DialogFooter className="flex gap-3 pt-4">
                    <Button type="submit" className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700">
                      Add Task
                    </Button>
                    <Button type="button" variant="secondary" onClick={() => setIsAddTaskDialogOpen(false)} className="flex-1 bg-gray-600 px-4 py-2 rounded hover:bg-gray-700">
                      Cancel
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetChecklist}
              className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
            >
              <RefreshCcw className="mr-2 h-4 w-4" /> Reset Today
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 mt-4">
          {checklist.tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks defined. Click "Add Task" to get started!</p>
          ) : (
            checklist.tasks.map((task, index) => (
              <div key={task} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                <div className="flex items-center space-x-3">
                  <Checkbox
                    id={`task-${index}`}
                    checked={checklist.completed.includes(task)}
                    onCheckedChange={(checked) => handleTaskToggle(task, checked as boolean)}
                    className="border-gray-500 data-[state=checked]:bg-indigo-500 data-[state=checked]:text-white"
                  />
                  <Label
                    htmlFor={`task-${index}`}
                    className={`text-gray-200 text-base cursor-pointer ${
                      checklist.completed.includes(task) ? 'line-through text-gray-400' : ''
                    }`}
                  >
                    {task}
                  </Label>
                </div>
                <div className="flex space-x-1">
                  <Button variant="ghost" size="icon" onClick={() => openEditTaskDialog(task)} className="text-blue-400 hover:text-blue-300">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDeleteTask(task)} className="text-red-400 hover:text-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
          {allTasksCompleted && checklist.tasks.length > 0 && (
            <p className="text-green-400 text-center font-semibold mt-4">All tasks completed for today! Great job!</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskDialogOpen} onOpenChange={setIsEditTaskDialogOpen}>
        <DialogContent className="bg-gray-800 border border-gray-700 text-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">Edit Task</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditTask} className="space-y-4">
            <div>
              <Label htmlFor="edit-task-name">Task Name</Label>
              <Input
                id="edit-task-name"
                value={editedTaskName}
                onChange={(e) => setEditedTaskName(e.target.value)}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
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