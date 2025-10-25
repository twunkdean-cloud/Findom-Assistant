import { useMemo } from 'react';
import { useFindom } from '@/context/FindomContext';
import { PERSONA_OPTIONS, GENDER_HASHTAGS } from '@/constants';

interface GenderedContent {
  systemPrompt: string;
  persona: string;
  tone: string;
}

interface GenderedContentMap {
  [key: string]: GenderedContent;
}

export const useGenderedContent = () => {
  const { appData } = useFindom();
  const gender = appData.profile?.gender || 'male';
  const isMale = gender === 'male';
  const isFemale = gender === 'female';

  const getSystemPrompt = (contentType: string): string => {
    const persona = appData.profile?.persona || 'dominant';
    const personaOptions = PERSONA_OPTIONS[gender];
    const selectedPersona = personaOptions.find(p => p.value === persona);
    const basePrompt = selectedPersona ? selectedPersona.description : personaOptions[0].description;
    
    const contentSpecificInstructions: Record<string, string> = {
      general: basePrompt,
      caption: `${basePrompt} Focus on creating engaging social media captions that attract attention and encourage tribute.`,
      task: `${basePrompt} Focus on creating clear, actionable tasks that reinforce your dominance and require submission.`,
      message: `${basePrompt} Focus on personal messages that maintain control and deepen the power dynamic.`,
      response: `${basePrompt} Focus on providing appropriate responses that maintain your dominant position while addressing the sub's needs.`,
      twitter: `${basePrompt} For Twitter content: Keep tweets under 280 characters. Use relevant hashtags. Be provocative but within Twitter's guidelines. Include clear calls to action when appropriate.`,
      reddit: `${basePrompt} For Reddit content: Follow subreddit rules and formatting. Use appropriate flairs when required. Be engaging and authentic to the Reddit community.`,
    };

    return contentSpecificInstructions[contentType] || basePrompt;
  };

  const getPersonaTones = () => {
    return PERSONA_OPTIONS[gender];
  };

  const getHashtags = () => {
    return GENDER_HASHTAGS[gender];
  };

  const getTargetAudience = () => {
    return isMale ? 'male subs' : 'male subs serving a female dominant';
  };

  return {
    getSystemPrompt,
    getPersonaTones,
    getHashtags,
    getTargetAudience,
    isMale,
    isFemale,
  };
};