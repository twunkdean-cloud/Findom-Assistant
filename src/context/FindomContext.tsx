import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFindomActions } from '@/hooks/use-findom-actions';
import { FindomContextType, AppData, Sub, Tribute } from '@/types';
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

const FindomContext = createContext<FindomContextType | undefined>(undefined);

export const useFindom = () => {
  const context = useContext(FindomContext);
  if (!context) {
    throw new Error('useFindom must be used within a FindomProvider');
  }
  return context;
};

export const FindomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const actions = useFindomActions(appData, setAppData);

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
          redflags,
          checklists: [checklist], // Wrap in array
          checklist: {
            ...checklist,
            weeklyTasks: (checklist as any).weeklyTasks || [],
            weeklyCompleted: (checklist as any).weeklyCompleted || [],
          },
          profile: profile as any,
          settings: settings as any,
          subscription: subscription as string,
        });
      } catch (error) {
        console.error('Error loading data:', error);
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

    // Helper mappers from DB rows to client types
    const mapSubRow = (row: any): Sub => {
      let parsedHistory = row.conversation_history;
      if (typeof parsedHistory === 'string') {
        try {
          parsedHistory = JSON.parse(parsedHistory);
        } catch {
          // leave as string if not JSON
        }
      }
      return {
        id: row.id,
        name: row.name,
        total: Number(row.total ?? 0),
        lastTribute: row.last_tribute || undefined,
        preferences: row.preferences || undefined,
        notes: row.notes || undefined,
        conversationHistory: parsedHistory,
        created_at: row.created_at || undefined,
        updated_at: row.updated_at || undefined,
        tier: row.tier || undefined,
        tags: row.tags || undefined,
      };
    };

    const mapTributeRow = (row: any): Tribute => ({
      id: row.id,
      amount: Number(row.amount ?? 0),
      date: row.date,
      from_sub: row.from_sub,
      reason: row.reason || undefined,
      notes: row.notes || undefined,
      source: row.source,
      created_at: row.created_at || undefined,
      updated_at: row.updated_at || undefined,
    });

    // Subs: INSERT/UPDATE/DELETE
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'subs', filter: `user_id=eq.${userId}` }, (payload) => {
      const newSub = mapSubRow(payload.new);
      setAppData(prev => ({ ...prev, subs: [newSub, ...prev.subs] }));
      toast.success(`New sub added: ${newSub.name}`);
    });

    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'subs', filter: `user_id=eq.${userId}` }, (payload) => {
      const updated = mapSubRow(payload.new);
      setAppData(prev => ({
        ...prev,
        subs: prev.subs.map(s => s.id === updated.id ? updated : s),
      }));
      toast.success(`Sub updated: ${updated.name}`);
    });

    channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'subs', filter: `user_id=eq.${userId}` }, (payload) => {
      const deletedId = payload.old?.id;
      if (!deletedId) return;
      setAppData(prev => ({ ...prev, subs: prev.subs.filter(s => s.id !== deletedId) }));
      toast.success('Sub deleted');
    });

    // Tributes: INSERT/UPDATE/DELETE
    channel.on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tributes', filter: `user_id=eq.${userId}` }, (payload) => {
      const newTribute = mapTributeRow(payload.new);
      setAppData(prev => ({ ...prev, tributes: [newTribute, ...prev.tributes] }));
      toast.success(`New tribute: $${newTribute.amount.toFixed(2)}`);
    });

    channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tributes', filter: `user_id=eq.${userId}` }, (payload) => {
      const updated = mapTributeRow(payload.new);
      setAppData(prev => ({
        ...prev,
        tributes: prev.tributes.map(t => t.id === updated.id ? updated : t),
      }));
      toast.success('Tribute updated');
    });

    channel.on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tributes', filter: `user_id=eq.${userId}` }, (payload) => {
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

  const value = {
    appData,
    setAppData,
    loading,
    ...actions,
  };

  return (
    <FindomContext.Provider value={value}>
      {children}
    </FindomContext.Provider>
  );
};