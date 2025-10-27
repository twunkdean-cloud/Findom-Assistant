"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useAI } from '@/hooks/use-ai';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from '@/utils/toast';
import { Loader2, Copy } from 'lucide-react';
import { usePersona, PersonaTone } from '@/hooks/use-persona';

const TaskGeneratorPage = () => {
  const { callGemini, isLoading, error } = useAI();
  const { getSystemPrompt, isMale, isFemale } = useGenderedContent();
  const { persona, gender, presets, buildSystemPrompt } = usePersona();
  const [topic, setTopic] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [generatedTask, setGeneratedTask] = useState('');
  const [nextTone, setNextTone] = useState<PersonaTone | null>(null);

  const handleGenerateTask = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the task.');
      return;
    }

    setGeneratedTask('');
    const systemPrompt = buildSystemPrompt('task', { tone: (nextTone || persona) as PersonaTone, gender }) + `
Generate a creative ${isMale ? 'findom' : 'femdom'} task for a sub based on the user's topic.
The task should be of ${intensity} intensity.
Do not include any introductory or concluding remarks, just the task content.`;

    setNextTone(null);
    
    const userPrompt = `Generate a ${isMale ? 'findom' : 'femdom'} task about: ${topic}`;

    const result = await callGemini(userPrompt, systemPrompt);
    if (result) {
      setGeneratedTask(result);
      toast.success('Task generated successfully!');
    } else if (error) {
      toast.error(`Failed to generate task: ${error}`);
    }
  };

  const handleCopyTask = () => {
    if (generatedTask.trim()) {
      navigator.clipboard.writeText(generatedTask.trim());
      toast.success('Task copied to clipboard!');
    } else {
      toast.error('No task to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Task Generator</h2>
      <p className="text-sm text-gray-400 mb-4">
        Generate creative {isMale ? 'findom' : 'femdom'} tasks based on type and intensity.
      </p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate New Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-gray-300">Quick tone for this task:</span>
            {presets.map(p => (
              <Button
                key={p}
                size="sm"
                variant={nextTone === p ? 'default' : 'outline'}
                className={`${nextTone === p ? 'bg-indigo-600 text-white' : 'border-gray-700 text-gray-200'}`}
                onClick={() => setNextTone(prev => (prev === p ? null : p))}
                disabled={isLoading}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-topic">Task Topic</Label>
            <Textarea
              id="task-topic"
              placeholder={`Enter the topic for the task (e.g., ${isMale 
                ? "'a public display of devotion', 'a financial challenge', 'a humiliating confession'" 
                : "'an act of worship', 'a tribute ritual', 'a servitude demonstration'"})`}
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              rows={3}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="task-intensity">Intensity</Label>
            <Select value={intensity} onValueChange={(value: 'low' | 'medium' | 'high') => setIntensity(value)} disabled={isLoading}>
              <SelectTrigger id="task-intensity" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                <SelectValue placeholder="Select intensity" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700 text-gray-200">
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleGenerateTask}
            disabled={isLoading || !topic.trim()}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 w-full flex items-center justify-center"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Task
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generated Task</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedTask ? (
            <Textarea
              value={generatedTask}
              readOnly
              rows={6}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
            />
          ) : (
            <p className="text-gray-500 text-center">Your generated task will appear here...</p>
          )}
          <Button
            onClick={handleCopyTask}
            disabled={!generatedTask.trim()}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Task
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TaskGeneratorPage;