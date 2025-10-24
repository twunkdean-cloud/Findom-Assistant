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
  weeklyTasks?: string[];
  weeklyCompleted?: string[];
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
  calendar: CalendarEvent[]; // Add calendar property for backward compatibility
  goal?: {
    weekly: number;
    monthly: number;
    target?: number;
    current?: number;
  };
  profile?: {
    displayName: string;
    bio: string;
    persona: 'dominant' | 'seductive' | 'strict' | 'caring';
    gender: 'male' | 'female';
    energy: 'masculine' | 'feminine';
    onboardingCompleted?: boolean;
    onboardingCompletedAt?: string | null;
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
  // Additional properties for user data
  apiKey?: string;
  persona?: string;
  screenTime?: number;
  timerStart?: string | null;
  uploadedImageData?: string | null;
  checklist?: Checklist;
  subscription?: string;
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

export interface FindomContextType {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
  loading: boolean;
  updateAppData: (key: keyof AppData, value: any) => Promise<void>;
  saveAllAppData: (newData?: AppData) => void;
  clearAllData: () => Promise<void>;
  exportData: () => void;
  importData: (data: AppData) => void;
  addChecklistTask: (task: string) => Promise<void>;
  editChecklistTask: (oldTask: string, newTask: string) => Promise<void>;
  deleteChecklistTask: (task: string) => Promise<void>;
  migrateFromLocalStorage: () => Promise<void>;
  updateSubs: (subs: Sub[]) => Promise<void>;
  updateTributes: (tributes: Tribute[]) => Promise<void>;
  updateCustomPrices: (customPrices: CustomPrice[]) => Promise<void>;
  updateCalendar: (calendar: CalendarEvent[]) => Promise<void>;
  updateRedflags: (redflags: RedFlag[]) => Promise<void>;
  updateChecklist: (key: keyof Checklist, value: any) => void;
  handleToggleWeeklyTask: (task: string) => void;
}