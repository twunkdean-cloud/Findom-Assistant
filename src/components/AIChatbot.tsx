import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAI } from '@/hooks/use-ai';
import { useFindom } from '@/context/FindomContext';
import { useMobile } from '@/hooks/use-mobile';
import { useGenderedContent } from '@/hooks/use-gendered-content';
import { toast } from '@/utils/toast';
import { Loader2, Send, Copy, Bot, User, Brain, MessageSquare, Settings } from 'lucide-react';
import { usePersona, PersonaTone } from '@/hooks/use-persona';
import type { NextBestAction } from '@/types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const AIChatbot = () => {
  const { callGemini, isLoading, error, generateNextBestActions } = useAI();
  const { appData } = useFindom();
  const { getSystemPrompt, getTargetAudience, isMale, isFemale } = useGenderedContent();
  const { isMobile } = useMobile();
  const { persona, gender, presets, buildSystemPrompt } = usePersona();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [selectedSub, setSelectedSub] = useState<string>('general');
  const [chatMode, setChatMode] = useState<'general' | 'sub' | 'task' | 'creative'>('general');
  const [botPersonality, setBotPersonality] = useState<'dominant' | 'caring' | 'strict' | 'playful' | 'seductive'>((persona as any) || 'dominant');
  const [nextTone, setNextTone] = useState<PersonaTone | null>(null);
  const [suggestions, setSuggestions] = useState<NextBestAction[]>([]);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (overrideContent?: string) => {
    const contentToSend = (overrideContent ?? input).trim();
    if (!contentToSend) {
      toast.error('Please enter a message');
      return;
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: contentToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    // Clear input only if not overriding
    if (!overrideContent) setInput('');
    // Determine tone for this message (use one-time preset if set)
    const toneForThisMessage = (nextTone || botPersonality) as PersonaTone;
    // Clear one-time preset after use
    setNextTone(null);

    try {
      let contextPrompt = contentToSend;
      
      const promptType = chatMode === 'general' ? 'response' : 
                        chatMode === 'sub' ? 'response' : 
                        chatMode === 'creative' ? 'response' : 
                        chatMode;
      let systemPrompt = buildSystemPrompt(promptType, {
        tone: toneForThisMessage,
        gender,
        extraFocus:
          chatMode === 'task'
            ? `Generate creative tasks and assignments for ${isMale ? 'male subs' : 'subs serving female dominants'}.`
            : chatMode === 'creative'
            ? `Generate creative content ideas, captions, and engagement strategies for ${isMale ? 'male-male findom' : 'female-for-male femdom'}.`
            : chatMode === 'sub'
            ? `Focus on sub management, relationship dynamics, and engagement strategies for ${isMale ? 'male-male findom' : 'female-for-male femdom'}.`
            : 'Provide a helpful, persona-aligned response.',
      });
      
      systemPrompt += `

Your persona should be ${botPersonality} and professional while maintaining appropriate boundaries.
Generate content that is empowering, consensual, and focused on the ${isMale ? 'findom' : 'femdom'} lifestyle.
Always maintain a respectful yet ${botPersonality} tone.
Do not generate any content that is illegal, harmful, or violates platform policies.
Focus on empowerment, financial literacy, and consensual power dynamics.

IMPORTANT: Be creative and generate unique, engaging content.
- Tailor your response to the specific sub if their context is provided.
- Avoid generic, repetitive, or list-based answers unless it makes sense for the query.
- Write in a natural, conversational style that fits your persona.
- Provide thoughtful and insightful suggestions.

Target audience: ${getTargetAudience()}`;

      if (selectedSub && selectedSub !== 'general') {
        const sub = appData.subs.find(s => s.name === selectedSub);
        if (sub) {
          contextPrompt = `Regarding ${selectedSub}: ${contentToSend}`;
          systemPrompt += ` You are currently discussing ${selectedSub}. Use their tribute history and your established dynamic to provide personalized advice.`;
        }
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
      logger.error('Chat error:', err);
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

  const handleSuggestActions = async () => {
    setIsSuggesting(true);
    setSuggestions([]);
    try {
      const sub = selectedSub !== 'general' ? appData.subs.find(s => s.name === selectedSub) : null;
      const recentTributes = sub
        ? appData.tributes
            .filter(t => t.from_sub === sub.name)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 5)
            .map(t => ({ amount: t.amount, date: t.date, reason: t.reason, notes: t.notes }))
        : [];

      const simpleMessages = messages.slice(-10).map(m => ({ role: m.role, content: m.content }));
      const res = await generateNextBestActions({
        sub: sub || undefined,
        recentTributes,
        recentMessages: simpleMessages as any,
        currentTone: (nextTone || botPersonality) as PersonaTone,
        gender,
      });

      if (res.success && res.data) {
        setSuggestions(res.data);
        toast.success('Suggested next actions generated.');
      } else {
        toast.error(res.error || 'Failed to generate suggestions');
      }
    } finally {
      setIsSuggesting(false);
    }
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
    <Card className="bg-dark-card border-dark">
      <CardHeader>
        <CardTitle className="flex items-center text-high-contrast">
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
            <label className="text-sm text-muted-high-contrast mb-2 block">Chat Mode</label>
            <Select value={chatMode} onValueChange={(value: any) => setChatMode(value)}>
              <SelectTrigger className="bg-dark-input border-dark text-medium-contrast">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark">
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="sub">Sub Management</SelectItem>
                <SelectItem value="task">Task Creation</SelectItem>
                <SelectItem value="creative">Creative Content</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-high-contrast mb-2 block">Bot Personality</label>
            <Select value={botPersonality} onValueChange={(value: any) => setBotPersonality(value)}>
              <SelectTrigger className="bg-dark-input border-dark text-medium-contrast">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark">
                <SelectItem value="dominant">Dominant</SelectItem>
                <SelectItem value="caring">Caring</SelectItem>
                <SelectItem value="strict">Strict</SelectItem>
                <SelectItem value="playful">Playful</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-sm text-muted-high-contrast mb-2 block">Context</label>
            <Select value={selectedSub} onValueChange={setSelectedSub}>
              <SelectTrigger className="bg-dark-input border-dark text-medium-contrast">
                <SelectValue placeholder="Select sub for context" />
              </SelectTrigger>
              <SelectContent className="bg-dark-card border-dark">
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

        {/* NEW: Quick Persona Presets (per message) */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm text-muted-high-contrast">Quick tone for this message:</span>
          {presets.map(p => (
            <Button
              key={p}
              size="sm"
              variant={nextTone === p ? 'default' : 'outline'}
              className={`${nextTone === p ? 'bg-indigo-600 text-white' : 'border-dark text-medium-contrast'}`}
              onClick={() => setNextTone(prev => (prev === p ? null : p))}
              disabled={isLoading}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </Button>
          ))}
        </div>

        {/* NEW: Next Best Actions trigger */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-high-contrast">
            Get suggestions based on {selectedSub !== 'general' ? `${selectedSub}'s` : 'recent'} history.
          </div>
          <Button
            onClick={handleSuggestActions}
            disabled={isSuggesting}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isSuggesting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Brain className="h-4 w-4" />}
            <span className="ml-2">Suggest Next Best Actions</span>
          </Button>
        </div>

        {/* NEW: Next Best Actions list */}
        {suggestions.length > 0 && (
          <div className="space-y-2">
            {suggestions.map((sug, idx) => (
              <div key={idx} className="rounded-md border border-dark bg-dark-input p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      {sug.suggestedTone && (
                        <Badge className="bg-indigo-600">{sug.suggestedTone}</Badge>
                      )}
                      {sug.type && (
                        <Badge variant="outline" className="border-dark text-medium-contrast">
                          {sug.type}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className={`border-dark text-medium-contrast`}
                      >
                        {sug.confidence} confidence
                      </Badge>
                    </div>
                    <p className="mt-2 text-sm text-high-contrast whitespace-pre-wrap">{sug.action}</p>
                    <p className="mt-1 text-xs text-muted-high-contrast">Why: {sug.reason}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-dark text-medium-contrast"
                      onClick={() => {
                        setInput(prev => (prev ? `${prev}\n\n${sug.action}` : sug.action));
                        toast.success('Inserted into input.');
                      }}
                    >
                      Insert
                    </Button>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700"
                      onClick={() => handleSendMessage(sug.action)}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Chat Messages */}
        <div className={`border-dark rounded-lg bg-dark-input ${isMobile ? 'h-[50vh]' : 'h-[400px]'} overflow-y-auto p-4 space-y-4`}>
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Bot className="h-12 w-12 text-gray-600 mx-auto mb-3" />
              <p className="text-muted-high-contrast">
                Start a conversation with your AI assistant
              </p>
              <p className="text-sm text-muted-high-contrast mt-2">
                Ask for advice, content ideas, or help with tasks
              </p>
              <p className="text-xs text-muted-high-contrast mt-1">
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
                      : 'bg-gray-700 text-high-contrast'
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
            className="w-full p-3 bg-dark-input border-dark text-high-contrast resize-none placeholder:text-gray-400"
            disabled={isLoading}
          />
          <div className="flex space-x-2">
            <Button
              onClick={() => handleSendMessage()}
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
              className="border-dark text-medium-contrast hover:bg-gray-700"
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