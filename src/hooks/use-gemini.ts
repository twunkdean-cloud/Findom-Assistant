import { useState, useCallback } from 'react';
import { useGenderedContent } from './use-gendered-content';

interface UseGeminiReturn {
  callGemini: (prompt: string, systemPrompt?: string) => Promise<string | null>;
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
      const response = await fetch('https://qttmhbtaguiioomcjqbt.supabase.co/functions/v1/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dG1oYnRhZ3VpaW9vbWNqcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjQ5MDMsImV4cCI6MjA3NjMwMDkwM30.M4AiSRnA0xfmDgmtxYaKr4GT7bvzoFS3ukxpsN3b8K0`,
        },
        body: JSON.stringify({
          message: prompt,
          systemPrompt: systemPrompt || getGenderedSystemPrompt('general'),
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
      console.error('Gemini API error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getGenderedSystemPrompt]);

  const getSystemPrompt = useCallback(() => {
    return getGenderedSystemPrompt('general');
  }, [getGenderedSystemPrompt]);

  return {
    callGemini,
    isLoading,
    error,
    getSystemPrompt,
  };
};