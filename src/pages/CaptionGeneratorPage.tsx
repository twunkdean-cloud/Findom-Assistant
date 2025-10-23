import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGemini } from '@/hooks/use-gemini';
import { toast } from 'sonner';
import { Loader2, Copy, Image } from 'lucide-react';

const CaptionGeneratorPage = () => {
  const { callGemini, isLoading, error, getSystemPrompt } = useGemini();
  const [imageDescription, setImageDescription] = useState('');
  const [captionStyle, setCaptionStyle] = useState('dominant');
  const [generatedCaption, setGeneratedCaption] = useState('');

  const getSystemPrompt = (): string => {
    return `You are a confident, experienced MALE FOR MALE findom content creator who knows how to write compelling captions.
    This is specifically for MALE DOMINANTS and MALE SUBMISSIVES in the findom lifestyle.
    Write naturally, conversationally, and authentically - like you're talking to a friend or client.
    Use contractions (you're, can't, won't) and natural language patterns.
    Avoid corporate-speak, overly formal language, or AI-like phrases.
    Be direct, bold, and unapologetic in your tone.
    Focus on real scenarios, practical advice, and genuine findom dynamics between men.
    Keep it real, keep it authentic, and always maintain that dominant but natural energy.
    No "as an AI" or similar phrases - just straight, authentic content.
    IMPORTANT: This is MALE FOR MALE findom only. Never mention women, goddess, femdom, or any female-related content. All content should be focused on male-male dynamics.
    
    For captions:
    - Match the tone to the image/content type
    - Include relevant hashtags for the platform
    - Be provocative but engaging
    - Focus on male-male findom dynamics
    - Include clear calls to action when appropriate`;
  };

  const handleGenerateCaption = async () => {
    if (!imageDescription.trim()) {
      toast.error('Please describe the image for the caption.');
      return;
    }

    setGeneratedCaption('');
    const systemPrompt = getSystemPrompt() + ` Generate a ${captionStyle} caption for a photo based on the user's description. Include relevant emojis and hashtags. Do not include any introductory or concluding remarks, just the caption content.`;
    const userPrompt = `Generate a caption for this image: ${imageDescription}`;

    const result = await callGemini(userPrompt, systemPrompt);
    if (result) {
      setGeneratedCaption(result);
      toast.success('Caption generated successfully!');
    } else if (error) {
      toast.error(`Failed to generate caption: ${error}`);
    }
  };

  const handleCopyCaption = () => {
    if (generatedCaption.trim()) {
      navigator.clipboard.writeText(generatedCaption.trim());
      toast.success('Caption copied to clipboard!');
    } else {
      toast.error('No caption to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Caption Generator</h2>
      <p className="text-sm text-gray-400 mb-4">Generate engaging captions for your photos based on image description.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Image Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="Describe the image (e.g., 'me in black heels holding a whip', 'close-up of my feet in red nail polish', 'sitting on a throne looking dominant')"
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
            rows={3}
            className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
            disabled={isLoading}
          />
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Caption Style</label>
            <select
              value={captionStyle}
              onChange={(e) => setCaptionStyle(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              disabled={isLoading}
            >
              <option value="dominant">Dominant</option>
              <option value="seductive">Seductive</option>
              <option value="humiliating">Humiliating</option>
              <option value="financial">Financial Focus</option>
            </select>
          </div>
          <Button
            onClick={handleGenerateCaption}
            disabled={isLoading || !imageDescription.trim()}
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
        <CardContent className="space-y-4">
          {generatedCaption ? (
            <Textarea
              value={generatedCaption}
              readOnly
              rows={4}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
            />
          ) : (
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">Your generated caption will appear here...</p>
            </div>
          )}
          <Button
            onClick={handleCopyCaption}
            disabled={!generatedCaption.trim()}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Caption
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptionGeneratorPage;