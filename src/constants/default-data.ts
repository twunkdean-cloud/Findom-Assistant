import { AppData } from '@/types';

export const DEFAULT_APP_DATA: AppData = {
  apiKey: '',
  persona: { name: 'Switch Dean', specialties: 'male findom, foot worship, wallet drain', style: 'strict' },
  subs: [],
  redflags: [],
  customPrices: [],
  calendar: [],
  goal: { target: 0, current: 0 },
  responses: {
    initial: 'Loading...',
    tribute: 'Loading...',
    excuse: 'Loading...',
    task: 'Loading...',
    punishment: 'Loading...',
  },
  screenTime: 0,
  timerStart: null,
  checklist: {
    date: new Date().toISOString().split('T')[0],
    tasks: [
      '30 minute workout',
      'Shower',
      'AM medication',
      'PM medication',
      'Eat a healthy meal',
      'Drink 8 glasses of water',
      'Post on Twitter',
      'Post on Reddit',
      'Respond to messages',
      'Create 5 pictures',
      'Create 1 video for clips for sale',
      'Engage with subs on social media',
      'Check analytics',
      'Plan next content',
    ],
    completed: [],
  },
  uploadedImageData: null,
  tributes: [],
  profile: {
    displayName: '',
    bio: '',
    persona: 'dominant'
  },
  settings: {
    emailNotifications: true,
    pushNotifications: true,
    dailyReminders: true,
    profileVisibility: 'private',
    dataSharing: false,
    theme: 'dark'
  },
  subscription: 'free'
};

export const DEFAULT_CHECKLIST_TASKS = [
  '30 minute workout',
  'Shower',
  'AM medication',
  'PM medication',
  'Eat a healthy meal',
  'Drink 8 glasses of water',
  'Post on Twitter',
  'Post on Reddit',
  'Respond to messages',
  'Create 5 pictures',
  'Create 1 video for clips for sale',
  'Engage with subs on social media',
  'Check analytics',
  'Plan next content',
];