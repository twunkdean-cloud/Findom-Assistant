export interface Sub {
  id: string;
  name: string;
  total: number;
  lastTribute?: string;
  preferences?: string;
  notes?: string;
  conversationHistory?: string | any;
  created_at?: string;
  updated_at?: string;
}

export interface Tribute {
  id: string;
  amount: number;
  date: string;
  from_sub: string;
  reason?: string;
  notes?: string;
  source: string;
  created_at?: string;
  updated_at?: string;
}

export interface RedFlag {
  id: string;
  username: string;
  reason: string;
  created_at?: string;
  updated_at?: string;
}

export interface Checklist {
  id: string;
  date: string;
  tasks: any;
  completed: any;
  created_at?: string;
  updated_at?: string;
}

export interface CustomPrice {
  id: string;
  service: string;
  price: number;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEvent {
  id: string;
  datetime: string;
  platform: string;
  content: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserData {
  id: string;
  user_id: string;
  data_type: string;
  data: any;
  created_at?: string;
  updated_at?: string;
}

export interface AppData {
  subs: Sub[];
  tributes: Tribute[];
  redflags: RedFlag[];
  checklists: Checklist[];
  customPrices: CustomPrice[];
  calendarEvents: CalendarEvent[];
  goal?: {
    weekly: number;
    monthly: number;
  };
  profile?: {
    displayName: string;
    bio: string;
    persona: 'dominant' | 'seductive' | 'strict' | 'caring';
    gender: 'male' | 'female';
    energy: 'masculine' | 'feminine';
  };
  settings?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    dailyReminders: boolean;
    profileVisibility: 'private' | 'friends' | 'public';
    dataSharing: boolean;
    theme: 'dark' | 'light' | 'auto';
  };
  responses?: {
    [key: string]: string;
  };
}

export interface AIContentSuggestion {
  type: 'caption' | 'task' | 'message';
  tone: 'dominant' | 'caring' | 'strict' | 'playful';
  content: string;
  reasoning: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
}