"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label'; // Added this import
import { useGemini } from '@/hooks/use-gemini';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';
import { Loader2, Save, Copy } from 'lucide-react';

const getSystemPrompt = (): string => {
  return `You are a confident, experienced MALE FOR MALE findom content creator who knows how to craft effective response templates.
  This is specifically for MALE DOMINANTS and MALE SUBMISSIVES in the findom lifestyle.
  Write naturally, conversationally, and authentically - like you're talking to a friend or client.
  Use contractions (you're, can't, won't) and natural language patterns.
  Avoid corporate-speak, overly formal language, or AI-like phrases.
  Be direct, bold, and unapologetic in your tone.
  Focus on real scenarios, practical advice, and genuine findom dynamics between men.
  Keep it real, keep it authentic, and always maintain that dominant but natural energy.
  No "as an AI" or similar phrases - just straight, authentic content.
  IMPORTANT: This is MALE FOR MALE findom only. Never mention women, goddess, femdom, or any female-related content. All content should be focused on male-male dynamics.
  
  For response templates:
  - Create templates that can be easily customized
  - Include placeholders for personalization
  - Focus on common findom scenarios between men
  - Be direct and commanding but authentic
  - Cover various situations: first contact, tribute requests, punishments, rewards`;
};

const ResponseTemplatesPage = () => {
  const { appData, updateAppData } = useFindom();
  const { callGemini, isLoading, error } = useGemini();

  const [responseType, setResponseType] = useState<string>('initial');
  const [context, setContext] = useState<string>('');
  const [generatedResponse, setGeneratedResponse] = useState<string>('');

  // Load saved response for the current type when type changes
  useEffect(() => {
    setGeneratedResponse(appData.responses[responseType] || '');
  }, [responseType, appData.responses]);

  const handleGenerateResponse = async () => {
    if (!responseType) {
      toast.error('Please select a response type.');
      return;
    }

    setGeneratedResponse('');
    let userPrompt = '';
    let systemInstruction = getSystemPrompt();

    switch (responseType) {
      case 'initial':
        userPrompt = `Generate an initial greeting message for a new sub. Context: ${context}`;
        systemInstruction += " Generate a concise, dominant initial greeting for a new sub. Do not include any introductory or concluding remarks, just the message content.";
        break;
      case 'tribute':
        userPrompt = `Generate a response to a sub sending tribute. Context: ${context}`;
        systemInstruction += " Generate a concise, dominant response to a sub sending tribute. Do not include any introductory or concluding remarks, just the message content.";
        break;
      case 'excuse':
        userPrompt = `Generate a response to a sub making an excuse. Context: ${context}`;
        systemInstruction += " Generate a concise, dominant, and dismissive response to a sub making an excuse. Do not include any introductory or concluding remarks, just the message content.";
        break;
      case 'task':
        userPrompt = `Generate a message assigning a task to a sub. Context: ${context}`;
        systemInstruction += " Generate a concise, dominant message assigning a task to a sub. Do not include any introductory or concluding remarks, just the message content.";
        break;
      case 'punishment':
        userPrompt = `Generate a message delivering a punishment to a sub. Context: ${context}`;
        systemInstruction += " Generate a concise, dominant message delivering a punishment to a sub. Do not include any introductory or concluding remarks, just the message content.";
        break;
      default:
        userPrompt = `Generate a response for the following scenario: ${context}`;
        systemInstruction += " Generate a concise, dominant response for the given scenario. Do not include any introductory or concluding remarks, just the message content.";
        break;
    }

    const result = await callGemini(userPrompt, systemInstruction);
    if (result) {
      setGeneratedResponse(result);
      toast.success('Response generated successfully!');
    } else if (error) {
      toast.error(`Failed to generate response: ${error}`);
    }
  };

  const handleSaveResponse = () => {
    if (generatedResponse.trim()) {
      updateAppData('responses', {
        ...appData.responses,
        [responseType]: generatedResponse.trim(),
      });
      toast.success(`Response for '${responseType}' saved!`);
    } else {
      toast.error('No response to save.');
    }
  };

  const handleCopyResponse = () => {
    if (generatedResponse.trim()) {
      navigator.clipboard.writeText(generatedResponse.trim());
      toast.success('Response copied to clipboard!');
    } else {
      toast.error('No response to copy.');
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-100">Response Templates</h2>
      <p className="text-sm text-gray-400 mb-4">Generate and save AI-powered responses for common interactions with your subs.</p>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generate Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="response-type">Response Type</Label>
            <Select value={responseType} onValueChange={setResponseType} disabled={isLoading}>
              <SelectTrigger id="response-type" className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200">
                <SelectValue placeholder="Select a response type" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700 text-gray-200">
                <SelectItem value="initial">Initial Greeting</SelectItem>
                <SelectItem value="tribute">Tribute Received</SelectItem>
                <SelectItem value="excuse">Excuse Rejected</SelectItem>
                <SelectItem value="task">Task Assignment</SelectItem>
                <SelectItem value="punishment">Punishment</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="context">Context / Details</Label>
            <Textarea
              id="context"
              placeholder="Provide any specific details or context for the response (e.g., 'sub's name is John', 'tribute amount was $50', 'excuse was being busy with work')"
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-200"
              disabled={isLoading}
            />
          </div>
          <Button
            onClick={handleGenerateResponse}
            disabled={isLoading || !responseType}
            className="bg-indigo-600 px-4 py-2 rounded hover:bg-indigo-700 w-full flex items-center justify-center"
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Generate Response
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-gray-800 border border-gray-700 p-4">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Generated Response</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {generatedResponse ? (
            <Textarea
              value={generatedResponse}
              readOnly
              rows={6}
              className="w-full p-2 bg-gray-900 border border-gray-700 rounded text-gray-300 resize-none"
            />
          ) : (
            <p className="text-gray-500 text-center">Your generated response will appear here...</p>
          )}
          <div className="flex gap-3">
            <Button
              onClick={handleSaveResponse}
              disabled={!generatedResponse.trim()}
              className="flex-1 bg-green-600 px-4 py-2 rounded hover:bg-green-700 flex items-center justify-center"
            >
              <Save className="mr-2 h-4 w-4" /> Save Response
            </Button>
            <Button
              onClick={handleCopyResponse}
              disabled={!generatedResponse.trim()}
              className="flex-1 bg-blue-600 px-4 py-2 rounded hover:bg-blue-700 flex items-center justify-center"
            >
              <Copy className="mr-2 h-4 w-4" /> Copy
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponseTemplatesPage;