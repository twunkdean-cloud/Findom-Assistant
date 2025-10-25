import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useGemini } from '@/hooks/use-gemini';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from 'sonner';
import { Loader2, Copy, Image } from 'lucide-react';

const CaptionGeneratorPage: React.FC = () => {
  const { callGemini, isLoading } = useGemini();
  const { getSystemPrompt } = useGenderedContent();
  const [imageDescription, setImageDescription] = useState('');
  const [captionStyle, setCaptionStyle] = useState('dominant');
  const [output, setOutput] = useState('');

  const generateCaption = async () => {
    if (!imageDescription.trim()) {
      toast.error('Please describe the image for the caption.');
      return;
    }

    try {
      const systemPrompt = getSystemPrompt('caption');
      const userPrompt = `Generate a caption for this image: ${imageDescription}`;
      
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        setOutput(result);
        toast.success('Caption generated successfully');
      }
    } catch (error) {
      toast.error('Failed to generate caption');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Caption Generator</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Image Description</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Describe the image</label>
              <Textarea
                value={imageDescription}
                onChange={(e) => setImageDescription(e.target.value)}
                placeholder="Describe the image for the caption..."
                rows={3}
                className="bg-gray-900 border-gray-700 text-gray-200"
              />
            </div>

            <div>
              <label className="text-sm text-gray-300 mb-2 block">Caption Style</label>
              <select
                value={captionStyle}
                onChange={(e) => setCaptionStyle(e.target.value)}
                className="w-full p-2 bg-gray-900 border-gray-600 rounded text-gray-200"
              >
                <option value="dominant">Dominant</option>
                <option value="seductive">Seductive</option>
                <option value="strict">Strict</option>
                <option value="caring">Caring</option>
              </select>
            </div>

            <Button
              onClick={generateCaption}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Generate Caption
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Generated Caption</CardTitle>
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
              <div className="text-center py-8">
                <Image className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500">Your generated caption will appear here...</p>
              </div>
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

export default CaptionGeneratorPage;