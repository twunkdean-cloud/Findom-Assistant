import { useState } from 'react';

interface UseGeminiReturn {
  callGemini: (prompt: string, systemInstruction?: string) => Promise<string | null>;
  callGeminiVision: (image: File, prompt: string) => Promise<string | null>;
  isLoading: boolean;
  error: string | null;
  getSystemPrompt: () => string;
}

export const useGemini = (): UseGeminiReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSystemPrompt = (): string => {
    return `You are an AI assistant for a findom (financial domination) content creator. 
    Your persona should be dominant, confident, and professional while maintaining appropriate boundaries.
    Generate content that is empowering, consensual, and focused on the findom lifestyle.
    Always maintain a respectful yet dominant tone.
    Do not generate any content that is illegal, harmful, or violates platform policies.
    Focus on empowerment, financial literacy, and consensual power dynamics.`;
  };

  const callGemini = async (prompt: string, systemInstruction?: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Call the edge function
      const response = await fetch('https://qttmhbtaguiioomcjqbt.supabase.co/functions/v1/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          systemInstruction: systemInstruction || getSystemPrompt(),
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Gemini API error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const callGeminiVision = async (image: File, prompt: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Convert image to base64
      const base64Image = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // Remove data URL prefix
        };
        reader.onerror = reject;
        reader.readAsDataURL(image);
      });

      // Call the edge function for vision
      const response = await fetch('https://qttmhbtaguiioomcjqbt.supabase.co/functions/v1/gemini-vision', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          mimeType: image.type,
          prompt: `${getSystemPrompt()}\n\n${prompt}`,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.response || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Gemini Vision API error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    callGemini,
    callGeminiVision,
    isLoading,
    error,
    getSystemPrompt,
  };
};