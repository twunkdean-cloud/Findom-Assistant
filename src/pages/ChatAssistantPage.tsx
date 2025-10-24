import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGemini } from '@/hooks/use-gemini';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Loader2, Send, Copy, Bot, User, History, Brain, MessageSquare } from 'lucide-react';
import AIContentSuggestions from '@/components/AIContentSuggestions';
import SentimentAnalysis from '@/components/SentimentAnalysis';
import AIChatbot from '@/components/AIChatbot';
import VoiceInput from '@/components/ui/voice-input';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatAssistantPage = () => {
  const { callGemini, isLoading, error, getSystemPrompt } = useGemini();
  const { appData } = useFindom();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedSub, setSelectedSub] = useState<string>('');
  const [isProcessingSub, setIsProcessingSub] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSubConversationHistory = (subName: string): string => {
    console.log('Getting conversation history for:', subName);
    const sub = appData.subs.find(s => s.name === subName);
    console.log('Found sub:', sub ? 'yes' : 'no');
    
    if (!sub?.conversationHistory) {
      console.log('No conversation history found');
      return '';
    }
    
    console.log('Conversation history type:', typeof sub.conversationHistory);
    console.log('Conversation history raw:', sub.conversationHistory);
    
    try {
      // If it's already a string, use it directly
      if (typeof sub.conversationHistory === 'string') {
        console.log('Processing as string');
        // Try to parse it as JSON to see if it's a structured format
        try {
          const parsed = JSON.parse(sub.conversationHistory);
          console.log('Parsed JSON successfully, type:', Array.isArray(parsed) ? 'array' : typeof parsed);
          if (Array.isArray(parsed)) {
            const result = parsed
              .slice(-10) // Last 10 messages
              .map((msg: any) => `${msg.role || msg.sender || 'unknown'}: ${msg.content || msg.message || 'no content'}`)
              .join('\n');
            console.log('Array processing result length:', result.length);
            return result;
          }
          // If it's not an array, return the string as-is
          console.log('Not an array, returning raw string');
          return sub.conversationHistory;
        } catch (parseError) {
          console.log('JSON parse failed, returning raw string');
          return sub.conversationHistory;
        }
      }
      // If it's an object, stringify it first
      if (typeof sub.conversationHistory === 'object') {
        console.log('Processing as object');
        const historyStr = JSON.stringify(sub.conversationHistory);
        try {
          const parsed = JSON.parse(historyStr);
          if (Array.isArray(parsed)) {
            const result = parsed
              .slice(-10)
              .map((msg: any) => `${msg.role || msg.sender || 'unknown'}: ${msg.content || msg.message || 'no content'}`)
              .join('\n');
            console.log('Object array processing result length:', result.length);
            return result;
          }
          console.log('Object not array, returning stringified');
          return historyStr;
        } catch (parseError) {
          console.log('Object JSON parse failed, returning stringified');
          return historyStr;
        }
      }
      console.log('Processing as other type, converting to string');
      return String(sub.conversationHistory);
    } catch (e) {
      console.error('Error parsing conversation history:', e);
      // Return the raw value if parsing fails
      return String(sub.conversationHistory || '');
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');

    try {
      let contextPrompt = currentInput;
      
      // If a sub is selected, include their conversation history and preferences
      if (selectedSub && selectedSub !== 'general') {
        const sub = appData.subs.find(s => s.name === selectedSub);
        const conversationHistory = getSubConversationHistory(selectedSub);
        
        let subContext = '';
        if (sub) {
          subContext = `
Selected Sub: ${sub.name}
Total Tributed: $${sub.total}
Last Tribute: ${sub.lastTribute || 'N/A'}
Preferences: ${sub.preferences || 'None specified'}
Notes: ${sub.notes || 'No additional notes'}
          `;
        }
        
        if (conversationHistory) {
          subContext += `\n\nRecent Conversation History:\n${conversationHistory}`;
        }
        
        contextPrompt = `${subContext}\n\nCurrent Request: ${currentInput}\n\nPlease provide a tailored response for ${selectedSub} based on their history, preferences, and the current request.`;
      }

      const systemPrompt = getSystemPrompt() + ` 
You are an AI assistant for a findom content creator. 
Your persona should be dominant, confident, and professional while maintaining appropriate boundaries.
Generate content that is empowering, consensual, and focused on the findom lifestyle.
Always maintain a respectful yet dominant tone.
Do not generate any content that is illegal, harmful, or violates platform policies.
Focus on empowerment, financial literacy, and consensual power dynamics.

IMPORTANT: Keep your responses SHORT, DIRECT, and CONCISE. 
- Use bullet points when appropriate
- Limit responses to 2-3 sentences maximum
- Get straight to the point
- Avoid lengthy explanations unless specifically asked
- Focus on actionable advice

${selectedSub && selectedSub !== 'general' ? `You are currently discussing ${selectedSub}. Use their conversation history, preferences, and tribute history to craft a personalized, dominant response that aligns with their known interests and your established dynamic with them.` : 'Provide general findom advice and content creation help.'}`;

      const result = await callGemini(contextPrompt, systemPrompt);
      
      if (result) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: result,
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, assistantMessage]);
      } else if (error) {
        console.error('Gemini API error:', error);
        let errorMessage = 'Failed to get response';
        
        if (error.includes('MAX_TOKENS') || error.includes('token')) {
          errorMessage = 'Response too long. Try asking a more specific question or clear the chat history.';
        } else if (error.includes('API key') || error.includes('configuration')) {
          errorMessage = 'API configuration error. Please check your settings.';
        } else {
          errorMessage = `API Error: ${error}`;
        }
        
        toast.error(errorMessage);
        // Add error message to chat for debugging
        const errorResponse: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: errorMessage,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorResponse]);
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to send message');
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Error: Failed to process your request. Please try again.`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard!');
  };

  const handleClearChat = () => {
    setMessages([]);
    toast.success('Chat cleared');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">AI Assistant Suite</h2>
          <p className="text-sm text-gray-400 mt-1">Advanced AI tools for content creation and sub management</p>
        </div>
      </div>

      <Tabs defaultValue="chat" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-800 border border-gray-700">
          <TabsTrigger value="chat" className="data-[state=active]:bg-indigo-600">
            <MessageSquare className="mr-2 h-4 w-4" />
            Personal Chat
          </TabsTrigger>
          <TabsTrigger value="content" className="data-[state=active]:bg-indigo-600">
            <Brain className="mr-2 h-4 w-4" />
            Content AI
          </TabsTrigger>
          <TabsTrigger value="sentiment" className="data-[state=active]:bg-indigo-600">
            <History className="mr-2 h-4 w-4" />
            Sentiment Analysis
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="data-[state=active]:bg-indigo-600">
            <Bot className="mr-2 h-4 w-4" />
            AI Chatbot
          </TabsTrigger>
        </TabsList>

        <TabsContent value="chat" className="space-y-6">
          <Card className="bg-gray-800 border border-gray-700 p-4">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Bot className="mr-2 h-5 w-5 text-indigo-400" />
                Sub Selection
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex space-x-4 items-center">
                <div className="flex-1">
                  <label className="text-sm text-gray-300 mb-2 block">Select Sub (Optional)</label>
                  <Select value={selectedSub} onValueChange={setSelectedSub}>
                    <SelectTrigger className="bg-gray-900 border-gray-700 text-gray-200">
                      <SelectValue placeholder="Choose a sub for personalized responses" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="general">General Advice</SelectItem>
                      {appData.subs.map((sub) => (
                        <SelectItem key={sub.id} value={sub.name}>
                          {sub.name} (${sub.total.toFixed(2)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSub && (
                  <div className="flex-1">
                    <div className="text-sm text-gray-300 mb-2">Sub Info</div>
                    <div className="bg-gray-900 p-3 rounded border border-gray-700">
                      {(() => {
                        const sub = appData.subs.find(s => s.name === selectedSub);
                        return sub ? (
                          <div className="text-sm space-y-1">
                            <div className="text-green-400 font-medium">{sub.name}</div>
                            <div className="text-gray-400">Total: ${sub.total.toFixed(2)}</div>
                            <div className="text-gray-400">Last: {sub.lastTribute || 'N/A'}</div>
                            {sub.conversationHistory && (
                              <div className="flex items-center text-indigo-400">
                                <History className="h-3 w-3 mr-1" />
                                Has conversation history
                              </div>
                            )}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800 border border-gray-700 flex flex-col h-[calc(100vh-400px)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg font-semibold flex items-center">
                <Bot className="mr-2 h-5 w-5 text-indigo-400" />
                Conversation {selectedSub && `- ${selectedSub}`}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col p-0">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center py-8">
                    <Bot className="h-12 w-12 text-gray-600 mx-auto mb-3" />
                    <p className="text-gray-500">Start a conversation with your AI assistant</p>
                    <p className="text-sm text-gray-600 mt-2">
                      {selectedSub 
                        ? `Ask for personalized messages, content ideas, or strategies for ${selectedSub}`
                        : 'Ask for content ideas, advice, or help with tasks'
                      }
                    </p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[80%] rounded-lg p-3 ${
                          message.role === 'user'
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-700 text-gray-200'
                        }`}
                      >
                        <div className="flex items-start space-x-2">
                          {message.role === 'assistant' && (
                            <Bot className="h-4 w-4 mt-0.5 text-indigo-400 flex-shrink-0" />
                          )}
                          {message.role === 'user' && (
                            <User className="h-4 w-4 mt-0.5 text-indigo-200 flex-shrink-0" />
                          )}
                          <div className="flex-1">
                            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                            <div className="flex items-center justify-between mt-2">
                              <p className="text-xs opacity-70">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </p>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleCopyMessage(message.content)}
                                className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-gray-700 p-4">
                <div className="flex space-x-2">
                  <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={
                      selectedSub
                        ? `Ask for a personalized message or content for ${selectedSub}...`
                        : "Ask me anything about findom, content creation, or strategies..."
                    }
                    rows={2}
                    className="flex-1 p-2 bg-gray-900 border-gray-600 text-gray-200 resize-none"
                    disabled={isLoading}
                  />
                  <VoiceInput
                    onTranscript={(text) => setInput(text)}
                    disabled={isLoading}
                    className="self-end"
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={isLoading || !input.trim()}
                    className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 self-end"
                  >
                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <AIContentSuggestions />
        </TabsContent>

        <TabsContent value="sentiment">
          <SentimentAnalysis />
        </TabsContent>

        <TabsContent value="chatbot">
          <AIChatbot />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChatAssistantPage;