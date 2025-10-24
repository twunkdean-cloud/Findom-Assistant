import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useGemini } from '@/hooks/use-gemini';
import { useFindom } from '@/context/FindomContext';
import { useMobile } from '@/hooks/use-mobile';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from '@/utils/toast-unified';
import { Loader2, Send, Copy, Bot, User, Brain, MessageSquare, Settings } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatbot = () => {
  const { callGemini, isLoading, error } = useGemini();
  const { appData } = useFindom();
  const { getSystemPrompt, getTargetAudience, isMale, isFemale } = useGenderedContent();
  const { isMobile } = useMobile();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedSub, setSelectedSub] = useState<string>('general');
  const [chatMode, setChatMode] = useState<'general' | 'sub' | 'task' | 'creative'>('general');
  const [botPersonality, setBotPersonality] = useState<'dominant' | 'caring' | 'strict' | 'playful'>('dominant');
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
      
      // Get the appropriate system prompt based on gender and chat mode
      let systemPrompt = getSystemPrompt(chatMode === 'general' ? 'response' : chatMode);
      
      // Add personality-specific instructions
      systemPrompt += `

Your persona should be ${botPersonality} and professional while maintaining appropriate boundaries.
Generate content that is empowering, consensual, and focused on the ${isMale ? 'findom' : 'femdom'} lifestyle.
Always maintain a respectful yet ${botPersonality} tone.
Do not generate any content that is illegal, harmful, or violates platform policies.
Focus on empowerment, financial literacy, and consensual power dynamics.

IMPORTANT: Keep your responses SHORT, DIRECT, and CONCISE. 
- Use bullet points when appropriate
- Limit responses to 2-3 sentences maximum
- Get straight to the point
- Avoid lengthy explanations unless specifically asked
- Focus on actionable advice

Target audience: ${getTargetAudience()}`;

      // Add sub-specific context if selected
      if (selectedSub && selectedSub !== 'general') {
        const sub = appData.subs.find(s => s.name === selectedSub);
        if (sub) {
          contextPrompt = `Regarding ${selectedSub} (${sub.total} total tributed): ${currentInput}`;
          systemPrompt += ` You are currently discussing ${selectedSub}. Use their tribute history and your established dynamic to provide personalized advice.`;
        }
      }

      // Adjust prompt based on chat mode
      switch (chatMode) {
        case 'task':
          systemPrompt += ` Focus on generating creative tasks and assignments for ${isMale ? 'male subs' : 'subs serving female dominants'}.`;
          break;
        case 'creative':
          systemPrompt += ` Focus on creative content ideas, captions, and engagement strategies for ${isMale ? 'male-male findom' : 'female-male femdom'}.`;
          break;
        case 'sub':
          systemPrompt += ` Focus on sub management, relationship dynamics, and engagement strategies for ${isMale ? 'male-male findom' : 'female-male femdom'}.`;
          break;
      }

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
      }
    } catch (err) {
      console.error('Chat error:', err);
      toast.error('Failed to send message');
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

  const getPersonalityColor = (personality: string) => {
    switch (personality) {
      case 'dominant': return 'bg-red-600';
      case 'caring': return 'bg-blue-600';
      case 'strict': return 'bg-purple-600';
      case 'playful': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'task': return <Settings className="h-4 w-4" />;
      case 'creative': return <Brain className="h-4 w-4" />;
      case 'sub': return <User className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <Card className="bg-gray-800 border border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Bot className="mr-2 h-5 w-5 text-indigo-400" />
          AI Chatbot
          <Badge className={`ml-2 ${isMale ? 'bg-blue-600' : 'bg-pink-600'}`}>
            {isMale ? 'Male Findom' : 'Female Femdom'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chat Configuration */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-sm text-gray-300 mb-2 block">Chat Mode</label>
            <Select value={chatMode} onValueChange={(value: any) => setChatMode(value)}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="sub">Sub Management</SelectItem>
                <SelectItem value="task">Task Creation</SelectItem>
                <SelectItem value="creative">Creative Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Bot Personality</label>
            <Select value={botPersonality} onValueChange={(value: any) => setBotPersonality(value)}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="dominant">Dominant</SelectItem>
                <SelectItem value="caring">Caring</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-gray-300 mb-2 block">Context</label>
            <Select value={selectedSub} onValueChange={setSelectedSub}>
              <SelectTrigger className="bg-gray-900 border-gray-700">
                <SelectValue placeholder="Select sub for context" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="general">General</SelectItem>
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

        {/* Current Configuration Display */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getPersonalityColor(botPersonality)}>
            {botPersonality}
          </Badge>
          <Badge className="bg-indigo-600">
            {getModeIcon(chatMode)}
            <span className="ml-1">{chatMode}</span>
          </Badge>
          {selectedSub && selectedSub !== 'general' && (
            <Badge className="bg-green-600">
              {selectedSub}
            </Badge>
          )}
        </div>

        {/* Chat Messages */}
        <div className={`border border-gray-700 rounded-lg bg-gray-900 ${isMobile ? 'h-[50vh]' : 'h-[400px]'} overflow-y-auto p-4 space-y-4`}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-gray-500">
                Start a conversation with your AI assistant
              </p>
              <p className="text-sm text-gray-600 mt-2">
                Ask for advice, content ideas, or help with tasks
              </p>
              <p className="text-xs text-gray-600 mt-1">
                Currently configured for: {isMale ? 'Male Findom (Male for Male)' : 'Female Femdom (Female for Male)'}
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

        {/* Chat Input */}
        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              selectedSub && selectedSub !== 'general'
                ? `Ask about ${selectedSub} or get personalized advice...`
                : `Ask me anything about ${isMale ? 'findom' : 'femdom'}, content creation, or strategies...`
            }
            rows={isMobile ? 2 : 3}
            className="w-full p-3 bg-gray-900 border-gray-600 text-gray-200 resize-none"
            disabled={isLoading}
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            <Button
              onClick={handleClearChat}
              variant="outline"
              className="border-gray-600 text-gray-300 hover:bg-gray-700"
            >
              Clear
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AIChatbot;