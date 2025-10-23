import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useGemini } from '@/hooks/use-gemini';
import { toast } from 'sonner';
import { Loader2, Upload, Copy, Camera, Image as ImageIcon } from 'lucide-react';

const ImageVisionPage = () => {
  const { callGeminiVision, isLoading, error } = useGemini();
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [analysisResult, setAnalysisResult] = useState('');
  const [analysisType, setAnalysisType] = useState('findom');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Image size must be less than 10MB');
        return;
      }
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return;
      }
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      setAnalysisResult('');
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      toast.error('Please select an image to analyze');
      return;
    }

    setAnalysisResult('');
    
    let prompt = '';
    switch (analysisType) {
      case 'findom':
        prompt = 'Analyze this image from a findom perspective. Describe the dominant elements, power dynamics, and how it could be used for financial domination. Be detailed and specific.';
        break;
      case 'caption':
        prompt = 'Generate a compelling caption for this image from a dominant findom perspective. Include relevant emojis and hashtags.';
        break;
      case 'content':
        prompt = 'Analyze this image for content creation potential. What kind of content could be created with this image? What platforms would work best?';
        break;
      default:
        prompt = 'Analyze this image and provide detailed observations.';
    }

    const result = await callGeminiVision(selectedImage, prompt);
    if (result) {
      setAnalysisResult(result);
      toast.success('Image analyzed successfully!');
    } else if (error) {
      toast.error(`Failed to analyze image: ${error}`);
    }
  };

  const handleCopyResult = () => {
    if (analysisResult.trim()) {
      navigator.clipboard.writeText(analysisResult.trim());
      toast.success('Analysis copied to clipboard!');
    } else {
      toast.error('No analysis to copy.');
    }
  };

  const handleReset = () => {
    setSelectedImage(null);
    setImageUrl('');
    setAnalysisResult('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Image Vision Analysis</h2>
      <p className="text-sm text-gray-400 mb-4">Upload images for AI-powered analysis and content generation.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Upload Image</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300">Analysis Type</label>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              disabled={isLoading}
            >
              <option value="findom">Findom Analysis</option>
              <option value="caption">Caption Generation</option>
              <option value="content">Content Potential</option>
            </select>
          </div>
          
          <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center">
            {imageUrl ? (
              <div className="space-y-4">
                <img
                  src={imageUrl}
                  alt="Selected"
                  className="max-h-64 mx-auto rounded-lg"
                />
                <p className="text-sm text-gray-400">{selectedImage?.name}</p>
                <Button
                  onClick={handleReset}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  Remove Image
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <ImageIcon className="h-12 w-12 text-gray-600 mx-auto" />
                <div>
                  <p className="text-gray-400 mb-2">Drop an image here or click to browse</p>
                  <p className="text-xs text-gray-500">Supports JPG, PNG, GIF up to 10MB</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageSelect}
                  className="hidden"
                />
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="border-gray-600 text-gray-300 hover:bg-gray-700"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Choose Image
                </Button>
              </div>
            )}
          </div>

          {selectedImage && (
            <Button
              onClick={handleAnalyzeImage}
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing Image...
                </>
              ) : (
                <>
                  <Camera className="mr-2 h-4 w-4" />
                  Analyze Image
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {analysisResult && (
        <Card className="bg-gray-800 border border-gray-700 p-4">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Analysis Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={analysisResult}
              readOnly
              rows={8}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
            />
            <Button
              onClick={handleCopyResult}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Analysis
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ImageVisionPage;