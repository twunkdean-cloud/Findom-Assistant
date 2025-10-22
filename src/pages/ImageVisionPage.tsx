"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Loader2, Copy, Image as ImageIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { useGemini } from '@/hooks/use-gemini';

const ImageVisionPage = () => {
  const { appData, updateAppData } = useFindom();
  const { getSystemPrompt } = useGemini();
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [usedPrompt, setUsedPrompt] = useState<string>('');

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
        updateAppData('uploadedImageData', {
          mimeType: file.type,
          data: (reader.result as string).split(',')[1],
        });
        setGeneratedDescription('');
        setUsedPrompt('');
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl(null);
      updateAppData('uploadedImageData', null);
      setUsedPrompt('');
    }
  };

  const handleGenerateDescription = async (persona: 'dominant' | 'submissive' | 'switch') => {
    if (!appData.uploadedImageData) {
      toast.error("Please upload a photo first.");
      return;
    }
    if (!appData.apiKey) {
      toast.error("Please set your Gemini API key in Settings.");
      return;
    }

    setIsLoading(true);
    setGeneratedDescription('Generating description...');

    const basePersonaContext = getSystemPrompt();

    let specificImageInstruction = '';
    switch (persona) {
      case 'dominant':
        specificImageInstruction = `Analyze the uploaded image and generate a detailed AI image editing prompt that will transform the photo to radiate dominant, commanding energy. Focus on visual elements that convey power, authority, and control. Include specific instructions for lighting (dramatic, high contrast), pose adjustments (upright, confident stance), facial expressions (intense, commanding gaze), clothing elements (luxury fabrics, tailored fits), and environmental details that emphasize dominance. The prompt should guide an AI to create an image where the subject appears powerful, in control, and authoritative.`;
        break;
      case 'submissive':
        specificImageInstruction = `Analyze the uploaded image and generate a detailed AI image editing prompt that will transform the photo to radiate gentle, respectful energy. Focus on visual elements that convey humility, reverence, and obedience. Include specific instructions for lighting (softer, more gentle), pose adjustments (kneeling, bowed head, respectful posture), facial expressions (adoring, humble, worshipful), clothing elements (simpler fabrics, respectful attire), and environmental details that emphasize gentleness. The prompt should guide an AI to create an image where the subject appears respectful, humble, and gentle.`;
        break;
      case 'switch':
        specificImageInstruction = `Analyze the uploaded image and generate a detailed AI image editing prompt that will transform the photo to radiate versatile energy, blending both commanding and gentle qualities. Focus on visual elements that convey duality, adaptability, and magnetic presence. Include specific instructions for lighting (dynamic, shifting shadows), pose adjustments (confident yet approachable stance), facial expressions (intriguing, multifaceted gaze), clothing elements (mix of authoritative and subtle elements), and environmental details that highlight versatility. The prompt should guide an AI to create an image where the subject appears both powerful and approachable, embodying multiple facets.`;
        break;
    }

    const fullPromptToSend = `${basePersonaContext} ${specificImageInstruction}`;
    setUsedPrompt(fullPromptToSend);

    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://qttmhbtaguiioomcjqbt.supabase.co';
      const functionUrl = `${supabaseUrl}/functions/v1/generate-image`;
      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPromptToSend,
          imageData: appData.uploadedImageData.data,
          imageMimeType: appData.uploadedImageData.mimeType,
        }),
      });

      if (!response.ok) {
        const errorText = await response.json();
        throw new Error(errorText.error || `Server returned status ${response.status}`);
      }

      const result = await response.json();
      setGeneratedDescription(result.description);
      toast.success('Image description generated!');
    } catch (error: any) {
      console.error('Image Vision Error:', error);
      setGeneratedDescription('Failed to generate description. Ensure the Supabase Edge Function is deployed and the GEMINI_API_KEY secret is set.');
      toast.error(`Error: ${error.message}. Backend API required.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyDescription = () => {
    if (generatedDescription.trim() && generatedDescription !== 'Generating description...') {
      navigator.clipboard.writeText(generatedDescription.trim());
      toast.success('Description copied to clipboard!');
    } else {
      toast.error('No description to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">AI Image Vision</h2>
      <p className="text-sm text-gray-400 mb-4">Upload a photo, choose a persona, and get an AI image editing prompt to transform your image with the desired energy.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        <div className="space-y-4">
          <Card className="bg-gray-800 border border-gray-700 p-4">
            <CardTitle className="text-lg font-semibold mb-2">1. Upload Photo</CardTitle>
            <Input
              id="image-upload"
              type="file"
              accept="image/png, image/jpeg, image/webp"
              onChange={handleImageUpload}
              className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
            />
            {imagePreviewUrl && (
              <img src={imagePreviewUrl} alt="Image preview" className="mt-4 rounded-md max-h-64 mx-auto" />
            )}
          </Card>

          <Card className="bg-gray-800 border border-gray-700 p-4">
            <CardTitle className="text-lg font-semibold mb-3">2. Choose Energy & Generate Prompt</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={() => handleGenerateDescription('dominant')}
                disabled={!appData.uploadedImageData || isLoading}
                className="flex-1 bg-red-600 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                😈 Dominant
              </Button>
              <Button
                onClick={() => handleGenerateDescription('submissive')}
                disabled={!appData.uploadedImageData || isLoading}
                className="flex-1 bg-blue-600 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                😇 Submissive
              </Button>
              <Button
                onClick={() => handleGenerateDescription('switch')}
                disabled={!appData.uploadedImageData || isLoading}
                className="flex-1 bg-purple-600 text-white font-bold py-3 px-4 rounded-md flex items-center justify-center hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                ⚡️ Switch
              </Button>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="bg-gray-800 border border-gray-700 p-4 min-h-[150px] flex flex-col justify-center items-center">
            <CardTitle className="text-lg font-semibold mb-3">Generated Image Editing Prompt</CardTitle>
            <div className="w-full">
              {generatedDescription ? (
                <div className="space-y-3">
                  <Textarea
                    value={generatedDescription}
                    readOnly
                    rows={6}
                    className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
                  />
                  <Button
                    onClick={handleCopyDescription}
                    disabled={!generatedDescription.trim() || generatedDescription === 'Generating description...'}
                    className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
                  >
                    <Copy className="mr-2 h-4 w-4" /> Copy Prompt
                  </Button>
                </div>
              ) : (
                <div className="text-center py-8">
                  <ImageIcon className="mx-auto h-12 w-12 text-gray-500 mb-4" />
                  <p className="text-gray-500">Your AI image editing prompt will appear here...</p>
                </div>
              )}
            </div>
          </Card>

          {usedPrompt && (
            <Card className="bg-gray-800 border border-gray-700 p-4">
              <CardTitle className="text-lg font-semibold mb-3">Prompt Used</CardTitle>
              <Textarea
                value={usedPrompt}
                readOnly
                rows={6}
                className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
              />
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageVisionPage;