import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { toast } from 'sonner';

// Define types for the application data
export interface Persona {
  name: string;
  specialties: string;
  style: 'strict' | 'playful' | 'cruel' | 'sensual';
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
}

export interface Checklist {
  date: string; // YYYY-MM-DD format
  tasks: string[]; // All possible tasks
  completed: string[]; // Completed tasks for the current date
}

export interface Tribute {
  id: string;
  amount: number;
  date: string;
  from: string;
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
  responses: Record<string, string>; // Placeholder for AI-generated responses
  screenTime: number; // In seconds
  timerStart: number | null; // Timestamp when timer started
  checklist: Checklist;
  uploadedImageData: { mimeType: string; data: string } | null;
  tributes: Tribute[]; // New field for tribute tracking
}

// Define default values for the application data
const DEFAULT_APP_DATA: AppData = {
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
    date: '', // Will be set dynamically
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
  tributes: [], // Initialize new tributes array
};

// Define the context type
interface FindomContextType {
  appData: AppData;
  updateAppData: (key: keyof AppData, value: any) => void;
  saveAllAppData: (newData?: AppData) => void;
  clearAllData: () => void;
  exportData: () => void;
  importData: (data: AppData) => void;
  addChecklistTask: (task: string) => void;
  editChecklistTask: (oldTask: string, newTask: string) => void;
  deleteChecklistTask: (task: string) => void;
  migrateFromLocalStorage: () => Promise<void>;
  updateSubs: (subs: Sub[]) => Promise<void>;
  updateTributes: (tributes: Tribute[]) => Promise<void>;
  updateCustomPrices: (customPrices: CustomPrice[]) => Promise<void>;
  updateCalendar: (calendar: CalendarEvent[]) => Promise<void>;
  updateRedflags: (redflags: RedFlag[]) => Promise<void>;
}

const FindomContext = createContext<FindomContextType | undefined>(undefined);

export const FindomProvider = ({ children }: { children: ReactNode }) => {
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);

  // Helper to get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  // Load state from localStorage on initial mount and handle daily checklist reset
  useEffect(() => {
    const loadedData: Partial<AppData> = {};
    Object.keys(DEFAULT_APP_DATA).forEach((key) => {
      const storedValue = localStorage.getItem(`findom_${key}`);
      if (storedValue) {
        try {
          (loadedData as any)[key] = JSON.parse(storedValue);
        } catch (e) {
          console.warn(`Could not parse stored value for ${key}, using default.`);
        }
      }
    });

    setAppData((prev) => {
      const newState = { ...prev, ...loadedData };
      const todayDate = getTodayDate();

      // Handle checklist initialization/reset
      if (!newState.checklist.date || newState.checklist.date !== todayDate) {
        // If no date or date is old, reset completed tasks and update date
        newState.checklist = {
          ...newState.checklist,
          date: todayDate,
          completed: [],
        };
        // Also save this reset state to localStorage immediately
        try {
          localStorage.setItem('findom_checklist', JSON.stringify(newState.checklist));
        } catch (e) {
          console.error('Error saving reset checklist to localStorage:', e);
        }
      }
      return newState;
    });
  }, []);

  // Save individual state items to localStorage
  const updateAppData = (key: keyof AppData, value: any) => {
    setAppData((prev) => {
      const newState = { ...prev, [key]: value };
      try {
        localStorage.setItem(`findom_${key}`, JSON.stringify(value));
      } catch (e) {
        console.error('Error saving data to localStorage:', e);
        toast.error('Error saving data. Storage may be full.');
      }
      return newState;
    });
  };

  // Save all state or provided new state to localStorage
  const saveAllAppData = (newData?: AppData) => {
    const dataToSave = newData || appData;
    setAppData(dataToSave); // Update React state first
    try {
      Object.keys(dataToSave).forEach((key) => {
        localStorage.setItem(`findom_${key}`, JSON.stringify(dataToSave[key as keyof AppData]));
      });
      toast.success('All data saved!');
    } catch (e) {
      console.error('Error saving all data to localStorage:', e);
      toast.error('Error saving all data. Storage may be full.');
    }
  };

  const clearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      localStorage.clear();
      setAppData(DEFAULT_APP_DATA);
      toast.success('All data has been cleared.');
      // Re-initialize checklist after clearing all data
      const todayDate = getTodayDate();
      updateAppData('checklist', {
        ...DEFAULT_APP_DATA.checklist,
        date: todayDate,
        completed: [],
      });
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'findom_assistant_backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  const importData = (data: AppData) => {
    if (window.confirm('This will overwrite all current data. Are you sure?')) {
      saveAllAppData(data);
      toast.success('Data imported successfully!');
    }
  };

  const addChecklistTask = (task: string) => {
    if (!appData.checklist.tasks.includes(task)) {
      const updatedTasks = [...appData.checklist.tasks, task];
      updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks });
      toast.success('Task added!');
    } else {
      toast.error('Task already exists.');
    }
  };

  const editChecklistTask = (oldTask: string, newTask: string) => {
    if (oldTask === newTask) {
      toast.info('No change made to task.');
      return;
    }
    if (appData.checklist.tasks.includes(newTask)) {
      toast.error('A task with this name already exists.');
      return;
    }
    const updatedTasks = appData.checklist.tasks.map(t => (t === oldTask ? newTask : t));
    const updatedCompleted = appData.checklist.completed.map(t => (t === oldTask ? newTask : t));
    updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks, completed: updatedCompleted });
    toast.success('Task updated!');
  };

  const deleteChecklistTask = (task: string) => {
    const updatedTasks = appData.checklist.tasks.filter(t => t !== task);
    const updatedCompleted = appData.checklist.completed.filter(t => t !== task); // Also remove from completed if deleted
    updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks, completed: updatedCompleted });
    toast.success('Task deleted!');
  };

  const migrateFromLocalStorage = async () => {
    // Implementation here
  };

  const updateSubs = async (subs: Sub[]) => {
    // Implementation here
  };

  const updateTributes = async (tributes: Tribute[]) => {
    // Implementation here
  };

  const updateCustomPrices = async (customPrices: CustomPrice[]) => {
    // Implementation here
  };

  const updateCalendar = async (calendar: CalendarEvent[]) => {
    // Implementation here
  };

  const updateRedflags = async (redflags: RedFlag[]) => {
    // Implementation here
  };

  return (
    <FindomContext.Provider value={{
      appData,
      updateAppData,
      saveAllAppData,
      clearAllData,
      exportData,
      importData,
      addChecklistTask,
      editChecklistTask,
      deleteChecklistTask,
      migrateFromLocalStorage,
      updateSubs,
      updateTributes,
      updateCustomPrices,
      updateCalendar,
      updateRedflags
    }}>
      {children}
    </FindomContext.Provider>
  );
};

export const useFindom = () => {
  const context = useContext(FindomContext);
  if (context === undefined) {
    throw new Error('useFindom must be used within a FindomProvider');
  }
  return context;
};