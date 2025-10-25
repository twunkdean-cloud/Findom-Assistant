import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGemini } from '@/hooks/use-gemini';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

const RedditGeneratorPage = () => {
  const { callGemini, isLoading, error } = useGemini();
  const { getSystemPrompt, isMale, isFemale } = useGenderedContent();
  const [topic, setTopic] = useState('');
  const [generatedPost, setGeneratedPost] = useState('');

  const handleGeneratePost = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the Reddit post.');
      return;
    }

    setGeneratedPost('');
    const systemPrompt = getSystemPrompt('reddit') + ` 
Generate a Reddit post based on the user's topic. 
Make it engaging and appropriate for Reddit. 
Include relevant formatting.
Use ${isMale ? 'masculine, commanding' : 'feminine, seductive'} tone appropriate for ${isMale ? 'male-for-male findom' : 'female-for-male femdom'}.
Do not include any introductory or concluding remarks, just the post content.`;
    
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
      <p className="text-sm text-gray-400 mb-4">
        Generate engaging Reddit posts based on your {isMale ? 'Findom' : 'Femdom'} persona and topic.
      </p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Topic for Reddit Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder={`Enter the topic for your Reddit post (e.g., ${isMale 
              ? "'findom lifestyle', 'financial domination experiences', 'sub training'" 
              : "'femdom power', 'worship experiences', 'paypig training'"})`}
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