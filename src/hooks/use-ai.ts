import { useState, useCallback } from 'react';
import { useGenderedContent } from './use-gendered-content';
import { API_BASE_URL } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { Sub, AIContentSuggestion, ServiceResponse } from '@/types';
import { cache } from '@/utils/cache';
import { sanitizeAiText } from '@/utils/ai-sanitize';

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

// Helper utilities to reduce token usage
const toCompactString = (input: unknown): string => {
  if (input == null) return '';
  if (typeof input === 'string') return input;
  try {
    return JSON.stringify(input);
  } catch {
    return String(input);
  }
};

const compactText = (input?: unknown) => {
  const str = toCompactString(input);
  return str ? str.replace(/\s+/g, ' ').trim() : '';
};

const trimTail = (input: unknown, maxChars: number) => {
  const str = toCompactString(input);
  return str.length > maxChars ? str.slice(str.length - maxChars) : str;
};

// Helper to get current user's JWT
const getAuthToken = async (): Promise<string> => {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  if (!token) {
    throw new Error('You must be signed in to use AI features.');
  }
  return token;
};

export const useAI = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { getSystemPrompt: getGenderedSystemPrompt } = useGenderedContent();
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);

  const callGemini = useCallback(async (
    prompt: string, 
    systemPrompt?: string
  ): Promise<string | null> => {
    // Compact inputs to reduce tokens
    const compactPrompt = compactText(prompt);
    const compactSystem = compactText(systemPrompt || getGenderedSystemPrompt('general'));
    // Sanitize to remove currency/total references everywhere
    const sanitizedPrompt = sanitizeAiText(compactPrompt);
    const sanitizedSystem = sanitizeAiText(compactSystem);

    const cacheKey = `gemini:${sanitizedPrompt}:${sanitizedSystem}`;
    const cached = cache.get<string>(cacheKey);
    if (cached) {
      toast.info('Returning cached AI response.');
      return cached;
    }

    setIsLoading(true);
    setError(null);

    try {
      const payload: GeminiRequest = {
        prompt: sanitizedPrompt,
        systemInstruction: sanitizedSystem,
      };

      const response = await fetch(`${API_BASE_URL}/gemini-chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
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
        // Shorter default prompt and sanitized to remove money references
        prompt: sanitizeAiText(compactText(prompt) || 'Describe this image briefly.'),
      };

      const response = await fetch(`${API_BASE_URL}/gemini-vision`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await getAuthToken()}`,
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

    // Concise, schema-first system prompt
    const systemPrompt = compactText(`Act as a findom relationship analyst.
Return ONLY JSON with keys:
sentimentScore:number, engagementLevel:'high'|'medium'|'low', riskLevel:'low'|'medium'|'high',
suggestedActions:string[], contentSuggestions:string[].`);

    // Trim long history, then compact
    const history = compactText(trimTail(request.conversationHistory, 4000));
    const userPrompt = `Analyze conversation with ${request.subName}. History: ${history}`;

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

    // Concise, schema-first system prompt
    const systemPrompt = compactText(`Return ONLY a compact JSON array of 3 items with keys:
    type, content, tone, reasoning, targetSub.
    Rules: Do NOT include any currency amounts or propose specific dollar values; avoid referencing tribute totals.`);

    const userPrompt = compactText(`Create ${request.contentType} suggestions for ${request.sub.name} with ${request.tone} tone.
    Context: Prefs=${request.sub.preferences || 'None'}; Notes=${request.sub.notes || 'None'}.
    Focus on relationship dynamics and actionable phrasing, without mentioning money or dollar amounts.`);

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

    // Concise, schema-first system prompt
    const systemPrompt = compactText(`Return ONLY a compact JSON array (3 items) with keys:
action, reason, confidence:'high'|'medium'|'low', suggestedTone?:'dominant'|'seductive'|'strict'|'caring'|'playful', type?:'nudge'|'tribute_escalation'|'check_in'|'reward'|'boundary'|'task'.`);

    // Minify JSON context
    const summary = {
      sub: sub
        ? {
            name: sub.name,
            // Intentionally exclude numeric totals to prevent currency leakage
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

    const userPrompt = `CTX:${JSON.stringify(summary)} Next best 3 actions.`;

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

    // Concise system prompt
    const systemPrompt = compactText(`You are a findom assistant.
Write a concise, professional, dominant reply.
Avoid promises or specifics.`);

    const userPrompt = compactText(`From ${subName}: "${message}". Ctx: ${context}`);

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