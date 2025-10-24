import { useState, useCallback } from 'react';
import { useGenderedContent } from './use-gendered-content';

interface UseAIUnifiedReturn {
  // Chat functionality
  callGemini: (prompt: string, systemPrompt?: string) => Promise<string | null>;
  // Vision functionality  
  callGeminiVision: (imageData: string, prompt?: string) => Promise<string | null>;
  // Analytics functionality
  analyzeSubConversation: (conversationHistory: string, subName: string) => Promise<any>;
  generatePersonalizedContent: (sub: any, contentType: string, tone: string) => Promise<any[]>;
  generateAutomatedResponse: (message: string, subName: string, context: string) => Promise<string>;
  
  isLoading: boolean;
  error: string | null;
}

export const useAIUnified = (): UseAIUnifiedReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSystemPrompt } = useGenderedContent();

  const makeAPICall = useCallback(async (endpoint: string, payload: any) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://qttmhbtaguiioomcjqbt.supabase.co/functions/v1/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dG1oYnRhZ3VpaW9vbWNqcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjQ5MDMsImV4cCI6MjA3NjMwMDkwM30.M4AiSRnA0xfmDgmtxYaKr4GT7bvzoFS3ukxpsN3b8K0`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const callGemini = useCallback(async (prompt: string, systemPrompt?: string) => {
    const data = await makeAPICall('gemini-chat', {
      prompt,
      systemInstruction: systemPrompt || getSystemPrompt('general'),
    });
    return data.response || data.content || null;
  }, [makeAPICall, getSystemPrompt]);

  const callGeminiVision = useCallback(async (imageData: string, prompt?: string) => {
    const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid image data format');
    
    const data = await makeAPICall('gemini-vision', {
      image: matches[2],
      mimeType: matches[1],
      prompt: prompt || 'Analyze this image and provide a detailed description.',
    });
    return data.response || data.content || null;
  }, [makeAPICall]);

  const analyzeSubConversation = useCallback(async (conversationHistory: string, subName: string) => {
    const data = await makeAPICall('analyze-conversation', {
      conversationHistory,
      subName,
    });
    return data.analytics;
  }, [makeAPICall]);

  const generatePersonalizedContent = useCallback(async (sub: any, contentType: string, tone: string) => {
    const data = await makeAPICall('generate-content', {
      sub,
      contentType,
      tone,
    });
    return data.suggestions || [];
  }, [makeAPICall]);

  const generateAutomatedResponse = useCallback(async (message: string, subName: string, context: string) => {
    const data = await makeAPICall('generate-response', {
      message,
      subName,
      context,
    });
    return data.response || '';
  }, [makeAPICall]);

  return {
    callGemini,
    callGeminiVision,
    analyzeSubConversation,
    generatePersonalizedContent,
    generateAutomatedResponse,
    isLoading,
    error,
  };
};