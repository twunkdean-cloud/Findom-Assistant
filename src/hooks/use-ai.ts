import { useState, useCallback } from 'react';
import { useGenderedContent } from './use-gendered-content';
import { API_BASE_URL, API_TOKEN } from '@/constants';
import { toast } from '@/utils/toast';
import { Sub, AIContentSuggestion, ServiceResponse } from '@/types';
import { cache } from '@/utils/cache';

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
    const cacheKey = `gemini:${prompt}:${systemPrompt}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      toast.info('Returning cached AI response.');
      return cached;
    }

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
      const result = data.response || data.content || null;
      
      if (result) {
        cache.set(cacheKey, result);
      }

      return result;
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
    const cacheKey = `gemini-vision:${imageData.substring(0, 50)}:${prompt}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      toast.info('Returning cached AI vision response.');
      return cached;
    }

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
      const result = data.response || data.content || null;

      if (result) {
        cache.set(cacheKey, result);
      }

      return result;
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
    setIsLoading(true);
    setError(null);
    const systemPrompt = `You are an expert in findom relationship dynamics and sentiment analysis.
    Analyze conversation history and provide:
    1. Sentiment score (-100 to 100, where negative indicates dissatisfaction)
    2. Engagement level (high/medium/low based on response frequency and enthusiasm)
    3. Risk level (low/medium/high based on warning signs like payment delays, complaints, etc.)
    4. Suggested actions to improve relationship
    5. Content suggestions for next interactions
    
    Return your response as a JSON object with these exact keys: sentimentScore, engagementLevel, riskLevel, suggestedActions (array), contentSuggestions (array).`;

    const userPrompt = `Analyze this conversation with ${request.subName}: ${request.conversationHistory}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          const analyticsData: AIAnalytics = {
            sentimentScore: parsed.sentimentScore || 0,
            engagementLevel: parsed.engagementLevel || 'medium',
            riskLevel: parsed.riskLevel || 'low',
            suggestedActions: parsed.suggestedActions || ['Continue regular engagement'],
            contentSuggestions: parsed.contentSuggestions || ['Send a check-in message']
          };
          setAnalytics(analyticsData);
          return { data: analyticsData, success: true };
        }
      }
      throw new Error("Failed to parse AI response.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      console.error('Error analyzing conversation:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const generatePersonalizedContent = async (
    request: ContentGenerationRequest
  ): Promise<ServiceResponse<AIContentSuggestion[]>> => {
    setIsLoading(true);
    setError(null);
    const systemPrompt = `You are a creative findom content creator specializing in personalized content.
    Generate 3 content suggestions based on sub's profile and preferences.
    Each suggestion should include content, tone, and reasoning for why it would work well.
    
    Return ONLY a JSON array with objects containing: type, content, tone, reasoning, targetSub.`;

    const userPrompt = `Generate ${request.contentType} content for ${request.sub.name} with a ${request.tone} tone.
    Sub details: Total contributed: $${request.sub.total}, Preferences: ${request.sub.preferences || 'None specified'}, Notes: ${request.sub.notes || 'No notes'}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed) && parsed.length > 0) {
            const suggestions: AIContentSuggestion[] = parsed.map((item, index) => ({
              type: item.type || request.contentType,
              content: item.content || `Generated ${request.contentType} ${index + 1}`,
              tone: item.tone || request.tone,
              targetSub: item.targetSub || request.sub.name,
              reasoning: item.reasoning || 'Personalized content suggestion',
              priority: item.priority || 'medium'
            }));
            return { data: suggestions, success: true };
          }
        }
      }
      throw new Error("Failed to parse AI response for content generation.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Content generation failed';
      console.error('Error generating content:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // NEW: Next Best Actions generator
  type RecentMessage = { role: 'user' | 'assistant'; content: string };
  interface NextBestActionsParams {
    sub?: Sub | null;
    recentTributes?: { amount: number; date: string; reason?: string; notes?: string }[];
    recentMessages?: RecentMessage[];
    currentTone?: 'dominant' | 'seductive' | 'strict' | 'caring' | 'playful';
    gender?: 'male' | 'female';
  }

  const generateNextBestActions = async (
    params: NextBestActionsParams
  ): Promise<ServiceResponse<import('@/types').NextBestAction[]>> => {
    setIsLoading(true);
    setError(null);

    const { sub, recentTributes = [], recentMessages = [], currentTone, gender } = params;

    const systemPrompt = `You are a strategic assistant for a financial domination creator.
Provide the next best 3 actions to maximize engagement and revenue while maintaining consent and boundaries.
Tailor to the specific sub's history when provided.
Return ONLY a JSON array with objects using keys: action, reason, confidence ('high'|'medium'|'low'), suggestedTone (optional: 'dominant'|'seductive'|'strict'|'caring'|'playful'), type (optional: 'nudge'|'tribute_escalation'|'check_in'|'reward'|'boundary'|'task').`;

    const summary = {
      sub: sub
        ? {
            name: sub.name,
            total: sub.total,
            lastTribute: sub.lastTribute ?? null,
            preferences: sub.preferences ?? null,
            notes: sub.notes ?? null,
          }
        : null,
      recentTributes: recentTributes.slice(0, 5),
      recentMessages: recentMessages.slice(-10),
      context: {
        tone: currentTone ?? 'dominant',
        gender: gender ?? 'male',
      },
    };

    const userPrompt = `Context JSON:\n${JSON.stringify(summary, null, 2)}\n\nGenerate 3 next best actions.`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]) as import('@/types').NextBestAction[];
          if (Array.isArray(parsed) && parsed.length > 0) {
            return { data: parsed.slice(0, 3), success: true };
          }
        }
      }
      throw new Error('Failed to parse AI response for next best actions.');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Next best action generation failed';
      console.error('Error generating next best actions:', err);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const generateAutomatedResponse = async (
    message: string,
    subName: string,
    context: string
  ): Promise<ServiceResponse<string>> => {
    setIsLoading(true);
    setError(null);
    const systemPrompt = `You are an AI assistant for a findom dominant.
    Generate appropriate, professional responses to routine inquiries.
    Maintain dominant persona while being helpful and clear.
    Keep responses concise and actionable.
    Do not make promises about specific amounts or timelines.`;

    const userPrompt = `Generate a response to this message from ${subName}: "${message}"
    Context: ${context}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      return { data: result || 'Thank you for your message. I will review and respond appropriately.', success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Response generation failed';
      console.error('Error generating response:', error);
      setError(errorMessage);
      return { success: false, error: errorMessage };
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
    analytics,
    analyzeSubConversation,
    generatePersonalizedContent,
    generateAutomatedResponse,
    generateNextBestActions,
  };
};