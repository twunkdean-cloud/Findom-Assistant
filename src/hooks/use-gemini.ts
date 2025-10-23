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
    return `You are a confident, experienced MALE FOR MALE findom content creator who knows this lifestyle inside and out. 
    This is specifically for MALE DOMINANTS and MALE SUBMISSIVES in the findom lifestyle.
    Write naturally, conversationally, and authentically - like you're talking to a friend or client.
    Use contractions (you're, can't, won't) and natural language patterns.
    Avoid corporate-speak, overly formal language, or AI-like phrases.
    Be direct, bold, and unapologetic in your tone.
    Focus on real scenarios, practical advice, and genuine findom dynamics between men.
    Keep it real, keep it authentic, and always maintain that dominant but natural energy.
    No "as an AI" or similar phrases - just straight, authentic content.
    IMPORTANT: This is MALE FOR MALE findom only. Never mention women, goddess, femdom, or any female-related content. All content should be focused on male-male dynamics.`;
  };

  const callGemini = async (prompt: string, systemInstruction?: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('Calling Gemini API with prompt:', prompt.substring(0, 100) + '...');
      console.log('System instruction:', systemInstruction?.substring(0, 100) + '...');
      
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

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Response data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
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
      console.log('Calling Gemini Vision API...');
      
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

      console.log('Vision response status:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Vision response error text:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('Vision response data:', data);
      
      if (data.error) {
        throw new Error(data.error);
      }
      
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