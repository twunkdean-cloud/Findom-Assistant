import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMobile } from '@/hooks/use-mobile';
import { PullToRefresh } from '@/components/PullToRefresh';
import { MobileOptimizedCard } from '@/components/MobileOptimizedCard';
import { MobileLoadingSpinner } from '@/components/MobileLoadingSpinner';
import { useGestures } from '@/hooks/use-gestures';
import { toast } from 'sonner';
import { Bot, Brain, History, MessageSquare } from 'lucide-react';
import { LazyWrapper } from '@/utils/lazy-loading';

// Lazy load AI components
import {
  LazyAIContentSuggestions,
  LazySentimentAnalysis,
  LazyAIChatbot
} from '@/components/lazy';

const ChatAssistantPage: React.FC = () => {
  const { isMobile } = useMobile();
  const [activeTab, setActiveTab] = useState('chat');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
    toast.success('Chat refreshed');
  };

  useGestures(containerRef, {
    onSwipeLeft: () => {
      if (activeTab === 'chat') setActiveTab('suggestions');
      else if (activeTab === 'suggestions') setActiveTab('sentiment');
      else if (activeTab === 'sentiment') setActiveTab('chat');
    },
    onSwipeRight: () => {
      if (activeTab === 'chat') setActiveTab('sentiment');
      else if (activeTab === 'sentiment') setActiveTab('suggestions');
      else if (activeTab === 'suggestions') setActiveTab('chat');
    }
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6" ref={containerRef}>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">AI Assistant</h1>
          {isMobile && (
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab('chat')}
                className={`px-3 py-1 rounded text-sm ${
                  activeTab === 'chat' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <Bot className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveTab('suggestions')}
                className={`px-3 py-1 rounded text-sm ${
                  activeTab === 'suggestions' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <Brain className="h-4 w-4" />
              </button>
              <button
                onClick={() => setActiveTab('sentiment')}
                className={`px-3 py-1 rounded text-sm ${
                  activeTab === 'sentiment' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                }`}
              >
                <History className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {isMobile ? (
          <MobileOptimizedCard>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="chat" className="flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  Chat
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI
                </TabsTrigger>
                <TabsTrigger value="sentiment" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Analysis
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="chat" className="mt-4">
                <LazyWrapper>
                  <LazyAIChatbot />
                </LazyWrapper>
              </TabsContent>
              
              <TabsContent value="suggestions" className="mt-4">
                <LazyWrapper>
                  <LazyAIContentSuggestions />
                </LazyWrapper>
              </TabsContent>
              
              <TabsContent value="sentiment" className="mt-4">
                <LazyWrapper>
                  <LazySentimentAnalysis />
                </LazyWrapper>
              </TabsContent>
            </Tabs>
          </MobileOptimizedCard>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="h-5 w-5 text-blue-500" />
                  AI Chatbot
                </CardTitle>
              </CardHeader>
              <CardContent>
                <LazyWrapper>
                  <LazyAIChatbot />
                </LazyWrapper>
              </CardContent>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="h-5 w-5 text-purple-500" />
                    AI Content Suggestions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LazyWrapper>
                    <LazyAIContentSuggestions />
                  </LazyWrapper>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <History className="h-5 w-5 text-green-500" />
                    Sentiment Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <LazyWrapper>
                    <LazySentimentAnalysis />
                  </LazyWrapper>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {isRefreshing && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <MobileLoadingSpinner />
          </div>
        )}
      </div>
    </PullToRefresh>
  );
};

export default ChatAssistantPage;