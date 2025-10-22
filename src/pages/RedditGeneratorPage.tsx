import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGemini } from '@/hooks/use-gemini';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

const RedditGeneratorPage = () => {
  const { callGemini, isLoading, error, getSystemPrompt } = useGemini();
  const [topic, setTopic] = useState('');
  const [generatedPost, setGeneratedPost] = useState<{ title: string; body: string } | null>(null);

  const handleGenerateRedditPost = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the Reddit post.');
      return;
    }

    setGeneratedPost(null);
    const systemPrompt = getSystemPrompt() + " Generate a Reddit post. Provide a catchy title and a short, engaging body. Format your response with 'Title: [Your Title]' and 'Body: [Your Body]'. Do not include any introductory or concluding remarks.";
    const userPrompt = `Generate a Reddit post about: ${topic}`;

    const result = await callGemini(userPrompt, systemPrompt);
    if (result) {
      const titleMatch = result.match(/Title:\s*(.*)/i);
      const bodyMatch = result.match(/Body:\s*([\s\S]*)/i);

      if (titleMatch && bodyMatch) {
        setGeneratedPost({
          title: titleMatch[1].trim(),
          body: bodyMatch[1].trim(),
        });
        toast.success('Reddit post generated successfully!');
      } else {
        setGeneratedPost({
          title: 'Generation Error',
          body: 'Could not parse the generated post. Please try again or refine your topic.',
        });
        toast.error('Failed to parse generated Reddit post.');
      }
    } else if (error) {
      toast.error(`Failed to generate Reddit post: ${error}`);
    }
  };

  const handleCopyPost = () => {
    if (generatedPost) {
      const fullPost = `Title: ${generatedPost.title}\n\n${generatedPost.body}`;
      navigator.clipboard.writeText(fullPost);
      toast.success('Reddit post copied to clipboard!');
    } else {
      toast.error('No post to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Reddit Post Generator</h2>
      <p className="text-sm text-gray-400 mb-4">Generate engaging Reddit posts with titles and body content based on your persona.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Topic for Reddit Post</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter the topic for your Reddit post (e.g., 'a new rule for my subs', 'my latest conquest', 'a public humiliation')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            disabled={isLoading}
          />
          <Button
            onClick={handleGenerateRedditPost}
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
            <>
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Title:</h3>
                  <Textarea
                    value={generatedPost.title}
                    readOnly
                    rows={2}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none font-semibold"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-1">Body:</h3>
                  <Textarea
                    value={generatedPost.body}
                    readOnly
                    rows={6}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
                  />
                </div>
              </div>
              <Button
                onClick={handleCopyPost}
                className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
              >
                <Copy className="mr-2 h-4 w-4" /> Copy Reddit Post
              </Button>
            </>
          ) : (
            <p className="text-gray-500 text-center">Your generated Reddit post will appear here...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RedditGeneratorPage;