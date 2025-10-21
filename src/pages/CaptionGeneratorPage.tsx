import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGemini } from '@/hooks/use-gemini';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const CaptionGeneratorPage = () => {
  const { callGemini, isLoading, error, getSystemPrompt } = useGemini();
  const [topic, setTopic] = useState('');
  const [generatedCaption, setGeneratedCaption] = useState('');

  const handleGenerateCaption = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the caption.');
      return;
    }

    setGeneratedCaption('');
    const systemPrompt = getSystemPrompt() + " Generate a short, engaging caption (max 500 characters) based on the user's topic. Include relevant emojis and hashtags. Do not include any introductory or concluding remarks, just the caption content.";
    const userPrompt = `Generate a caption about: ${topic}`;

    const result = await callGemini(userPrompt, systemPrompt);
    if (result) {
      setGeneratedCaption(result);
      toast.success('Caption generated successfully!');
    } else if (error) {
      toast.error(`Failed to generate caption: ${error}`);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Caption Generator</h2>
      <p className="text-sm text-gray-400 mb-4">Generate compelling captions for various platforms based on themes and your persona.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Topic for Caption</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Enter the topic for your caption (e.g., 'my new outfit', 'a recent tribute', 'my power')"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            disabled={isLoading}
          />
          <Button
            onClick={handleGenerateCaption}
            disabled={isLoading || !topic.trim()}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 w-full flex items-center justify-center"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Caption
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generated Caption</CardTitle>
        </CardHeader>
        <CardContent>
          {generatedCaption ? (
            <p className="whitespace-pre-wrap text-gray-300">{generatedCaption}</p>
          ) : (
            <p className="text-gray-500 text-center">Your generated caption will appear here...</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptionGeneratorPage;