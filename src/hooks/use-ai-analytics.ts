import { useState } from 'react';
import { useGemini } from './use-gemini';
import { Sub, Tribute } from '@/types';

interface AIAnalytics {
  sentimentScore: number;
  engagementLevel: 'high' | 'medium' | 'low';
  riskLevel: 'low' | 'medium' | 'high';
  suggestedActions: string[];
  contentSuggestions: string[];
}

interface ContentSuggestion {
  type: 'caption' | 'task' | 'message';
  content: string;
  tone: 'dominant' | 'caring' | 'strict' | 'playful';
  targetSub?: string;
  reasoning: string;
}

export const useAIAnalytics = () => {
  const { callGemini, isLoading } = useGemini();
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);

  const analyzeSubConversation = async (conversationHistory: string, subName: string): Promise<AIAnalytics> => {
    const systemPrompt = `You are an expert in findom relationship dynamics and sentiment analysis.
    Analyze the conversation history and provide:
    1. Sentiment score (-100 to 100, where negative indicates dissatisfaction)
    2. Engagement level (high/medium/low based on response frequency and enthusiasm)
    3. Risk level (low/medium/high based on warning signs like payment delays, complaints, etc.)
    4. Suggested actions to improve the relationship
    5. Content suggestions for next interactions
    
    Return your response as a JSON object with these exact keys: sentimentScore, engagementLevel, riskLevel, suggestedActions (array), contentSuggestions (array).`;

    const userPrompt = `Analyze this conversation with ${subName}: ${conversationHistory}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        const parsed = JSON.parse(result);
        setAnalytics(parsed);
        return parsed;
      }
    } catch (error) {
      console.error('Error analyzing conversation:', error);
    }

    return {
      sentimentScore: 0,
      engagementLevel: 'medium',
      riskLevel: 'low',
      suggestedActions: ['Continue regular engagement'],
      contentSuggestions: ['Send a check-in message']
    };
  };

  const generatePersonalizedContent = async (
    sub: Sub,
    contentType: 'caption' | 'task' | 'message',
    tone: 'dominant' | 'caring' | 'strict' | 'playful'
  ): Promise<ContentSuggestion[]> => {
    const systemPrompt = `You are a creative findom content creator specializing in personalized content.
    Generate 3 content suggestions based on the sub's profile and preferences.
    Each suggestion should include the content, tone, and reasoning for why it would work well.
    
    Return as a JSON array with objects containing: type, content, tone, reasoning, targetSub`;

    const userPrompt = `Generate ${contentType} content for ${sub.name} with a ${tone} tone.
    Sub details: Total contributed: $${sub.total}, Preferences: ${sub.preferences}, Notes: ${sub.notes}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        const parsed = JSON.parse(result);
        return parsed;
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }

    return [{
      type: contentType,
      content: `Generic ${contentType} for ${sub.name}`,
      tone,
      targetSub: sub.name,
      reasoning: 'Fallback suggestion due to error'
    }];
  };

  const generateAutomatedResponse = async (
    message: string,
    subName: string,
    context: string
  ): Promise<string> => {
    const systemPrompt = `You are an AI assistant for a findom dominant.
    Generate appropriate, professional responses to routine inquiries.
    Maintain the dominant persona while being helpful and clear.
    Keep responses concise and actionable.
    Do not make promises about specific amounts or timelines.`;

    const userPrompt = `Generate a response to this message from ${subName}: "${message}"
    Context: ${context}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      return result || 'Thank you for your message. I will review and respond appropriately.';
    } catch (error) {
      console.error('Error generating response:', error);
      return 'Thank you for your message. I will review and respond appropriately.';
    }
  };

  return {
    analytics,
    isLoading,
    analyzeSubConversation,
    generatePersonalizedContent,
    generateAutomatedResponse
  };
};