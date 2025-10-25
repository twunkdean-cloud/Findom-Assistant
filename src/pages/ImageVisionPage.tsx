import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGemini } from '@/hooks/use-gemini';
import { toast } from 'sonner';
import { Upload, Loader2, Eye, Copy } from 'lucide-react';

const ImageVisionPage: React.FC = () => {
  const { callGeminiVision, isLoading } = useGemini();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [prompt, setPrompt] = useState('');
  const [analysis, setAnalysis] = useState('');

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64String = reader.result as string;
        const result = await callGeminiVision(base64String, prompt);
        if (result) {
          setAnalysis(result);
          toast.success('Image analyzed successfully');
        }
      };
      reader.readAsDataURL(selectedImage);
    } catch (error) {
      toast.error('Failed to analyze image');
    }
  };

  const copyAnalysis = () => {
    navigator.clipboard.writeText(analysis);
    toast.success('Analysis copied to clipboard');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-100">Image Vision Analysis</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Upload Image</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Select Image</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="w-full p-2 bg-gray-900 border-gray-600 rounded text-gray-200"
              />
            </div>

            {imagePreview && (
              <div className="mt-4">
                <img
                  src={imagePreview}
                  alt="Selected"
                  className="max-h-64 mx-auto rounded"
                />
                <Button
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview('');
                  }}
                  variant="outline"
                  className="mt-2 border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Remove Image
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Analysis Prompt</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm text-gray-300 mb-2 block">Analysis Prompt</label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="What would you like to know about this image?"
                rows={3}
                className="w-full p-2 bg-gray-900 border-gray-700 text-gray-200"
              />
            </div>

            <Button
              onClick={analyzeImage}
              disabled={isLoading || !selectedImage}
              className="w-full bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              <Eye className="mr-2 h-4 w-4" />
              Analyze Image
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Analysis Results</CardTitle>
          </CardHeader>
          <CardContent>
            {analysis ? (
              <Textarea
                value={analysis}
                readOnly
                rows={8}
                className="w-full p-2 bg-gray-900 border-gray-700 text-gray-200"
              />
            ) : (
              <p className="text-gray-500 text-center py-8">Your image analysis will appear here...</p>
            )}
            
            <Button
              onClick={copyAnalysis}
              disabled={!analysis}
              className="w-full bg-blue-600 hover:bg-blue-700 mt-4"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy Analysis
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImageVisionPage;