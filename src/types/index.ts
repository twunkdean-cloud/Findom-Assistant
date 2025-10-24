export interface Persona {
  name: string;
  specialties: string;
  style: 'strict' | 'playful' | 'cruel' | 'sensual';
}

export interface Profile {
  displayName: string;
  bio: string;
  persona: string;
}

export interface Settings {
  emailNotifications: boolean;
  pushNotifications: boolean;
  dailyReminders: boolean;
  profileVisibility: string;
  dataSharing: boolean;
  theme: string;
}

export interface Sub {
  id: string;
  name: string;
  total: number;
  lastTribute: string;
  preferences: string;
  notes: string;
  conversationHistory?: string;
}

export interface RedFlag {
  id: string;
  username: string;
  reason: string;
}

export interface CalendarEvent {
  id: string;
  datetime: string;
  platform: string;
  content: string;
}

export interface CustomPrice {
  id: string;
  service: string;
  price: number;
}

export interface Goal {
  target: number;
  current: number;
  weekly?: number;
}

export interface Checklist {
  date: string;
  tasks: string[];
  completed: string[];
  weeklyTasks: string[];
  weeklyCompleted: string[];
}

export interface Tribute {
  id: string;
  amount: number;
  date: string;
  from: string;
  from_sub?: string;
  reason?: string;
  notes?: string;
  source: string;
}

export interface AppData {
  apiKey: string;
  persona: Persona;
  subs: Sub[];
  redflags: RedFlag[];
  customPrices: CustomPrice[];
  calendar: CalendarEvent[];
  goal: Goal;
  responses: Record<string, string>;
  screenTime: number;
  timerStart: number | null;
  checklist: Checklist;
  uploadedImageData: { mimeType: string; data: string } | null;
  tributes: Tribute[];
  profile: Profile;
  settings: Settings;
  subscription: string;
}

export interface FindomContextType {
  appData: AppData;
  setAppData: React.Dispatch<React.SetStateAction<AppData>>;
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
  loading?: boolean;
}