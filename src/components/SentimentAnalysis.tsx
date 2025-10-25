import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useFindom } from '@/context/FindomContext';
import { useAI } from '@/hooks/use-ai';
import { toast } from '@/utils/toast';
import { Brain, TrendingUp, AlertTriangle, MessageSquare, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const SentimentAnalysis = () => {
  const { appData } = useFindom();
  const { analyzeSubConversation, analytics, isLoading } = useAI();
  const [selectedSub, setSelectedSub] = useState('');

  const handleAnalyze = async () => {
    if (!selectedSub) {
      toast.error('Please select a sub first');
      return;
    }

    const sub = appData.subs.find(s => s.name === selectedSub);
    if (!sub) {
      toast.error('Sub not found');
      return;
    }

    if (!sub.conversationHistory) {
      toast.error('No conversation history found for this sub');
      return;
    }

    await analyzeSubConversation({ conversationHistory: sub.conversationHistory as string, subName: sub.name });
    toast.success('Analysis complete!');
  };

  const getSentimentColor = (score: number) => {
    if (score > 50) return 'text-green-400';
    if (score > 0) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getSentimentIcon = (score: number) => {
    if (score > 50) return <TrendingUp className="h-5 w-5 text-green-400" />;
    if (score > 0) return <MessageSquare className="h-5 w-5 text-yellow-400" />;
    return <AlertTriangle className="h-5 w-5 text-red-400" />;
  };

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'low': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low': return 'bg-green-600';
      case 'medium': return 'bg-yellow-600';
      case 'high': return 'bg-red-600';
      default: return 'bg-gray-600';
    }
  };

  const subsWithHistory = appData.subs.filter(sub => sub.conversationHistory);

  return (
    <Card className="bg-gray-800 border border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Brain className="mr-2 h-5 w-5 text-indigo-400" />
          Sentiment Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex space-x-4">
          <div className="flex-1">
            <label className="text-sm text-gray-300 mb-2 block">Select Sub</label>
            <Select value={selectedSub} onValueChange={setSelectedSub}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Choose a sub with conversation history" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {subsWithHistory.length > 0 ? (
                  subsWithHistory.map((sub) => (
                    <SelectItem key={sub.id} value={sub.name}>
                      {sub.name}
                    </SelectItem>
                  ))
                ) : (
                  <div className="p-2 text-center text-sm text-gray-500">No subs with conversation history.</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Button
              onClick={handleAnalyze}
              disabled={isLoading || !selectedSub}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Brain className="mr-2 h-4 w-4" />
              Analyze
            </Button>
          </div>
        </div>

        {analytics && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Sentiment Score</span>
                    {getSentimentIcon(analytics.sentimentScore)}
                  </div>
                  <div className={`text-2xl font-bold ${getSentimentColor(analytics.sentimentScore)}`}>
                    {analytics.sentimentScore > 0 ? '+' : ''}{analytics.sentimentScore}
                  </div>
                  <Progress 
                    value={Math.max(0, Math.min(100, (analytics.sentimentScore + 100) / 2))} 
                    className="mt-2"
                  />
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Engagement</span>
                    <MessageSquare className="h-5 w-5 text-blue-400" />
                  </div>
                  <Badge className={`${getEngagementColor(analytics.engagementLevel)} text-white`}>
                    {analytics.engagementLevel.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-400">Risk Level</span>
                    {analytics.riskLevel === 'low' ? (
                      <CheckCircle className="h-5 w-5 text-green-400" />
                    ) : (
                      <XCircle className="h-5 w-5 text-red-400" />
                    )}
                  </div>
                  <Badge className={`${getRiskColor(analytics.riskLevel)} text-white`}>
                    {analytics.riskLevel.toUpperCase()}
                  </Badge>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Suggested Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analytics.suggestedActions.map((action, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{action}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>

              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg">Content Suggestions</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analytics.contentSuggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <Sparkles className="h-4 w-4 text-indigo-400 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-gray-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SentimentAnalysis;