import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useFindom } from '@/context/FindomContext';
import { useAI } from '@/hooks/use-ai';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from '@/utils/toast';
import { Brain, Copy, Sparkles, Target, MessageSquare, CheckSquare } from 'lucide-react';

const AIContentSuggestions = () => {
  const { appData } = useFindom();
  const { generatePersonalizedContent, isLoading } = useAI();
  const { getPersonaTones, isMale, isFemale } = useGenderedContent();
  const [selectedSub, setSelectedSub] = useState('');
  const [contentType, setContentType] = useState<'caption' | 'task' | 'message'>('message');
  const [tone, setTone] = useState<'dominant' | 'caring' | 'strict' | 'playful'>('dominant');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const handleGenerateSuggestions = async () => {
    if (!selectedSub) {
      toast.error('Please select a sub first');
      return;
    }

    const sub = appData.subs.find(s => s.name === selectedSub);
    if (!sub) {
      toast.error('Sub not found');
      return;
    }

    const result = await generatePersonalizedContent({ sub, contentType, tone });
    if (result.success && result.data) {
      setSuggestions(result.data);
      toast.success('Content suggestions generated!');
    } else {
      toast.error(result.error || 'Failed to generate suggestions');
    }
  };

  const handleCopySuggestion = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Content copied to clipboard!');
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case 'caption': return <Target className="h-4 w-4" />;
      case 'task': return <CheckSquare className="h-4 w-4" />;
      case 'message': return <MessageSquare className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

  const getToneColor = (tone: string) => {
    switch (tone) {
      case 'dominant': return 'bg-red-600';
      case 'caring': return 'bg-blue-600';
      case 'strict': return 'bg-purple-600';
      case 'playful': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getToneOptions = () => {
    const tones = getPersonaTones();
    return tones.map((option) => ({
      value: option.value,
      label: `${option.label} - ${option.description.split(',')[0]}`
    }));
  };

  return (
    <Card className="bg-gray-800 border border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center text-foreground">
          <Brain className="mr-2 h-5 w-5 text-indigo-400" />
          AI Content Suggestions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Select {isMale ? 'Sub' : 'Worshipper'}</label>
            <Select value={selectedSub} onValueChange={setSelectedSub}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder={`Choose a ${isMale ? 'sub' : 'worshipper'}`} />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {appData.subs.map((sub) => (
                  <SelectItem key={sub.id} value={sub.name}>
                    {sub.name} (${sub.total.toFixed(2)})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Content Type</label>
            <Select value={contentType} onValueChange={(value: any) => setContentType(value)}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="message">Personal Message</SelectItem>
                <SelectItem value="task">Task Assignment</SelectItem>
                <SelectItem value="caption">Social Caption</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Tone</label>
            <Select value={tone} onValueChange={(value: any) => setTone(value)}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {getToneOptions().map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          onClick={handleGenerateSuggestions}
          disabled={isLoading || !selectedSub}
          className="w-full bg-indigo-600 hover:bg-indigo-700"
        >
          <Sparkles className="mr-2 h-4 w-4" />
          Generate AI Suggestions
        </Button>

        {suggestions.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-gray-200">Generated Suggestions</h3>
            {suggestions.map((suggestion, index) => (
              <Card key={index} className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getContentTypeIcon(suggestion.type)}
                      <Badge className={`${getToneColor(suggestion.tone)} text-white`}>
                        {suggestion.tone}
                      </Badge>
                      <span className="text-sm text-gray-400 capitalize">{suggestion.type}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleCopySuggestion(suggestion.content)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-gray-200 mb-2">{suggestion.content}</p>
                  <p className="text-sm text-gray-500 italic">Why this works: {suggestion.reasoning}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AIContentSuggestions;