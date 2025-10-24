import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFindomActions } from '@/hooks/use-findom-actions';
import { FindomContextType, AppData } from '@/types';
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
      setAppData(DEFAULT_APP_DATA);
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
          calendar: calendar, // Add calendar for backward compatibility
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