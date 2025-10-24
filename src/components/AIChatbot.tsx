import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAIAnalytics } from '@/hooks/use-ai-analytics';
import { useFindom } from '@/context/FindomContext';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from '@/utils/toast-unified';
import { Bot, Send, Copy, User, BotIcon } from 'lucide-react';
import VoiceInput from '@/components/ui/voice-input';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatbot = () => {
  const { generateAutomatedResponse, isLoading } = useAIAnalytics();
  const { appData } = useFindom();
  const { isMale, isFemale } = useGenderedContent();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [selectedSub, setSelectedSub] = useState('');
  const [context, setContext] = useState('General inquiry');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) {
      toast.error('Please enter a message');
      return;
    }

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = input.trim();
    setInput('');

    try {
      const response = await generateAutomatedResponse(
        currentInput,
        selectedSub || 'Anonymous',
        context
      );

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error generating response:', error);
      toast.error('Failed to generate response');
    }
  };

  const handleCopyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast.success('Message copied to clipboard!');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const getContextFromSub = () => {
    const sub = appData.subs.find(s => s.name === selectedSub);
    if (sub) {
      return `${isMale ? 'Sub' : 'Worshipper'} profile: Total contributed: $${sub.total}, Preferences: ${sub.preferences}, Notes: ${sub.notes}`;
    }
    return 'General inquiry';
  };

  useEffect(() => {
    if (selectedSub) {
      setContext(getContextFromSub());
    }
  }, [selectedSub]);

  return (
    <Card className="bg-gray-800 border border-gray-700 h-[600px] flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center">
          <BotIcon className="mr-2 h-5 w-5 text-indigo-400" />
          AI Assistant - Routine Inquiries
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="text-sm text-gray-300 mb-2 block">Related {isMale ? 'Sub' : 'Worshipper'} (Optional)</label>
              <Select value={selectedSub} onValueChange={setSelectedSub}>
                <SelectTrigger className="bg-gray-900 border-gray-700">
                  <SelectValue placeholder={`Select ${isMale ? 'sub' : 'worshipper'} for context`} />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="general">General</SelectItem>
                  {appData.subs.map((sub) => (
                    <SelectItem key={sub.id} value={sub.name}>
                      {sub.name} (${sub.total.toFixed(2)})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          {context && (
            <div className="text-sm text-gray-400">
              <strong>Context:</strong> {context}
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">AI Assistant for handling routine inquiries</p>
              <p className="text-sm text-gray-600 mt-2">
                Ask about payment schedules, task assignments, or general questions
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
              placeholder="Type your inquiry here..."
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
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatbot;