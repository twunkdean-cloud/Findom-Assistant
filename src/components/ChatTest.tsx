import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGemini } from '@/hooks/use-gemini';
import { toast } from 'sonner';
import { Loader2, Send, Bot } from 'lucide-react';

const ChatTest = () => {
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');
  const { callGemini, isLoading } = useGemini();

  const handleTest = async () => {
    if (!input.trim()) {
      toast.error('Please enter a test message');
      return;
    }

    try {
      const result = await callGemini(input);
      if (result) {
        setResponse(result);
        toast.success('Test completed successfully');
      } else {
        toast.error('No response received');
      }
    } catch (error) {
      toast.error('Test failed');
      console.error('Chat test error:', error);
    }
  };

  return (
    <Card className="bg-gray-800 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5 text-indigo-400" />
          AI Chat Test
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm text-gray-300 mb-2 block">Test Input</label>
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter a test message for the AI..."
            rows={3}
            className="bg-gray-900 border-gray-700"
          />
        </div>

        <Button
          onClick={handleTest}
          disabled={isLoading || !input.trim()}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <Send className="h-4 w-4 mr-2" />
          )}
          Test AI Response
        </Button>

        {response && (
          <div>
            <label className="text-sm text-gray-300 mb-2 block">AI Response</label>
            <div className="bg-gray-900 border border-gray-700 rounded-lg p-3">
              <p className="text-gray-200 whitespace-pre-wrap">{response}</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ChatTest;