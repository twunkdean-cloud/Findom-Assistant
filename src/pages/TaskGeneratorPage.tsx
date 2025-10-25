import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useGemini } from '@/hooks/use-gemini';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

const TaskGeneratorPage: React.FC = () => {
  const { callGemini, isLoading } = useGemini();
  const { getSystemPrompt } = useGenderedContent();
  const [input, setInput] = useState('');
  const [intensity, setIntensity] = useState<'low' | 'medium' | 'high'>('medium');
  const [output, setOutput] = useState('');

  const generateTask = async () => {
    if (!input.trim()) {
      toast.error('Please enter a topic for task.');
      return;
    }

    try {
      const systemPrompt = getSystemPrompt('task');
      const userPrompt = `Generate a creative task about: ${input}`;
      
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        setOutput(result);
        toast.success('Task generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate task');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Task Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generate Task</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Task Topic</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your topic for task..."
                rows={3}
                className="bg-gray-900 border-gray-700 text-gray-200"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Intensity</label>
              <Select value={intensity} onValueChange={(value: 'low' | 'medium' | 'high') => setIntensity(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateTask}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Task
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generated Task</CardTitle>
          </CardHeader>
          <CardContent>
            {output ? (
              <Textarea
                value={output}
                readOnly
                rows={6}
                className="bg-gray-900 border-gray-700 text-gray-200"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">Your generated task will appear here...</p>
            )}
            
            <Button
              onClick={copyToClipboard}
              disabled={!output}
              className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy to Clipboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TaskGeneratorPage;