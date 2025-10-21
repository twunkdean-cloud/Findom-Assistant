import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { RefreshCcw } from 'lucide-react';

const ChecklistPage = () => {
  const { appData, updateAppData } = useFindom();
  const { checklist } = appData;

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
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetChecklist}
            className="bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600"
          >
            <RefreshCcw className="mr-2 h-4 w-4" /> Reset Today
          </Button>
        </CardHeader>
        <CardContent className="space-y-3 mt-4">
          {checklist.tasks.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No tasks defined. Add tasks in settings or context.</p>
          ) : (
            checklist.tasks.map((task, index) => (
              <div key={index} className="flex items-center space-x-3 p-2 bg-gray-700 rounded-md">
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
            ))
          )}
          {allTasksCompleted && checklist.tasks.length > 0 && (
            <p className="text-green-400 text-center font-semibold mt-4">All tasks completed for today! Great job!</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ChecklistPage;