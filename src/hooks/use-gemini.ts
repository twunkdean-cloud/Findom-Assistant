import { useState } from 'react';
import { toast } from 'sonner';
import { useFindom } from '@/context/FindomContext';

interface UseGeminiOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useGemini = (options: UseGeminiOptions = {}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { appData } = useFindom();

  const getSystemPrompt = () => {
    return "You are an AI assistant specialized in creating detailed image editing prompts. Analyze uploaded images and generate comprehensive instructions for AI image editing tools.";
  };

  const callGemini = async (userPrompt: string, systemPrompt: string, conversationHistory?: string) => {
    if (!appData.apiKey) {
      toast.error('Please set your Gemini API key in Settings.');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://qttmhbtaguiioomcjqbt.supabase.co'}/functions/v1/generate-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt: userPrompt,
            systemPrompt,
            conversationHistory,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate text');
      }

      const data = await response.json();
      options.onSuccess?.(data);
      return data.text || data.result || data.response;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      toast.error(error.message);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const generateText = async (prompt: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://qttmhbtaguiioomcjqbt.supabase.co'}/functions/v1/generate-text`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ prompt }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate text');
      }

      const data = await response.json();
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const generateImageDescription = async (prompt: string, imageData: string, imageMimeType: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL || 'https://qttmhbtaguiioomcjqbt.supabase.co'}/functions/v1/generate-image`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            prompt,
            imageData,
            imageMimeType,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate image description');
      }

      const data = await response.json();
      options.onSuccess?.(data);
      return data;
    } catch (err) {
      const error = err as Error;
      setError(error);
      options.onError?.(error);
      toast.error(error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    callGemini,
    getSystemPrompt,
    generateText,
    generateImageDescription,
    isLoading,
    error,
  };
};