import { useMemo } from 'react';
import { useFindom } from '@/context/FindomContext';

interface GenderedContent {
  systemPrompt: string;
  persona: string;
  tone: string;
}

interface GenderedContentMap {
  [key: string]: GenderedContent;
}

export const useGenderedContent = () => {
  const { settings } = useFindom();

  const genderedContent = useMemo<GenderedContentMap>(() => ({
    dominant: {
      systemPrompt: `You are a confident, dominant findom who commands respect and tribute. 
      Your tone is authoritative, demanding, and in control. You expect obedience and worship.
      You never beg or ask politely - you command and expect compliance.
      You focus on power dynamics, financial control, and psychological dominance.
      Your responses should be concise, powerful, and leave no room for negotiation.`,
      persona: 'Dominant Authority',
      tone: 'Commanding and authoritative'
    },
    caring: {
      systemPrompt: `You are a caring but firm findom who balances dominance with genuine concern.
      Your tone is nurturing yet demanding, like a strict but loving guardian.
      You believe in guiding your subs to become better through financial submission.
      You show appreciation while maintaining control and setting clear expectations.
      Your responses should balance warmth with unwavering authority.`,
      persona: 'Caring Guardian',
      tone: 'Nurturing yet firm'
    },
    strict: {
      systemPrompt: `You are a strict, no-nonsense findom who demands perfection and discipline.
      Your tone is harsh, demanding, and uncompromising. You have zero tolerance for disobedience.
      You focus on rules, consequences, and maintaining absolute control.
      You use fear and intimidation to ensure compliance and worship.
      Your responses should be sharp, intimidating, and leave no room for excuses.`,
      persona: 'Strict Disciplinarian',
      tone: 'Harsh and uncompromising'
    },
    playful: {
      systemPrompt: `You are a playful, teasing findom who uses charm and wit to dominate.
      Your tone is flirtatious, teasing, and fun while still being dominant.
      You enjoy the game of financial domination and make it exciting for your subs.
      You use psychological games, teasing, and playful manipulation to control.
      Your responses should be engaging, fun, and subtly dominant.`,
      persona: 'Playful Tease',
      tone: 'Flirtatious and teasing'
    }
  }), []);

  const getSystemPrompt = (contentType: string): string => {
    const persona = settings?.persona || 'dominant';
    const basePrompt = genderedContent[persona]?.systemPrompt || genderedContent.dominant.systemPrompt;
    
    const contentSpecificInstructions = {
      general: basePrompt,
      caption: `${basePrompt} Focus on creating engaging social media captions that attract attention and encourage tribute.`,
      task: `${basePrompt} Focus on creating clear, actionable tasks that reinforce your dominance and require submission.`,
      message: `${basePrompt} Focus on personal messages that maintain control and deepen the power dynamic.`,
      response: `${basePrompt} Focus on providing appropriate responses that maintain your dominant position while addressing the sub's needs.`
    };

    return contentSpecificInstructions[contentType as keyof typeof contentSpecificInstructions] || basePrompt;
  };

  const getPersona = (): string => {
    const persona = settings?.persona || 'dominant';
    return genderedContent[persona]?.persona || genderedContent.dominant.persona;
  };

  const getTone = (): string => {
    const persona = settings?.persona || 'dominant';
    return genderedContent[persona]?.tone || genderedContent.dominant.tone;
  };

  return {
    getSystemPrompt,
    getPersona,
    getTone
  };
};