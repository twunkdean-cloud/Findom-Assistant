import { useState, useCallback } from 'react';
import { useGemini } from './use-gemini';
import { useGenderedContent } from './use-gendered-content';

interface UnifiedAIResponse {
  content: string;
  type: 'text' | 'image' | 'analysis';
  metadata?: Record<string, any>;
}

export const useAIUnified = () => {
  const { callGemini, callGeminiVision, isLoading, error } = useGemini();
  const { getSystemPrompt } = useGenderedContent();
  const [responses, setResponses] = useState<UnifiedAIResponse[]>([]);

  const generateContent = useCallback(async (
    prompt: string,
    type: 'caption' | 'task' | 'message' | 'general' = 'general',
    options?: {
      includeImage?: boolean;
      customSystemPrompt?: string;
    }
  ): Promise<UnifiedAIResponse | null> => {
    try {
      const systemPrompt = options?.customSystemPrompt || getSystemPrompt(type);
      const content = await callGemini(prompt, systemPrompt);
      
      if (content) {
        const response: UnifiedAIResponse = {
          content,
          type: 'text',
          metadata: { type, timestamp: Date.now() }
        };
        
        setResponses(prev => [...prev, response]);
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Error generating content:', error);
      return null;
    }
  }, [callGemini, getSystemPrompt]);

  const analyzeImage = useCallback(async (
    imageData: string,
    prompt?: string
  ): Promise<UnifiedAIResponse | null> => {
    try {
      const content = await callGeminiVision(imageData, prompt);
      
      if (content) {
        const response: UnifiedAIResponse = {
          content,
          type: 'image',
          metadata: { timestamp: Date.now() }
        };
        
        setResponses(prev => [...prev, response]);
        return response;
      }
      
      return null;
    } catch (error) {
      console.error('Error analyzing image:', error);
      return null;
    }
  }, [callGeminiVision]);

  const clearResponses = useCallback(() => {
    setResponses([]);
  }, []);

  return {
    generateContent,
    analyzeImage,
    responses,
    isLoading,
    error,
    clearResponses
  };
};