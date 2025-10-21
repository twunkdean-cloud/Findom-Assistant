"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useGemini } from '@/hooks/use-gemini';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Loader2, Copy } from 'lucide-react';

const ChatAssistantPage = () => {
  const { appData } = useFindom();
  const { callGemini, isLoading, error, getSystemPrompt } = useGemini();

  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [chatContext, setChatContext] = useState('');
  const [generatedMessage, setGeneratedMessage] = useState('');

  const handleGenerateMessage = async () => {
    if (!selectedSubId) {
      toast.error('Please select a sub first.');
      return;
    }
    if (!chatContext.trim()) {
      toast.error('Please provide some context for the message.');
      return;
    }

    setGeneratedMessage('');
    const selectedSub = appData.subs.find(sub => sub.id.toString() === selectedSubId);

    if (!selectedSub) {
      toast.error('Selected sub not found.');
      return;
    }

    // Get the base system prompt and remove the hashtag instruction
    let baseSystemPrompt = getSystemPrompt();
    baseSystemPrompt = baseSystemPrompt.replace(/Use two or three hashtags for each post you create\./, '');

    const subDetails = `Sub's Name: ${selectedSub.name}. Last Tribute: ${selectedSub.lastTribute || 'N/A'}. Preferences: ${selectedSub.preferences || 'None specified'}. Notes: ${selectedSub.notes || 'None specified'}.`;
    const userPrompt = `Generate a personalized chat message for ${selectedSub.name} based on the following context: "${chatContext}". Consider their preferences and notes.`;
    
    // Combine the modified base prompt with specific chat assistant instructions
    const systemInstruction = baseSystemPrompt + ` Your response should be a concise, engaging, and in-character chat message. Incorporate details about the sub if relevant. Sub details: ${subDetails}. Do not include any introductory or concluding remarks, just the message content.`;

    const result = await callGemini(userPrompt, systemInstruction);
    if (result) {
      setGeneratedMessage(result);
      toast.success('Message generated successfully!');
    } else if (error) {
      toast.error(`Failed to generate message: ${error}`);
    }
  };

  const handleCopyMessage = () => {
    if (generatedMessage.trim()) {
      navigator.clipboard.writeText(generatedMessage.trim());
      toast.success('Message copied to clipboard!');
    } else {
      toast.error('No message to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">AI Chat Assistant</h2>
      <p className="text-sm text-gray-400 mb-4">Generate personalized chat messages for your subs using AI.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate Chat Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="select-sub">Select Sub</Label>
            <Select value={selectedSubId} onValueChange={setSelectedSubId} disabled={isLoading || appData.subs.length === 0}>
              <SelectTrigger id="select-sub" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                <SelectValue placeholder="Select a sub" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
                {appData.subs.length === 0 ? (
                  <SelectItem value="no-subs" disabled>No subs available. Add some in Sub Tracker!</SelectItem>
                ) : (
                  appData.subs.map(sub => (
                    <SelectItem key={sub.id} value={sub.id.toString()}>{sub.name}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="chat-context">Message Context</Label>
            <Textarea
              id="chat-context"
              placeholder="What do you want to say? (e.g., 'thank them for tribute', 'assign a new task', 'remind them of their place')"
              value={chatContext}
              onChange={(e) => setChatContext(e.target.value)}
              rows={4}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleGenerateMessage}
            disabled={isLoading || !selectedSubId || !chatContext.trim()}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 w-full flex items-center justify-center"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Message
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generated Message</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedMessage ? (
            <Textarea
              value={generatedMessage}
              readOnly
              rows={6}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
            />
          ) : (
            <p className="text-gray-500 text-center">Your generated message will appear here...</p>
          )}
          <Button
            onClick={handleCopyMessage}
            disabled={!generatedMessage.trim()}
            className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 w-full flex items-center justify-center"
          >
            <Copy className="mr-2 h-4 w-4" /> Copy Message
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatAssistantPage;