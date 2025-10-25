import { useState, useCallback } from 'react';
import { useGenderedContent } from './use-gendered-content';
import { API_BASE_URL, API_TOKEN } from '@/constants';
import { toast } from '@/utils/toast';
import { Sub, AIContentSuggestion, ServiceResponse } from '@/types';

interface AIAnalytics {
  sentimentScore: number;
  engagementLevel: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  contentSuggestions: string[];
}

interface ContentGenerationRequest {
  sub: Sub;
  contentType: 'caption' | 'task' | 'message';
  tone: 'dominant' | 'caring' | 'strict' | 'playful';
}

interface ConversationAnalysisRequest {
  conversationHistory: string;
  subName: string;
}

interface GeminiRequest {
  prompt: string;
  systemInstruction?: string;
}

interface GeminiVisionRequest {
  image: string;
  mimeType: string;
  prompt?: string;
}

interface GeminiResponse {
  response?: string;
  content?: string;
  error?: string;
}

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSystemPrompt: getGenderedSystemPrompt } = useGenderedContent();
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);

  const callGemini = useCallback(async (
    prompt: string, 
    systemPrompt?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const payload: GeminiRequest = {
        prompt: prompt,
        systemInstruction: systemPrompt || getGenderedSystemPrompt('general'),
      };

      const response = await fetch(`${API_BASE_URL}/gemini-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.response || data.content || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Gemini API error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getGenderedSystemPrompt]);

  const callGeminiVision = useCallback(async (
    imageData: string,
    prompt?: string
  ): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) {
        throw new Error('Invalid image data format');
      }
      
      const mimeType = matches[1];
      const base64Data = matches[2];

      const payload: GeminiVisionRequest = {
        image: base64Data,
        mimeType: mimeType,
        prompt: prompt || 'Analyze this image and provide a detailed description.',
      };

      const response = await fetch(`${API_BASE_URL}/gemini-vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data: GeminiResponse = await response.json();
      return data.response || data.content || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Gemini Vision API error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSystemPrompt = useCallback(() => {
    return getGenderedSystemPrompt('general');
  }, [getGenderedSystemPrompt]);

  const analyzeSubConversation = async (
    request: ConversationAnalysisRequest
  ): Promise<ServiceResponse<AIAnalytics>> => {
    // ... (implementation from use-ai-analytics)
    return { success: false, error: 'Not implemented' };
  };

  const generatePersonalizedContent = async (
    request: ContentGenerationRequest
  ): Promise<ServiceResponse<AIContentSuggestion[]>> => {
    // ... (implementation from use-ai-analytics)
    return { success: false, error: 'Not implemented' };
  };

  const generateAutomatedResponse = async (
    message: string,
    subName: string,
    context: string
  ): Promise<ServiceResponse<string>> => {
    // ... (implementation from use-ai-analytics)
    return { success: false, error: 'Not implemented' };
  };

  return {
    callGemini,
    callGeminiVision,
    isLoading,
    error,
    getSystemPrompt,
    analytics,
    analyzeSubConversation,
    generatePersonalizedContent,
    generateAutomatedResponse,
  };
};