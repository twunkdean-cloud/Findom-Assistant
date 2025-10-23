import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGemini } from '@/hooks/use-gemini';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

const RedditGeneratorPage = () => {
  const { callGemini, isLoading, error } = useGemini();
  const [topic, setTopic] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');

  const getSystemPrompt = (): string => {
    return `You are a confident, experienced MALE FOR MALE findom content creator who knows how to write compelling Reddit content.
    This is specifically for MALE DOMINANTS and MALE SUBMISSIVES in the findom lifestyle.
    Write naturally, conversationally, and authentically - like you're talking to a friend or client.
    Use contractions (you're, can't, won't) and natural language patterns.
    Avoid corporate-speak, overly formal language, or AI-like phrases.
    Be direct, bold, and unapologetic in your tone.
    Focus on real scenarios, practical advice, and genuine findom dynamics between men.
    Keep it real, keep it authentic, and always maintain that dominant but natural energy.
    No "as an AI" or similar phrases - just straight, authentic content.
    IMPORTANT: This is MALE FOR MALE findom only. Never mention women, goddess, femdom, or any female-related content. All content should be focused on male-male dynamics.
    
    For Reddit content:
    - Follow subreddit rules and formatting
    - Use appropriate flairs when required
    - Be engaging and authentic to the Reddit community
    - Include relevant details about male-male findom dynamics
    - Focus on genuine experiences and advice for men in findom`;
  };

  const handleGeneratePost = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the Reddit post.');
      return;
    }

    setGeneratedPost('');
    const systemPrompt = getSystemPrompt() + " Generate a Reddit post based on the user's topic. Make it engaging and appropriate for Reddit. Include relevant formatting. Do not include any introductory or concluding remarks, just the post content.";
    const userPrompt = `Generate a Reddit post about: ${topic}`;

    const result = await callGemini(userPrompt, systemPrompt);
    if (result) {
      setGeneratedPost(result);
      toast.success('Reddit post generated successfully!');
    } else if (error) {
      toast.error(`Failed to generate Reddit post: ${error}`);
    }
  };

  const handleCopyPost = () => {
    if (generatedPost.trim()) {
      navigator.clipboard.writeText(generatedPost.trim());
      toast.success('Reddit post copied to clipboard!');
    } else {
      toast.error('No post to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Reddit Post Generator</h2>
      <p className="text-sm text-gray-400 mb-4">Generate engaging Reddit posts based on your persona and topic.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Topic for Reddit Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter the topic for your Reddit post (e.g., 'findom lifestyle', 'financial domination experiences', 'sub training')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            disabled={isLoading}
          />
          <Button
            onClick={handleGeneratePost}
            disabled={isLoading || !topic.trim()}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 w-full flex items-center justify-center"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Reddit Post
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generated Reddit Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedPost ? (
            <Textarea
              value={generatedPost}
              readOnly
              rows={8}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
            />
          ) : (
            <p className="text-gray-500 text-center">Your generated Reddit post will appear here...</p>
          )}
          <Button
            onClick={handleCopyPost}
            disabled={!generatedPost.trim()}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Post
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default RedditGeneratorPage;