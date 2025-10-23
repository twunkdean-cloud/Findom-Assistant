import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useGemini } from '@/hooks/use-gemini';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Loader2, Send, Copy, Bot, User, History } from 'lucide-react';
import ChatTest from '@/components/ChatTest';

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getSubConversationHistory = (subName: string): string => {
    const sub = appData.subs.find(s => s.name === subName);
    if (!sub?.conversationHistory) return '';
    
    try {
      const history = JSON.parse(sub.conversationHistory);
      if (Array.isArray(history)) {
        return history
          .slice(-10) // Last 10 messages
          .map((msg: any) => `${msg.role || msg.sender}: ${msg.content || msg.message}`)
          .join('\n');
      }
      return '';
    } catch (e) {
      console.error('Error parsing conversation history:', e);
      return '';
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
        toast.error(`Failed to get response: ${error}`);
        // Add error message to chat for debugging
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `Error: ${error}. Please check your API configuration.`,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
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
    <div className="space-y-6 h-[calc(100vh-200px)]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-100">AI Chat Assistant</h2>
          <p className="text-sm text-gray-400 mt-1">Get help with content, advice, and personalized sub interactions</p>
        </div>
        <Button
          onClick={handleClearChat}
          variant="outline"
          className="border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          Clear Chat
        </Button>
      </div>

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

      <Card className="bg-gray-800 border border-gray-700 flex flex-col h-[calc(100%-280px)]">
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
    </div>
  );
};

export default ChatAssistantPage;