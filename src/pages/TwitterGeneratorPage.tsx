import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGemini } from '@/hooks/use-gemini';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

const TwitterGeneratorPage = () => {
  const { callGemini, isLoading, error, getSystemPrompt } = useGemini();
  const [topic, setTopic] = useState('');
  const [generatedTweet, setGeneratedTweet] = useState('');

  const handleGenerateTweet = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the tweet.');
      return;
    }

    setGeneratedTweet('');
    const systemPrompt = getSystemPrompt() + " Generate a single tweet (max 280 characters) based on the user's topic. Include relevant emojis and hashtags. Do not include any introductory or concluding remarks, just the tweet content.";
    const userPrompt = `Generate a tweet about: ${topic}`;

    const result = await callGemini(userPrompt, systemPrompt);
    if (result) {
      setGeneratedTweet(result);
      toast.success('Tweet generated successfully!');
    } else if (error) {
      toast.error(`Failed to generate tweet: ${error}`);
    }
  };

  const handleCopyTweet = () => {
    if (generatedTweet.trim()) {
      navigator.clipboard.writeText(generatedTweet.trim());
      toast.success('Tweet copied to clipboard!');
    } else {
      toast.error('No tweet to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Tweet Generator</h2>
      <p className="text-sm text-gray-400 mb-4">Generate engaging tweets based on your persona and a given topic.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Topic for Tweet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter the topic for your tweet (e.g., 'a sub sending tribute', 'my dominance', 'foot worship')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            disabled={isLoading}
          />
          <Button
            onClick={handleGenerateTweet}
            disabled={isLoading || !topic.trim()}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 w-full flex items-center justify-center"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Tweet
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generated Tweet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedTweet ? (
            <Textarea
              value={generatedTweet}
              readOnly
              rows={4}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
            />
          ) : (
            <p className="text-gray-500 text-center">Your generated tweet will appear here...</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {generatedTweet.length}/280 characters
            </span>
            <Button
              onClick={handleCopyTweet}
              disabled={!generatedTweet.trim()}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Tweet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwitterGeneratorPage;