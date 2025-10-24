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
      const payload = {
        prompt: prompt,
        systemInstruction: systemPrompt || getGenderedSystemPrompt('general'),
      };
      
      console.log('Sending to Gemini API:', payload);

      const response = await fetch(`${API_BASE_URL}/gemini-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('API Error:', errorData);
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
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

      const response = await fetch(`${API_BASE_URL}/gemini-vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_TOKEN}`,
        },
        body: JSON.stringify({
          image: base64Data,
          mimeType: mimeType,
          prompt: prompt || 'Analyze this image and provide a detailed description.',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
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