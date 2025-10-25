import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGemini } from '@/hooks/use-gemini';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

const TwitterGeneratorPage: React.FC = () => {
  const { callGemini, isLoading } = useGemini();
  const { getSystemPrompt } = useGenderedContent();
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const generateTweet = async () => {
    if (!input.trim()) {
      toast.error('Please enter a topic or idea');
      return;
    }

    try {
      const systemPrompt = getSystemPrompt('twitter');
      const userPrompt = `Generate a tweet about: ${input}`;
      
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        setOutput(result);
        toast.success('Tweet generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate tweet');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Tweet Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generate Tweet</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Topic or Idea</label>
              <Textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter your topic or idea..."
                rows={3}
                className="bg-gray-900 border-gray-700 text-gray-200"
              />
            </div>

            <Button
              onClick={generateTweet}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Tweet
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generated Tweet</CardTitle>
          </CardHeader>
          <CardContent>
            {output ? (
              <Textarea
                value={output}
                readOnly
                rows={4}
                className="bg-gray-900 border-gray-700 text-gray-200"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">Your generated tweet will appear here...</p>
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

export default TwitterGeneratorPage;