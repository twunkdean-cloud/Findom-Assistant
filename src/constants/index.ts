export const API_ENDPOINTS = {
  GEMINI_CHAT: 'gemini-chat',
  GEMINI_VISION: 'gemini-vision',
  ANALYZE_CONVERSATION: 'analyze-conversation',
  GENERATE_CONTENT: 'generate-content',
  GENERATE_RESPONSE: 'generate-response',
} as const;

export const TOAST_CONFIG = {
  DURATION: 3000,
  POSITION: 'top-right' as const,
} as const;

export const DEFAULT_WEEKLY_TASKS = [
  'Check for new tributes',
  'Send reminder messages',
  'Update sub profiles',
  'Review weekly goals',
  'Schedule content posts'
];

export const DEFAULT_CHECKLIST_TASKS = [
  'AM medication',
  'PM medication',
  'Shower',
  'Spend 30 minutes cleaning',
  '30 minute workout',
  'Post on Twitter 3x',
  'Take pictures for content',
  'Post/comment on Reddit',
  'Post on LoyalFans',
  'Engage with subs on social media',
  'Check analytics and earnings',
  'Create 1 video for clips',
  'Respond to messages within 2 hours',
  'Plan tomorrow\'s content',
  'Update sub profiles/notes',
  'Review red flag database',
  'Drink 8 glasses of water',
  'Eat a healthy meal',
];

export const PERSONA_OPTIONS = {
  male: [
    { value: 'dominant', label: 'Dominant - Commanding, assertive, direct' },
    { value: 'seductive', label: 'Seductive - Charismatic, confident, alluring' },
    { value: 'strict', label: 'Strict - Authoritative, demanding, uncompromising' },
    { value: 'caring', label: 'Caring - Protective, guiding, firm but fair' }
  ],
  female: [
    { value: 'dominant', label: 'Dominant - Goddess-like, supreme, commanding' },
    { value: 'seductive', label: 'Seductive - Enchanting, captivating, irresistible' },
    { value: 'strict', label: 'Strict - Demanding, unforgiving, exacting' },
    { value: 'caring', label: 'Caring - Nurturing, guiding, maternal dominance' }
  ]
} as const;

export const GENDER_HASHTAGS = {
  male: ['#findom', '#malefindom', '#cashmaster', '#paypig', '#finsub', '#m4m'],
  female: ['#femdom', '#findom', '#goddess', '#paypig', '#finsub', '#femalesupremacy']
} as const;

export const API_BASE_URL = 'https://qttmhbtaguiioomcjqbt.supabase.co/functions/v1';
export const API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0dG1oYnRhZ3VpaW9vbWNqcWJ0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA3MjQ5MDMsImV4cCI6MjA3NjMwMDkwM30.M4AiSRnA0xfmDgmtxYaKr4GT7bvzoFS3ukxpsN3b8K0';

export const BUNDLE_LIMITS = {
  CHUNK_SIZE_WARNING: 250000, // 250KB
  CHUNK_SIZE_ERROR: 500000, // 500KB
  TOTAL_BUNDLE_WARNING: 1000000, // 1MB
  TOTAL_BUNDLE_ERROR: 2000000, // 2MB
  COMPRESSION_RATIO_MIN: 70, // 70% minimum compression
} as const;

export const PERFORMANCE_METRICS = {
  FIRST_CONTENTFUL_PAINT: 1500, // 1.5s
  LARGEST_CONTENTFUL_PAINT: 2500, // 2.5s
  TIME_TO_INTERACTIVE: 3000, // 3s
  CUMULATIVE_LAYOUT_SHIFT: 0.1,
  FIRST_INPUT_DELAY: 100, // 100ms
} as const;

export const LAZY_LOADING_CONFIG = {
  PRELOAD_PRIORITY: 'high',
  PRELOAD_DELAY: 1000,
  SUSPENSE_TIMEOUT: 5000,
  CHUNK_SIZE_LIMIT: 300000, // 300KB
} as const;