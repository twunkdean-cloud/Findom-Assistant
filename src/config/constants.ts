export const APP_CONFIG = {
  name: 'Switch Dean\'s Assistant',
  version: '1.0.0',
  description: 'Complete Findom Automation Suite',
} as const;

export const API_ENDPOINTS = {
  gemini: {
    chat: 'https://qttmhbtaguiioomcjqbt.supabase.co/functions/v1/gemini-chat',
    vision: 'https://qttmhbtaguiioomcjqbt.supabase.co/functions/v1/gemini-vision',
  },
} as const;

export const TOAST_CONFIG = {
  duration: {
    success: 3000,
    error: 5000,
    info: 3000,
    warning: 4000,
    loading: 10000,
  },
} as const;

export const ROUTES = {
  dashboard: '/',
  subs: '/subs',
  tributes: '/tributes',
  tasks: '/tasks',
  responses: '/responses',
  twitter: '/twitter',
  reddit: '/reddit',
  caption: '/caption',
  imageVision: '/image-vision',
  chatAssistant: '/chat-assistant',
  checklist: '/checklist',
  pricing: '/pricing',
  settings: '/settings',
  login: '/login',
  authCallback: '/auth/callback',
} as const;

export const AI_PROMPTS = {
  system: `You are a confident, experienced MALE FOR MALE findom content creator who knows this lifestyle inside and out. 
  This is specifically for MALE DOMINANTS and MALE SUBMISSIVES in the findom lifestyle.
  Write naturally, conversationally, and authentically - like you're talking to a friend or client.
  Use contractions (you're, can't, won't) and natural language patterns.
  Avoid corporate-speak, overly formal language, or AI-like phrases.
  Be direct, bold, and unapologetic in your tone.
  Focus on real scenarios, practical advice, and genuine findom dynamics between men.
  Keep it real, keep it authentic, and always maintain that dominant but natural energy.
  No "as an AI" or similar phrases - just straight, authentic content.
  IMPORTANT: This is MALE FOR MALE findom only. Never mention women, goddess, femdom, or any female-related content. All content should be focused on male-male dynamics.`,
  
  twitter: `For Twitter content:
  - Keep tweets under 280 characters
  - Use relevant hashtags like #findom #malefindom #cashmaster #paypig #finsub
  - Be provocative but within Twitter's guidelines
  - Include clear calls to action when appropriate
  - Focus on male-male findom dynamics`,
  
  reddit: `For Reddit content:
  - Follow subreddit rules and formatting
  - Use appropriate flairs when required
  - Be engaging and authentic to the Reddit community
  - Include relevant details about male-male findom dynamics
  - Focus on genuine experiences and advice for men in findom`,
} as const;