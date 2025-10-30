import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/use-ai';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from '@/utils/toast';
import { Loader2, Copy, Image } from 'lucide-react';
import { usePersona, PersonaTone } from '@/hooks/use-persona';

const CaptionGeneratorPage = () => {
  const { callGemini, isLoading, error } = useAI();
  const { getSystemPrompt, getPersonaTones, isMale, isFemale } = useGenderedContent();
  const { persona, gender, presets, buildSystemPrompt } = usePersona();
  const [imageDescription, setImageDescription] = useState('');
  const [captionStyle, setCaptionStyle] = useState<PersonaTone>(persona as PersonaTone);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [nextTone, setNextTone] = useState<PersonaTone | null>(null);

  const handleGenerateCaption = async () => {
    if (!imageDescription.trim()) {
      toast.error('Please describe the image for the caption.');
      return;
    }

    setGeneratedCaption('');
    const systemPrompt = buildSystemPrompt('caption', { tone: (nextTone || persona) as PersonaTone, gender }) + `
Generate a ${captionStyle} caption for a photo based on the user's description. 
Include relevant emojis and hashtags. 
Do not include any introductory or concluding remarks, just the caption content.`;
    
    const userPrompt = `Generate a caption for this image: ${imageDescription}`;

    const result = await callGemini(userPrompt, systemPrompt);
    setNextTone(null);
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

  const getCaptionStyles = () => {
    const tones = getPersonaTones();
    return Object.entries(tones).map(([value, description]) => ({
      value,
      label: `${value.charAt(0).toUpperCase() + value.slice(1)} - ${description}`
    }));
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Caption Generator</h2>
      <p className="text-sm text-gray-400 mb-4">
        Generate compelling captions for various platforms based on image description and your {isMale ? 'Findom' : 'Femdom'} persona.
      </p>

      <Card className="bg-card border p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Image Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Quick tone for this caption:</span>
            {presets.map(p => (
              <Button
                key={p}
                size="sm"
                variant={nextTone === p ? 'default' : 'outline'}
                className={`${nextTone === p ? 'bg-indigo-600 text-white' : ''}`}
                onClick={() => setNextTone(prev => (prev === p ? null : p))}
                disabled={isLoading}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
          <Textarea
            placeholder={`Describe the image (e.g., ${isMale
              ? "'me in black boots holding a whip', 'close-up of my feet in black nail polish', 'sitting on a throne looking dominant'"
              : "'me in heels holding a crop', 'close-up of my red nails', 'lounging on velvet like a queen'"})`}
            value={imageDescription}
            onChange={(e) => setImageDescription(e.target.value)}
            rows={3}
            disabled={isLoading}
          />
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Caption Style</label>
            <select
              value={captionStyle}
              onChange={(e) => setCaptionStyle(e.target.value as PersonaTone)}
              className="w-full p-2 bg-background border rounded"
              disabled={isLoading}
            >
              {getCaptionStyles().map((style) => (
                <option key={style.value} value={style.value}>
                  {style.label}
                </option>
              ))}
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

      <Card className="bg-card border p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generated Caption</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedCaption ? (
            <Textarea
              value={generatedCaption}
              readOnly
              rows={4}
              className="resize-none"
            />
          ) : (
            <div className="text-center py-8">
              <Image className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">Your generated caption will appear here...</p>
            </div>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-400">
              {generatedCaption.length}/500 characters
            </span>
            <Button
              onClick={handleCopyCaption}
              disabled={!generatedCaption.trim()}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Caption
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaptionGeneratorPage;