import { useState, useCallback } from 'react';
import { useFindom } from '@/context/FindomContext';
import { toast } from 'sonner';

export function useGemini() {
  const { appData } = useFindom();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSystemPrompt = useCallback(() => {
    const { name, specialties, style } = appData.persona;
    let mistakes = "To make it less obvious that this is AI generated, make some grammatical or typo mistakes.";
    let hashtags = "Use two or three hashtags for each post you create.";
    let readingLevel = "Use a 9th grade reading level in your response.";
    let prompt = `You are a male findom Switch and content creator. You are an expert at writing engaging and dominant content for social media and direct messages. Your persona name is ${name}. Your style is ${style}. You specialize in ${specialties}. ${mistakes} ${hashtags} ${readingLevel} Your responses should be in character, concise, and effective.`;
    return prompt;
  }, [appData.persona]);

  const callGemini = useCallback(async (userPrompt: string, systemPrompt?: string) => {
    setIsLoading(true);
    setError(null);

    const apiKey = appData.apiKey;
    if (!apiKey) {
      toast.error('Error: API Key is not set in Settings.');
      setIsLoading(false);
      return null;
    }

    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    try {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemPrompt || getSystemPrompt() }] },
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error.message || `API request failed with status ${response.status}`);
      }

      const result = await response.json();
      return result.candidates?.[0]?.content?.parts?.[0]?.text;
    } catch (err: any) {
      console.error('Error calling Gemini API:', err);
      setError(err.message);
      toast.error(`API Error: ${err.message}`);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [appData.apiKey, getSystemPrompt]);

  return { callGemini, isLoading, error, getSystemPrompt };
}