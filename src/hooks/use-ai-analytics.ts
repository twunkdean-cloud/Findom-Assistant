import { useState } from 'react';
import { useGemini } from './use-gemini';
import { Sub, Tribute, AIContentSuggestion, ServiceResponse } from '@/types';

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

export const useAIAnalytics = () => {
  const { callGemini, isLoading } = useGemini();
  const [analytics, setAnalytics] = useState<AIAnalytics | null>(null);

  const analyzeSubConversation = async (
    request: ConversationAnalysisRequest
  ): Promise<ServiceResponse<AIAnalytics>> => {
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
        // Try to extract JSON from response
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
          return {
            data: analyticsData,
            success: true,
            error: null
          };
        }
      }
      
      // Fallback response
      const fallbackAnalytics: AIAnalytics = {
        sentimentScore: 0,
        engagementLevel: 'medium',
        riskLevel: 'low',
        suggestedActions: ['Continue regular engagement'],
        contentSuggestions: ['Send a check-in message']
      };
      
      return {
        data: fallbackAnalytics,
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Error analyzing conversation:', error);
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      };
    }
  };

  const generatePersonalizedContent = async (
    request: ContentGenerationRequest
  ): Promise<ServiceResponse<AIContentSuggestion[]>> => {
    const systemPrompt = `You are a creative findom content creator specializing in personalized content.
    Generate 3 content suggestions based on sub's profile and preferences.
    Each suggestion should include content, tone, and reasoning for why it would work well.
    
    Return ONLY a JSON array with objects containing: type, content, tone, reasoning, targetSub
    Example format:
    [
      {
        "type": "task",
        "content": "Send me $50 tribute by midnight",
        "tone": "dominant",
        "reasoning": "Direct command reinforces your authority",
        "targetSub": "sub_name"
      }
    ]`;

    const userPrompt = `Generate ${request.contentType} content for ${request.sub.name} with a ${request.tone} tone.
    Sub details: Total contributed: $${request.sub.total}, Preferences: ${request.sub.preferences || 'None specified'}, Notes: ${request.sub.notes || 'No notes'}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        // Try to extract JSON array from response
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          // Ensure we have an array with valid objects
          if (Array.isArray(parsed) && parsed.length > 0) {
            const suggestions: AIContentSuggestion[] = parsed.map((item, index) => ({
              type: item.type || request.contentType,
              content: item.content || `Generated ${request.contentType} ${index + 1}`,
              tone: item.tone || request.tone,
              targetSub: item.targetSub || request.sub.name,
              reasoning: item.reasoning || 'Personalized content suggestion',
              priority: item.priority || 'medium'
            }));
            return {
              data: suggestions,
              success: true,
              error: null
            };
          }
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }

    // Return meaningful fallback suggestions instead of generic ones
    const fallbackSuggestions: AIContentSuggestion[] = [
      {
        type: request.contentType,
        content: generateFallbackContent(request.contentType, request.tone, request.sub.name),
        tone: request.tone,
        targetSub: request.sub.name,
        reasoning: 'Personalized suggestion based on your preferences',
        priority: 'medium'
      },
      {
        type: request.contentType,
        content: generateFallbackContent(request.contentType, request.tone, request.sub.name, true),
        tone: request.tone,
        targetSub: request.sub.name,
        reasoning: 'Alternative suggestion for variety',
        priority: 'medium'
      },
      {
        type: request.contentType,
        content: generateFallbackContent(request.contentType, request.tone, request.sub.name, false, true),
        tone: request.tone,
        targetSub: request.sub.name,
        reasoning: 'Engaging content to maintain connection',
        priority: 'medium'
      }
    ];

    return {
      data: fallbackSuggestions,
      success: true,
      error: null
    };
  };

  const generateFallbackContent = (
    contentType: 'caption' | 'task' | 'message',
    tone: 'dominant' | 'caring' | 'strict' | 'playful',
    subName: string,
    alt: boolean = false,
    engaging: boolean = false
  ): string => {
    const templates = {
      dominant: {
        task: [
          `Send me a tribute by tonight, ${subName}. Don't keep me waiting.`,
          `Your task: Clear your schedule and focus on serving me properly.`,
          `Prove your devotion with a $100 tribute, ${subName}. Now.`
        ],
        message: [
          `I expect your full attention, ${subName}. Message me when you're ready to serve.`,
          `Your purpose is to please me. Show me you understand this, ${subName}.`,
          `Don't disappoint me, ${subName}. I have high expectations for you.`
        ],
        caption: [
          `Another day, another tribute. Keep them coming, my loyal subs.`,
          `Power isn't given, it's taken. And you've given it to me willingly.`,
          `Your devotion fuels my power. Show me how much you worship me.`
        ]
      },
      caring: {
        task: [
          `Take some time for yourself today, ${subName}. Then send me a thoughtful tribute.`,
          `I want you to focus on your well-being. Message me when you're feeling good.`,
          `Your growth is important to me. Complete this task and let me know how it felt.`
        ],
        message: [
          `How are you doing today, ${subName}? I want to make sure you're taking care of yourself.`,
          `I appreciate your dedication. Let's talk about your goals and how I can help.`,
          `Remember that your well-being matters to me. Check in when you have a moment.`
        ],
        caption: [
          `Taking care of my subs is part of my power. Your growth is my success.`,
          `True dominance includes compassion. I'm here to guide and protect.`,
          `Your journey is important to me. Let's achieve greatness together.`
        ]
      },
      strict: {
        task: [
          `Complete this task by deadline: $50 tribute by 8 PM. No exceptions.`,
          `Your schedule for today is set. Follow it precisely or face consequences.`,
          `I expect perfection in this task. Anything less is unacceptable.`
        ],
        message: [
          `Your performance has been lacking, ${subName}. We need to discuss improvements.`,
          `The rules are clear. Follow them or there will be consequences.`,
          `I don't accept excuses. Complete your obligations or face punishment.`
        ],
        caption: [
          `Discipline is the foundation of devotion. Learn it well.`,
          `Rules exist for a reason. Break them and learn consequences.`,
          `Excellence isn't optional. It's required.`
        ]
      },
      playful: {
        task: [
          `Let's play a game! Send me a tribute and I'll give you a special reward 😉`,
          `Your mission, should you choose to accept it: Make me smile with a tribute!`,
          `Time for some fun! Complete this challenge and earn my attention.`
        ],
        message: [
          `Guess what I have planned for you today, ${subName}? 😈`,
          `I'm in a playful mood! Want to join my game?`,
          `Let's have some fun together! I have something special in mind.`
        ],
        caption: [
          `Life's too short to be serious all the time. Let's play!`,
          `Who says domination can't be fun? Game on!`,
          `Playtime with your favorite dom! Who's ready to join?`
        ]
      }
    };

    const toneTemplates = templates[tone][contentType];
    const index = alt ? 1 : engaging ? 2 : 0;
    return toneTemplates[index] || toneTemplates[0];
  };

  const generateAutomatedResponse = async (
    message: string,
    subName: string,
    context: string
  ): Promise<ServiceResponse<string>> => {
    const systemPrompt = `You are an AI assistant for a findom dominant.
    Generate appropriate, professional responses to routine inquiries.
    Maintain dominant persona while being helpful and clear.
    Keep responses concise and actionable.
    Do not make promises about specific amounts or timelines.`;

    const userPrompt = `Generate a response to this message from ${subName}: "${message}"
    Context: ${context}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      return {
        data: result || 'Thank you for your message. I will review and respond appropriately.',
        success: true,
        error: null
      };
    } catch (error) {
      console.error('Error generating response:', error);
      return {
        data: 'Thank you for your message. I will review and respond appropriately.',
        success: false,
        error: error instanceof Error ? error.message : 'Response generation failed'
      };
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