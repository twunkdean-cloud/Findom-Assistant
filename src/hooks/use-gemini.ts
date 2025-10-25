import { useState, useCallback } from 'react';
import { useGenderedContent } from './use-gendered-content';
import { API_BASE_URL, API_TOKEN } from '@/constants';

interface UseGeminiReturn {
  callGemini: (prompt: string, systemPrompt?: string) => Promise<string | null>;
  callGeminiVision: (imageData: string, prompt?: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  getSystemPrompt: () => string;
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

export const useGemini = (): UseGeminiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSystemPrompt: getGenderedSystemPrompt } = useGenderedContent();

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
      // Extract base64 data and mime type from data URL
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

  return {
    callGemini,
    callGeminiVision,
    isLoading,
    error,
    getSystemPrompt,
  };
};