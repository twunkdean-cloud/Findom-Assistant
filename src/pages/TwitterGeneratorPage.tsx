import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/use-ai';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from '@/utils/toast';
import { Loader2, Copy } from 'lucide-react';
import { usePersona, PersonaTone } from '@/hooks/use-persona';

const TwitterGeneratorPage = () => {
  const { callGemini, isLoading, error } = useAI();
  const { getSystemPrompt, getHashtags, isMale, isFemale } = useGenderedContent();
  const { persona, gender, presets, buildSystemPrompt } = usePersona();
  const [topic, setTopic] = useState('');
  const [generatedTweet, setGeneratedTweet] = useState('');
  const [nextTone, setNextTone] = useState<PersonaTone | null>(null);

  const handleGenerateTweet = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic for the tweet.');
      return;
    }

    setGeneratedTweet('');
    const systemPrompt = buildSystemPrompt('twitter', { tone: (nextTone || persona) as PersonaTone, gender }) + `
Generate a single tweet (max 280 characters) based on the user's topic.
Include relevant emojis and hashtags.
Do not include any introductory or concluding remarks, just the tweet content.`;

    setNextTone(null);
    
    const userPrompt = `Generate a tweet about: ${topic}`;

    const result = await callGemini(userPrompt, systemPrompt);
    if (result) {
      setGeneratedTweet(result);
      toast.success('Tweet generated successfully!');
    } else if (error) {
      toast.error(`Failed to generate tweet: ${error}`);
    }
  };

  const handleCopyTweet = () => {
    if (generatedTweet.trim()) {
      navigator.clipboard.writeText(generatedTweet.trim());
      toast.success('Tweet copied to clipboard!');
    } else {
      toast.error('No tweet to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Tweet Generator</h2>
      <p className="text-sm text-muted-foreground mb-4">
        Generate engaging tweets based on your {isMale ? 'Findom' : 'Femdom'} persona and a given topic.
      </p>

      <Card className="bg-card border p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Topic for Tweet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">Quick tone for this tweet:</span>
            {presets.map(p => (
              <Button
                key={p}
                size="sm"
                variant={nextTone === p ? 'default' : 'outline'}
                className={`${nextTone === p ? 'bg-indigo-600 text-white' : 'border-gray-700 text-foreground'}`}
                onClick={() => setNextTone(prev => (prev === p ? null : p))}
                disabled={isLoading}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </Button>
            ))}
          </div>
          <Textarea
            placeholder={`Enter the topic for your tweet (e.g., ${isMale 
              ? "'a sub sending tribute', 'my dominance', 'foot worship'" 
              : "'a worshipper serving me', 'my divine power', 'paypig obedience'"})`}
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            rows={3}
            className="w-full p-2 bg-background border rounded text-foreground"
            disabled={isLoading}
          />
          <Button
            onClick={handleGenerateTweet}
            disabled={isLoading || !topic.trim()}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 w-full flex items-center justify-center"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Tweet
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-card border p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generated Tweet</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedTweet ? (
            <Textarea
              value={generatedTweet}
              readOnly
              rows={4}
              className="w-full p-2 bg-background border rounded text-muted-foreground resize-none"
            />
          ) : (
            <p className="text-muted-foreground text-center">Your generated tweet will appear here...</p>
          )}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {generatedTweet.length}/280 characters
            </span>
            <Button
              onClick={handleCopyTweet}
              disabled={!generatedTweet.trim()}
              className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy Tweet
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TwitterGeneratorPage;