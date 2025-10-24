import { AppData } from '@/types';

export const DEFAULT_WEEKLY_TASKS = [
  'Check for new tributes',
  'Send reminder messages',
  'Update sub profiles',
  'Review weekly goals',
  'Schedule content posts'
];

export const DEFAULT_APP_DATA: AppData = {
  subs: [],
  tributes: [],
  redflags: [],
  checklists: [],
  customPrices: [],
  calendarEvents: [],
  goal: { weekly: 0, monthly: 0 },
  profile: {
    displayName: '',
    bio: '',
    persona: 'dominant',
    gender: 'male',
    energy: 'masculine',
  },
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    dailyReminders: true,
    profileVisibility: 'private',
    dataSharing: false,
    theme: 'dark',
  },
  responses: {},
  apiKey: '',
  persona: 'dominant',
  screenTime: 0,
  timerStart: null,
  uploadedImageData: null,
  checklist: {
    id: '',
    date: new Date().toISOString().split('T')[0],
    tasks: [],
    completed: [],
    weeklyTasks: DEFAULT_WEEKLY_TASKS,
    weeklyCompleted: [],
  },
  subscription: '',
};

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