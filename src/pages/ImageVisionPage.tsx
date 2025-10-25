import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGemini } from '@/hooks/use-gemini';
import { toast } from 'sonner';
import { Upload, Loader2, Eye, Copy } from 'lucide-react';

const ImageVisionPage = () => {
  const { callGeminiVision, isLoading, error } = useGemini();
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

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image first');
      return;
    }

    // Convert file to base64
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64String = reader.result as string;
      const result = await callGeminiVision(base64String, prompt);
      if (result) {
        setAnalysis(result);
        toast.success('Image analyzed successfully!');
      } else if (error) {
        toast.error(`Failed to analyze image: ${error}`);
      }
    };
    reader.readAsDataURL(selectedImage);
  };

  const handleCopyAnalysis = () => {
    if (analysis.trim()) {
      navigator.clipboard.writeText(analysis.trim());
      toast.success('Analysis copied to clipboard!');
    } else {
      toast.error('No analysis to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Image Vision Analysis</h2>
      <p className="text-sm text-gray-400 mb-4">
        Upload an image and get AI-powered analysis based on your persona and preferences.
      </p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            {imagePreview ? (
              <div className="space-y-4">
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
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-500 mx-auto" />
                <div>
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <span className="text-indigo-400 hover:text-indigo-300">
                      Click to upload an image
                    </span>
                    <input
                      id="image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                  </label>
                  <p className="text-gray-500 text-sm mt-2">
                    or drag and drop
                  </p>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Analysis Prompt (Optional)</label>
            <Textarea
              placeholder="What would you like to know about this image?"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              rows={3}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleAnalyzeImage}
            disabled={isLoading || !selectedImage}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 w-full flex items-center justify-center"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Eye className="mr-2 h-4 w-4" />
            Analyze Image
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Analysis Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {analysis ? (
            <Textarea
              value={analysis}
              readOnly
              rows={8}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
            />
          ) : (
            <p className="text-gray-500 text-center">Your image analysis will appear here...</p>
          )}
          <Button
            onClick={handleCopyAnalysis}
            disabled={!analysis.trim()}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Analysis
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ImageVisionPage;