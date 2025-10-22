import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';

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
  date: string;
  tasks: string[];
  completed: string[];
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
  responses: Record<string, string>;
  screenTime: number;
  timerStart: number | null;
  checklist: Checklist;
  uploadedImageData: { mimeType: string; data: string } | null;
  tributes: Tribute[];
}

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
};

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
  const { user } = useAuth();
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase on mount and when user changes
  useEffect(() => {
    if (!user) {
      setAppData(DEFAULT_APP_DATA);
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load user data
        const { data: userData, error: userError } = await supabase
          .from('user_data')
          .select('data_type, data')
          .eq('user_id', user.id);

        if (userError) throw userError;

        const loadedData: Partial<AppData> = {};
        userData?.forEach(item => {
          (loadedData as any)[item.data_type] = item.data;
        });

        // Load subs
        const { data: subs, error: subsError } = await supabase
          .from('subs')
          .select('*')
          .eq('user_id', user.id);

        if (subsError) throw subsError;
        loadedData.subs = subs?.map(sub => ({
          id: sub.id,
          name: sub.name,
          total: sub.total,
          lastTribute: sub.last_tribute || '',
          preferences: sub.preferences || '',
          notes: sub.notes || '',
          conversationHistory: sub.conversation_history || '',
        })) || [];

        // Load tributes
        const { data: tributes, error: tributesError } = await supabase
          .from('tributes')
          .select('*')
          .eq('user_id', user.id);

        if (tributesError) throw tributesError;
        loadedData.tributes = tributes?.map(tribute => ({
          id: tribute.id,
          amount: tribute.amount,
          date: tribute.date,
          from: tribute.from_sub,
          reason: tribute.reason || '',
          notes: tribute.notes || '',
          source: tribute.source,
        })) || [];

        // Load custom prices
        const { data: prices, error: pricesError } = await supabase
          .from('custom_prices')
          .select('*')
          .eq('user_id', user.id);

        if (pricesError) throw pricesError;
        loadedData.customPrices = prices?.map(price => ({
          id: price.id,
          service: price.service,
          price: price.price,
        })) || [];

        // Load calendar events
        const { data: events, error: eventsError } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('user_id', user.id);

        if (eventsError) throw eventsError;
        loadedData.calendar = events?.map(event => ({
          id: event.id,
          datetime: event.datetime,
          platform: event.platform,
          content: event.content,
        })) || [];

        // Load redflags
        const { data: redflags, error: redflagsError } = await supabase
          .from('redflags')
          .select('*')
          .eq('user_id', user.id);

        if (redflagsError) throw redflagsError;
        loadedData.redflags = redflags?.map(flag => ({
          id: flag.id,
          username: flag.username,
          reason: flag.reason,
        })) || [];

        // Load checklist
        const today = new Date().toISOString().split('T')[0];
        const { data: checklist, error: checklistError } = await supabase
          .from('checklists')
          .select('*')
          .eq('user_id', user.id)
          .eq('date', today)
          .single();

        if (checklistError && checklistError.code !== 'PGRST116') {
          throw checklistError;
        }

        if (checklist) {
          loadedData.checklist = {
            date: checklist.date,
            tasks: checklist.tasks,
            completed: checklist.completed,
          };
        } else {
          // Create default checklist for today
          const newChecklist = {
            ...DEFAULT_APP_DATA.checklist,
            date: today,
          };
          await supabase.from('checklists').insert({
            user_id: user.id,
            date: today,
            tasks: newChecklist.tasks,
            completed: newChecklist.completed,
          });
          loadedData.checklist = newChecklist;
        }

        setAppData({ ...DEFAULT_APP_DATA, ...loadedData });
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error loading data');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const updateAppData = async (key: keyof AppData, value: any) => {
    if (!user) return;

    setAppData(prev => ({ ...prev, [key]: value }));

    try {
      if (key === 'subs' || key === 'tributes' || key === 'customPrices' || 
          key === 'calendar' || key === 'redflags' || key === 'checklist') {
        // These are handled by their specific update functions
        return;
      }

      // Update user_data table
      const { error } = await supabase
        .from('user_data')
        .upsert({
          user_id: user.id,
          data_type: key,
          data: value,
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Error saving data');
    }
  };

  const updateSubs = async (subs: Sub[]) => {
    if (!user) return;

    setAppData(prev => ({ ...prev, subs }));

    try {
      // Delete existing subs
      await supabase.from('subs').delete().eq('user_id', user.id);

      // Insert new subs
      if (subs.length > 0) {
        const subsToInsert = subs.map(sub => ({
          user_id: user.id,
          name: sub.name,
          total: sub.total,
          last_tribute: sub.lastTribute || null,
          preferences: sub.preferences || null,
          notes: sub.notes || null,
          conversation_history: sub.conversationHistory || null,
        }));

        const { error } = await supabase.from('subs').insert(subsToInsert);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating subs:', error);
      toast.error('Error saving subs');
    }
  };

  const updateTributes = async (tributes: Tribute[]) => {
    if (!user) return;

    setAppData(prev => ({ ...prev, tributes }));

    try {
      // Delete existing tributes
      await supabase.from('tributes').delete().eq('user_id', user.id);

      // Insert new tributes
      if (tributes.length > 0) {
        const tributesToInsert = tributes.map(tribute => ({
          user_id: user.id,
          amount: tribute.amount,
          date: tribute.date,
          from_sub: tribute.from,
          reason: tribute.reason || null,
          notes: tribute.notes || null,
          source: tribute.source,
        }));

        const { error } = await supabase.from('tributes').insert(tributesToInsert);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating tributes:', error);
      toast.error('Error saving tributes');
    }
  };

  const updateCustomPrices = async (customPrices: CustomPrice[]) => {
    if (!user) return;

    setAppData(prev => ({ ...prev, customPrices }));

    try {
      // Delete existing prices
      await supabase.from('custom_prices').delete().eq('user_id', user.id);

      // Insert new prices
      if (customPrices.length > 0) {
        const pricesToInsert = customPrices.map(price => ({
          user_id: user.id,
          service: price.service,
          price: price.price,
        }));

        const { error } = await supabase.from('custom_prices').insert(pricesToInsert);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating custom prices:', error);
      toast.error('Error saving custom prices');
    }
  };

  const updateCalendar = async (calendar: CalendarEvent[]) => {
    if (!user) return;

    setAppData(prev => ({ ...prev, calendar }));

    try {
      // Delete existing events
      await supabase.from('calendar_events').delete().eq('user_id', user.id);

      // Insert new events
      if (calendar.length > 0) {
        const eventsToInsert = calendar.map(event => ({
          user_id: user.id,
          datetime: event.datetime,
          platform: event.platform,
          content: event.content,
        }));

        const { error } = await supabase.from('calendar_events').insert(eventsToInsert);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating calendar:', error);
      toast.error('Error saving calendar');
    }
  };

  const updateRedflags = async (redflags: RedFlag[]) => {
    if (!user) return;

    setAppData(prev => ({ ...prev, redflags }));

    try {
      // Delete existing redflags
      await supabase.from('redflags').delete().eq('user_id', user.id);

      // Insert new redflags
      if (redflags.length > 0) {
        const flagsToInsert = redflags.map(flag => ({
          user_id: user.id,
          username: flag.username,
          reason: flag.reason,
        }));

        const { error } = await supabase.from('redflags').insert(flagsToInsert);
        if (error) throw error;
      }
    } catch (error) {
      console.error('Error updating redflags:', error);
      toast.error('Error saving redflags');
    }
  };

  const saveAllAppData = (newData?: AppData) => {
    const dataToSave = newData || appData;
    setAppData(dataToSave);
    // Individual updates are handled by updateAppData and specific update functions
  };

  const clearAllData = async () => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        // Clear all tables for this user
        await supabase.from('user_data').delete().eq('user_id', user.id);
        await supabase.from('subs').delete().eq('user_id', user.id);
        await supabase.from('tributes').delete().eq('user_id', user.id);
        await supabase.from('custom_prices').delete().eq('user_id', user.id);
        await supabase.from('calendar_events').delete().eq('user_id', user.id);
        await supabase.from('redflags').delete().eq('user_id', user.id);
        await supabase.from('checklists').delete().eq('user_id', user.id);

        setAppData(DEFAULT_APP_DATA);
        toast.success('All data has been cleared.');
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error('Error clearing data');
      }
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
    const updatedCompleted = appData.checklist.completed.filter(t => t !== task);
    updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks, completed: updatedCompleted });
    toast.success('Task deleted!');
  };

  const migrateFromLocalStorage = async () => {
    if (!user) return;

    try {
      const keys = ['findom_subs', 'findom_tributes', 'findom_customPrices', 'findom_calendar', 'findom_redflags', 'findom_checklist', 'findom_apiKey', 'findom_persona', 'findom_goal', 'findom_responses'];
      const migrationData: any = {};

      keys.forEach(key => {
        const value = localStorage.getItem(key);
        if (value && value !== 'null' && value !== 'undefined' && value !== '{}') {
          try {
            migrationData[key.replace('findom_', '')] = JSON.parse(value);
          } catch (e) {
            console.warn(`Could not parse ${key}:`, e);
          }
        }
      });

      // Migrate data to Supabase
      if (migrationData.apiKey) await updateAppData('apiKey', migrationData.apiKey);
      if (migrationData.persona) await updateAppData('persona', migrationData.persona);
      if (migrationData.goal) await updateAppData('goal', migrationData.goal);
      if (migrationData.responses) await updateAppData('responses', migrationData.responses);
      if (migrationData.subs) await updateSubs(migrationData.subs);
      if (migrationData.tributes) await updateTributes(migrationData.tributes);
      if (migrationData.customPrices) await updateCustomPrices(migrationData.customPrices);
      if (migrationData.calendar) await updateCalendar(migrationData.calendar);
      if (migrationData.redflags) await updateRedflags(migrationData.redflags);
      if (migrationData.checklist) await updateAppData('checklist', migrationData.checklist);

      toast.success('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed. Please try again.');
    }
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