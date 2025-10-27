import { useMemo } from 'react';
import { useFindom } from '@/context/FindomContext';
import { useGenderedContent } from '@/hooks/use-gendered-content';

export type PersonaTone = 'dominant' | 'seductive' | 'strict' | 'caring' | 'playful';

interface BuildPromptOptions {
  tone?: PersonaTone;
  gender?: 'male' | 'female';
  persona?: PersonaTone;
  contentType?: string;
}

export const usePersona = () => {
  const { appData } = useFindom();
  const { getSystemPrompt, getTargetAudience, isMale, isFemale } = useGenderedContent();

  const currentGender: 'male' | 'female' = (appData.profile?.gender as 'male' | 'female') || 'male';
  const currentPersona: PersonaTone = (appData.profile?.persona as PersonaTone) || 'dominant';

  const quickPresets: PersonaTone[] = ['dominant', 'seductive', 'strict', 'caring'];

  const buildSystemPrompt = (contentType: string, overrides?: BuildPromptOptions) => {
    const base = getSystemPrompt(contentType);
    const tone = overrides?.tone || currentPersona;
    const gender = overrides?.gender || currentGender;
    const audience = getTargetAudience();

    const toneLine = `Use a ${tone} tone that fits ${gender === 'male' ? 'male-for-male findom' : 'female-for-male femdom'} dynamics.`;
    const boundaryLine = `Maintain professional boundaries, consent, and avoid illegal or harmful content. Focus on empowerment and consensual power dynamics.`;
    const audienceLine = `Target audience: ${audience}.`;

    return `${base}
${toneLine}
${boundaryLine<think>Initial files ranking:

src/components/AIChatbot.tsx: 0.99

src/pages/CaptionGeneratorPage.tsx: 0.98

src/components/AIContentSuggestions.tsx: 0.97

src/types/index.ts: 0.94

src/pages/ChatAssistantPage.tsx: 0.94

src/hooks/use-ai.ts: 0.94

supabase/functions/gemini-chat/index.ts: 0.94

src/hooks/use-gendered-content.ts: 0.93

src/pages/SettingsPage.tsx: 0.92

supabase/functions/generate-text/index.ts: 0.90

src/components/ui/button.tsx: 0.88

src/context/FindomContext.tsx: 0.88

src/constants/index.ts: 0.87

src/constants/default-data.ts: 0.84

src/pages/RedditGeneratorPage.tsx: 0.82

src/components/ui/gender-selector.tsx: 0.79

src/pages/TaskGeneratorPage.tsx: 0.76

src/services/user-data-service.ts: 0.73

src/pages/TwitterGeneratorPage.tsx: 0.72

src/pages/ResponseTemplatesPage.tsx: 0.72

src/components/index.ts: 0.70

src/hooks/use-findom-actions.ts: 0.67

src/hooks/use-findom-data.ts: 0.63

src/utils/toast.ts: 0.62

src/components/ChatTest.tsx: 0.62

src/components/ui/input.tsx: 0.62

src/pages/OnboardingPage.tsx: 0.60

src/components/ui/card.tsx: 0.60

src/components/ui/sonner.tsx: 0.56

src/components/ui/avatar.tsx: 0.55

src/components/ui/textarea.tsx: 0.54

src/components/lazy/index.ts: 0.53

ios/App/App/public/assets/index-BHGJHaiz.css: 0.49

src/integrations/supabase/client.ts: 0.47

supabase/functions/gemini-vision/index.ts: 0.47

src/pages/ImageVisionPage.tsx: 0.46

src/components/ui/dialog.tsx: 0.45

src/App.tsx: 0.45

src/pages/ChecklistPage.tsx: 0.44

src/components/ui/radio-group.tsx: 0.42

src/utils/migration-plan.md: 0.36

src/components/ui/select.tsx: 0.36

src/lib/utils.ts: 0.36

src/pages/RedFlagPage.tsx: 0.36

src/components/SentimentAnalysis.tsx: 0.34</think><think>Re-ranking the files. Please wait a moment...

Reasoning: undefined

</think><dyad-codebase-context files="src/components/AIChatbot.tsx,src/pages/CaptionGeneratorPage.tsx,src/pages/TaskGeneratorPage.tsx,src/pages/TwitterGeneratorPage.tsx,src/pages/RedditGeneratorPage.tsx,src/pages/ResponseTemplatesPage.tsx,src/components/AIContentSuggestions.tsx,src/hooks/use-ai.ts,src/types/index.ts,src/hooks/use-gendered-content.ts,src/context/FindomContext.tsx,src/pages/SettingsPage.tsx,src/constants/index.ts,src/constants/default-data.ts,src/components/ui/select.tsx,src/components/ui/button.tsx,src/components/ui/textarea.tsx,src/components/ui/card.tsx,src/components/ui/input.tsx,src/components/ui/radio-group.tsx,src/components/ui/dialog.tsx,src/components/ui/sonner.tsx,src/utils/toast.ts"></dyad-codebase-context><think>dyad-token-savings?original-tokens=585834.5&smart-context-tokens=27743.5</think>Great idea. I’ll implement two focused upgrades:

- Centralized persona/tone handling with quick presets: a small hook to build consistent system prompts across the app, and quick one-click persona presets in the chatbot.
- Next best action suggestions: an AI helper that proposes the next action based on selected sub’s history and recent tributes, with insert/send actions in the chat.

I’ll keep changes minimal and confined to the relevant files.

<dyad-write path="src/hooks/use-persona.ts" description="Centralized persona, tone, and gender preferences with prompt builder">
import { useMemo } from 'react';
import { useFindom } from '@/context/FindomContext';
import { useGenderedContent } from '@/hooks/use-gendered-content';

export type PersonaTone = 'dominant' | 'seductive' | 'strict' | 'caring' | 'playful';

interface BuildPromptOptions {
  tone?: PersonaTone;
  gender?: 'male' | 'female';
  contentType?: string;
  extraFocus?: string;
}

export const usePersona = () => {
  const { appData } = useFindom();
  const { getSystemPrompt, getTargetAudience } = useGenderedContent();

  const gender: 'male' | 'female' = (appData.profile?.gender as 'male' | 'female') || 'male';
  const persona: PersonaTone = (appData.profile?.persona as PersonaTone) || 'dominant';

  const presets: PersonaTone[] = ['dominant', 'seductive', 'strict', 'caring'];

  const buildSystemPrompt = (contentType: string, options?: BuildPromptOptions) => {
    const base = getSystemPrompt(contentType);
    const tone = options?.tone || persona;
    const effectiveGender = options?.gender || gender;
    const audience = getTargetAudience();

    const toneLine = `Use a ${tone} tone aligned to ${effectiveGender === 'male' ? 'male-for-male findom' : 'female-for-male femdom'} dynamics.`;
    const boundaryLine = `Maintain consent, clear boundaries, and avoid illegal/harmful content. Focus on empowerment and consensual power dynamics.`;
    const audienceLine = `Target audience: ${audience}.`;
    const extra = options?.extraFocus ? `\nFocus: ${options.extraFocus}` : '';

    return `${base}
${toneLine}
${boundaryLine}
${audienceLine}${extra}`.trim();
  };

  return {
    gender,
    persona,
    presets,
    buildSystemPrompt,
  };
};