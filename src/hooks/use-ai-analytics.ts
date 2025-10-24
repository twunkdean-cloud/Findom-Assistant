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
        // Try to extract JSON from the response
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setAnalytics(parsed);
          return parsed;
        } else {
          console.error('No JSON found in response:', result);
        }
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

    const userPrompt = `Generate ${contentType} content for ${sub.name} with a ${tone} tone.
    Sub details: Total contributed: $${sub.total}, Preferences: ${sub.preferences || 'None specified'}, Notes: ${sub.notes || 'No notes'}`;

    try {
      const result = await callGemini(userPrompt, systemPrompt);
      if (result) {
        // Try to extract JSON array from the response
        const jsonMatch = result.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          // Ensure we have an array with valid objects
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed.map((item, index) => ({
              type: item.type || contentType,
              content: item.content || `Generated ${contentType} ${index + 1}`,
              tone: item.tone || tone,
              targetSub: item.targetSub || sub.name,
              reasoning: item.reasoning || 'Personalized content suggestion'
            }));
          }
        } else {
          console.error('No JSON array found in response:', result);
        }
      }
    } catch (error) {
      console.error('Error generating content:', error);
    }

    // Return meaningful fallback suggestions instead of generic ones
    return [
      {
        type: contentType,
        content: generateFallbackContent(contentType, tone, sub.name),
        tone,
        targetSub: sub.name,
        reasoning: 'Personalized suggestion based on your preferences'
      },
      {
        type: contentType,
        content: generateFallbackContent(contentType, tone, sub.name, true),
        tone,
        targetSub: sub.name,
        reasoning: 'Alternative suggestion for variety'
      },
      {
        type: contentType,
        content: generateFallbackContent(contentType, tone, sub.name, false, true),
        tone,
        targetSub: sub.name,
        reasoning: 'Engaging content to maintain connection'
      }
    ];
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
          `Complete this task by the deadline: $50 tribute by 8 PM. No exceptions.`,
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
          `Rules exist for a reason. Break them and learn the consequences.`,
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