export interface Sub {
  id: string;
  name: string;
  total: number;
  lastTribute?: string;
  preferences?: string;
  notes?: string;
  conversationHistory?: string | Record<string, any>;
  created_at?: string;
  updated_at?: string;
  tier?: string;
  tags?: string[];
}

export interface Tribute {
  id: string;
  amount: number;
  date: string;
  from_sub: string;
  reason?: string;
  notes?: string;
  source: 'cashapp' | 'venmo' | 'paypal' | 'other';
  created_at?: string;
  updated_at?: string;
}

export interface RedFlag {
  id: string;
  username: string;
  reason: string;
  severity?: 'low' | 'medium' | 'high';
  created_at?: string;
  updated_at?: string;
}

export interface Checklist {
  id: string;
  date: string;
  tasks: string[];
  completed: string[];
  weeklyTasks?: string[];
  weeklyCompleted?: string[];
  created_at?: string;
  updated_at?: string;
}

export interface CustomPrice {
  id: string;
  service: string;
  price: number;
  category?: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CalendarEvent {
  id: string;
  datetime: string;
  platform: string;
  content: string;
  type?: 'post' | 'story' | 'live' | 'reminder';
  created_at?: string;
  updated_at?: string;
}

export interface UserData {
  id: string;
  user_id: string;
  data_type: string;
  data: Record<string, any>;
  created_at?: string;
  updated_at?: string;
}

// Enhanced type safety for AppData
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
    first_name: string;
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
  responses?: Record<string, string>;
  // Additional properties for user data
  apiKey?: string;
  persona?: string;
  screenTime?: number;
  timerStart?: string | null;
  uploadedImageData?: string | null;
  checklist?: Checklist;
  subscription?: string;
}

// Enhanced AI content types
export interface AIContentSuggestion {
  type: 'caption' | 'task' | 'message';
  tone: 'dominant' | 'caring' | 'strict' | 'playful';
  content: string;
  reasoning: string;
  targetSub?: string;
  priority?: 'high' | 'medium' | 'low';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    model?: string;
    tokens?: number;
    cost?: number;
  };
}

export interface PerformanceMetrics {
  loadTime: number;
  renderTime: number;
  memoryUsage: number;
  bundleSize: number;
  firstContentfulPaint?: number;
  largestContentfulPaint?: number;
  timeToInteractive?: number;
}

// Enhanced context types
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
  createSub: (sub: Omit<Sub, 'id' | 'created_at' | 'updated_at'>) => Promise<Sub | null>;
  updateSub: (id: string, updates: Partial<Sub>) => Promise<Sub | null>;
  deleteSub: (id: string) => Promise<void>;
  updateTributes: (tributes: Tribute[]) => Promise<void>;
  updateCustomPrices: (customPrices: CustomPrice[]) => Promise<void>;
  updateCalendar: (calendar: CalendarEvent[]) => Promise<void>;
  updateRedflags: (redflags: RedFlag[]) => Promise<void>;
  updateChecklist: (key: keyof Checklist, value: any) => void;
  handleToggleWeeklyTask: (task: string) => void;
}

// Service response types
export interface ServiceResponse<T = any> {
  data?: T;
  error?: any;
  success: boolean;
  loading?: boolean;
}

// API types
export interface APIResponse<T = any> {
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
  success: boolean;
}

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea';
  required?: boolean;
  placeholder?: string;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | undefined;
  };
}

export interface FormState<T = any> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type EventHandler<T = Event> = (event: T) => void;

export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Component props types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
  style?: React.CSSProperties;
  testId?: string;
}

export interface LoadingProps extends BaseComponentProps {
  loading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'spinner' | 'skeleton' | 'dots';
}

export interface ErrorProps extends BaseComponentProps {
  error?: string | Error | null;
  onRetry?: () => void;
  retryCount?: number;
}

// Theme types
export type Theme = 'dark' | 'light' | 'auto';
export type ColorScheme = 'light' | 'dark';

export interface ThemeConfig {
  theme: Theme;
  colorScheme?: ColorScheme;
  customColors?: Record<string, string>;
}

// Navigation types
export type RoutePath = 
  | '/'
  | '/login'
  | '/auth/callback'
  | '/dashboard'
  | '/onboarding'
  | '/subs'
  | '/tributes'
  | '/chat'
  | '/captions'
  | '/tasks'
  | '/templates'
  | '/twitter'
  | '/reddit'
  | '/vision'
  | '/checklists'
  | '/pricing'
  | '/settings';

export interface NavigationItem {
  path: RoutePath;
  label: string;
  icon?: React.ComponentType<any>;
  badge?: string | number;
  disabled?: boolean;
  children?: NavigationItem[];
}

// Analytics types
export interface AnalyticsEvent {
  name: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
}

export interface PageViewEvent extends AnalyticsEvent {
  name: 'page_view';
  properties: {
    path: RoutePath;
    title: string;
    referrer?: string;
  };
}

export interface UserActionEvent extends AnalyticsEvent {
  name: 'user_action';
  properties: {
    action: string;
    target?: string;
    value?: any;
  };
}