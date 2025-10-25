import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { useFindom } from '@/context/FindomContext';
import { toast } from '@/utils/toast';
import { Plus, Trash2 } from 'lucide-react';

const ChecklistPage = () => {
  const { appData, updateAppData, addChecklistTask, deleteChecklistTask, handleToggleWeeklyTask } = useFindom();
  const [newTask, setNewTask] = useState('');

  const { checklist } = appData;
  const today = new Date(checklist.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const handleAddTask = () => {
    if (newTask.trim()) {
      addChecklistTask(newTask.trim());
      setNewTask('');
    } else {
      toast.error('Task cannot be empty.');
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
      <p className="text-sm text-gray-400">Tasks for {today}</p>

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
                    className={`text-sm font-medium leading-none ${
                      checklist.completed.includes(task) ? 'line-through text-gray-500' : 'text-gray-200'
                    }`}
                  >
                    {task}
                  </label>
                </div>
                <Button variant="ghost" size="icon" onClick={() => deleteChecklistTask(task)} className="text-red-400 hover:text-red-300 h-6 w-6">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <div className="flex space-x-2 pt-2">
              <Input
                value={newTask}
                onChange={(e) => setNewTask(e.target.value)}
                placeholder="Add a new task"
                className="bg-gray-900 border-gray-600"
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
                  className={`text-sm font-medium leading-none ${
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
    </div>
  );
};

export default ChecklistPage;