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