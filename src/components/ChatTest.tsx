import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGemini } from '@/hooks/use-gemini';
import { Loader2 } from 'lucide-react';

const ChatTest = () => {
  const { callGemini, isLoading, error } = useGemini();
  const [input, setInput] = useState('');
  const [response, setResponse] = useState('');

  const handleTest = async () => {
    console.log('Test button clicked');
    setResponse('');
    
    const result = await callGemini(input, 'You are a helpful assistant. Respond briefly.');
    
    if (result) {
      console.log('Got result:', result);
      setResponse(result);
    } else {
      console.log('No result, error:', error);
      setResponse(`Error: ${error}`);
    }
  };

  return (
    <div className="p-4 space-y-4 max-w-2xl mx-auto">
      <h3 className="text-lg font-bold">Chat AI Test</h3>
      
      <div>
        <label className="text-sm text-gray-300 mb-2 block">Test Prompt:</label>
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter a simple test prompt..."
          rows={3}
          className="bg-gray-900 border-gray-700 text-gray-200"
        />
      </div>

      <Button
        onClick={handleTest}
        disabled={isLoading || !input.trim()}
        className="bg-indigo-600 hover:bg-indigo-700"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        Test Chat AI
      </Button>

      {error && (
        <div className="p-3 bg-red-900 border border-red-700 rounded text-red-200">
          <strong>Error:</strong> {error}
        </div>
      )}

      {response && (
        <div className="p-3 bg-gray-800 border border-gray-700 rounded">
          <strong>Response:</strong>
          <pre className="mt-2 text-sm text-gray-300 whitespace-pre-wrap">{response}</pre>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Open browser console (F12) to see detailed logs
      </div>
    </div>
  );
};

export default ChatTest;