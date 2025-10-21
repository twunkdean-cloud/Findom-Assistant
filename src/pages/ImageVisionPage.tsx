import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea'; // Import Textarea for displaying the prompt
import { useGemini } from '@/hooks/use-gemini'; // Import useGemini to get the base system prompt

const ImageVisionPage = () => {
  const { appData, updateAppData } = useFindom();
  const { getSystemPrompt } = useGemini(); // Use getSystemPrompt to build the full prompt
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [generatedDescription, setGeneratedDescription] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [usedPrompt, setUsedPrompt] = useState<string>(''); // State for the prompt being used

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
        updateAppData('uploadedImageData', {
          mimeType: file.type,
          data: (reader.result as string).split(',')[1], // Base64 data
        });
        setGeneratedDescription('');
        setUsedPrompt(''); // Clear previous prompt
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl(null);
      updateAppData('uploadedImageData', null);
      setUsedPrompt(''); // Clear previous prompt
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

    // Get the base persona context from the useGemini hook
    const basePersonaContext = getSystemPrompt();

    let specificImageInstruction = '';
    switch (persona) {
      case 'dominant':
        specificImageInstruction = `Analyze the uploaded image. As a powerful and commanding dominant, craft a short, engaging caption (max 500 characters) that asserts control and authority. Emphasize your power, the submissive's devotion (if applicable), or the overall atmosphere of submission.`;
        break;
      case 'submissive':
        specificImageInstruction = `Analyze the uploaded image. As a devoted and obedient submissive, write a short, engaging caption (max 500 characters) that expresses reverence, admiration, and a desire to serve. Highlight the beauty or power of your superior (if applicable) or your own humble position.`;
        break;
      case 'switch':
        specificImageInstruction = `Analyze the uploaded image. As a versatile switch, create a short, engaging caption (max 500 characters) that subtly blends elements of both dominance and submission. Hint at the dynamic power exchange or the allure of both roles.`;
        break;
    }

    // Combine the base persona context with the specific image instruction
    // The baseSystemPrompt already includes instructions for emojis, hashtags, and no intro/outro.
    const fullPromptToSend = `${basePersonaContext} ${specificImageInstruction}`;
    setUsedPrompt(fullPromptToSend); // Set the prompt being used for display and API call

    // IMPORTANT: This part requires a backend to handle image processing with Gemini Vision API.
    // The current setup is client-side only and will not work without a server-side endpoint.
    // You will need to implement a backend API at '/api/generate-image' that takes the image data
    // and prompt, and then calls the Gemini Vision API.
    try {
      // Placeholder for backend API call
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: fullPromptToSend, // Send the detailed prompt to the backend
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
      setGeneratedDescription('Failed to generate description. This feature requires a backend API. Check console for details.');
      toast.error(`Error: ${error.message}. Backend API required.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">AI Image Vision</h2>
      <p className="text-sm text-gray-400 mb-4">Upload a photo, choose a persona, and get a descriptive caption from the AI.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Left Side: Upload & Controls */}
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
            <CardTitle className="text-lg font-semibold mb-3">2. Choose Persona & Generate Description</CardTitle>
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

        {/* Right Side: Output */}
        <div className="space-y-4">
          <Card className="bg-gray-800 border border-gray-700 p-4 min-h-[150px] flex flex-col justify-center items-center">
            <CardTitle className="text-lg font-semibold mb-3">Generated Description</CardTitle>
            <div className="w-full">
              {generatedDescription ? (
                <p className="whitespace-pre-wrap text-gray-300">{generatedDescription}</p>
              ) : (
                <p className="text-gray-500 text-center">Your generated description will appear here...</p>
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