import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFindom } from '@/context/FindomContext';
import { toast } from '@/utils/toast';

interface GoalEditorProps {
  children?: React.ReactNode; // Optional custom trigger (e.g., wrap the 'of $...' text)
}

const GoalEditor: React.FC<GoalEditorProps> = ({ children }) => {
  const { appData, updateAppData } = useFindom();
  const [open, setOpen] = useState(false);
  const [targetStr, setTargetStr] = useState<string>(String(appData.goal?.target ?? 0));

  const handleSave = async () => {
    const parsed = parseFloat(targetStr);
    const newTarget = Number.isFinite(parsed) ? Math.max(0, parsed) : 0;

    const newGoal = {
      ...(appData.goal || { weekly: 0, monthly: 0 }),
      target: newTarget,
    };

    await updateAppData('goal', newGoal);
    toast.success('Goal updated');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button variant="outline" size="sm">Edit Goal</Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader>
          <DialogTitle>Edit Goal Target</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="goal-target">Target ($)</Label>
            <Input
              id="goal-target"
              type="number"
              inputMode="decimal"
              value={targetStr}
              onChange={(e) => setTargetStr(e.target.value)}
              placeholder="Enter target amount"
              className="bg-gray-900/60 border-gray-700 text-white"
            />
          </div>
          <p className="text-xs text-muted-foreground">
            This sets your target amount used to calculate goal progress.
          </p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default GoalEditor;