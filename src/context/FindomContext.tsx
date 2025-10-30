import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useFindomActions } from '@/hooks/use-findom-actions';
import { FindomContextType, AppData, Sub, Tribute, Checklist } from '@/types';
import { DEFAULT_APP_DATA } from '@/constants/default-data';
import { useAuth } from '@/context/AuthContext';
import {
  subsService,
  tributesService,
  customPricesService,
  calendarService,
  redflagsService,
  checklistsService,
} from '@/services/unified-service';
import { userDataService } from '@/services/user-data-service';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/utils/toast';
import { loadLocalAppData } from '@/utils/persistence';
import { logger } from '@/utils/logger';

// Split contexts for better performance
const AppDataContext = createContext<AppData | undefined>(undefined);
const AppLoadingContext = createContext<boolean>(true);
const AppActionsContext = createContext<Omit<FindomContextType, 'appData' | 'loading'> | undefined>(undefined);

// Hook to access app data only (won't re-render when actions change)
export const useAppData = () => {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within FindomProvider');
  }
  return context;
};

// Hook to access loading state only
export const useAppLoading = () => {
  const context = useContext(AppLoadingContext);
  if (context === undefined) {
    throw new Error('useAppLoading must be used within FindomProvider');
  }
  return context;
};

// Hook to access actions only (won't re-render when data changes)
export const useAppActions = () => {
  const context = useContext(AppActionsContext);
  if (context === undefined) {
    throw new Error('useAppActions must be used within FindomProvider');
  }
  return context;
};

// Legacy hook for backward compatibility
export const useFindom = (): FindomContextType => {
  const appData = useAppData();
  const loading = useAppLoading();
  const actions = useAppActions();

  return useMemo(() => ({
    appData,
    loading,
    ...actions,
  }), [appData, loading, actions]);
};

// Helper to get default checklist structure
const getDefaultChecklist = (): Checklist => ({
  id: '',
  date: new Date().toISOString().split('T')[0],
  tasks: [],
  completed: [],
  weeklyTasks: [],
  weeklyCompleted: [],
});

export const FindomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Load data effect
  useEffect(() => {
    if (!user) {
      // Load from localStorage when not authenticated
      const local = loadLocalAppData();
      setAppData({ ...DEFAULT_APP_DATA, ...local });
      setLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        setLoading(true);
        const userId = user.id;

        const [
          apiKey,
          persona,
          goal,
          responses,
          screenTime,
          timerStart,
          uploadedImageData,
          subs,
          tributes,
          customPrices,
          calendar,
          redflags,
          checklist,
          profile,
          settings,
          subscription,
        ] = await Promise.all([
          userDataService.getApiKey(userId),
          userDataService.getPersona(userId),
          userDataService.getGoal(userId),
          userDataService.getResponses(userId),
          userDataService.getScreenTime(userId),
          userDataService.getTimerStart(userId),
          userDataService.getUploadedImageData(userId),
          subsService.getAll(userId),
          tributesService.getAll(userId),
          customPricesService.getAll(userId),
          calendarService.getAll(userId),
          redflagsService.getAll(userId),
          checklistsService.getToday(userId),
          userDataService.getProfile(userId),
          userDataService.getSettings(userId),
          userDataService.getSubscription(userId),
        ]);

        setAppData({
          apiKey,
          persona,
          goal,
          responses,
          screenTime,
          timerStart,
          uploadedImageData,
          subs,
          tributes,
          customPrices,
          calendarEvents: calendar,
          calendar,
          redflags,
          checklists: [checklist],
          checklist: checklist || getDefaultChecklist(),
          profile: profile || {
            id: userId,
            firstName: '',
            lastName: '',
            avatarUrl: null,
            bio: '',
            persona: 'dominant',
            gender: 'male',
            energy: 'masculine',
            onboardingCompleted: false,
            onboardingCompletedAt: null,
          },
          settings: settings || {
            emailNotifications: true,
            pushNotifications: true,
            dailyReminders: true,
            profileVisibility: 'private',
            dataSharing: false,
            theme: 'auto',
          },
          subscription: subscription || 'free',
        });
      } catch (error) {
        logger.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  // Realtime subscriptions for subs and tributes
  useEffect(() => {
    if (!user) return;

    const userId = user.id;
    const channel = supabase.channel(`user-realtime-${userId}`);

    // Use service transformers instead of duplicating mapping logic
    const transformSubRow = (row: any): Sub => {
      const transformed = subsService['transformFromDB']([row]);
      return transformed[0];
    };

    const transformTributeRow = (row: any): Tribute => {
      const transformed = tributesService['transformFromDB']([row]);
      return transformed[0];
    };

    // Subs: INSERT/UPDATE/DELETE
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'subs',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      const newSub = transformSubRow(payload.new);
      setAppData(prev => ({ ...prev, subs: [newSub, ...prev.subs] }));
      toast.success(`New sub added: ${newSub.name}`);
    });

    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'subs',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      const updated = transformSubRow(payload.new);
      setAppData(prev => ({
        ...prev,
        subs: prev.subs.map(s => s.id === updated.id ? updated : s),
      }));
      toast.success(`Sub updated: ${updated.name}`);
    });

    channel.on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'subs',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      const deletedId = payload.old?.id;
      if (!deletedId) return;
      setAppData(prev => ({ ...prev, subs: prev.subs.filter(s => s.id !== deletedId) }));
      toast.success('Sub deleted');
    });

    // Tributes: INSERT/UPDATE/DELETE
    channel.on('postgres_changes', {
      event: 'INSERT',
      schema: 'public',
      table: 'tributes',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      const newTribute = transformTributeRow(payload.new);
      setAppData(prev => ({ ...prev, tributes: [newTribute, ...prev.tributes] }));
      toast.success(`New tribute: $${newTribute.amount.toFixed(2)}`);
    });

    channel.on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'tributes',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      const updated = transformTributeRow(payload.new);
      setAppData(prev => ({
        ...prev,
        tributes: prev.tributes.map(t => t.id === updated.id ? updated : t),
      }));
      toast.success('Tribute updated');
    });

    channel.on('postgres_changes', {
      event: 'DELETE',
      schema: 'public',
      table: 'tributes',
      filter: `user_id=eq.${userId}`
    }, (payload) => {
      const deletedId = payload.old?.id;
      if (!deletedId) return;
      setAppData(prev => ({ ...prev, tributes: prev.tributes.filter(t => t.id !== deletedId) }));
      toast.success('Tribute deleted');
    });

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  // Get actions hook (memoized by useFindomActions internally)
  const actions = useFindomActions(appData, setAppData);

  // Memoize context values to prevent unnecessary re-renders
  const appDataValue = useMemo(() => appData, [appData]);
  const actionsValue = useMemo(() => actions, [actions]);

  return (
    <AppDataContext.Provider value={appDataValue}>
      <AppLoadingContext.Provider value={loading}>
        <AppActionsContext.Provider value={actionsValue}>
          {children}
        </AppActionsContext.Provider>
      </AppLoadingContext.Provider>
    </AppDataContext.Provider>
  );
};
