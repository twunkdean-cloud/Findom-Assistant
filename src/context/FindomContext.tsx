import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useFindomActions } from '@/hooks/use-findom-actions';
import { FindomContextType } from '@/types';
import { DEFAULT_APP_DATA } from '@/constants/default-data';
import { AppData } from '@/types';
import { useAuth } from '@/hooks/use-auth';
import { userDataService } from '@/services/user-data-service';
import { subsService } from '@/services/subs-service';
import { tributesService } from '@/services/tributes-service';
import { customPricesService } from '@/services/custom-prices-service';
import { calendarService } from '@/services/calendar-service';
import { redflagsService } from '@/services/redflags-service';
import { checklistsService } from '@/services/checklists-service';

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
    if (user) {
      loadUserData(user.id);
    } else {
      setAppData(DEFAULT_APP_DATA);
      setLoading(false);
    }
  }, [user]);

  const loadUserData = async (userId: string) => {
    try {
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
        calendar,
        redflags,
        checklist: {
          ...checklist,
          weeklyTasks: checklist.weeklyTasks || [],
          weeklyCompleted: checklist.weeklyCompleted || [],
        },
        profile: profile as any,
        settings: settings as any,
        subscription: subscription as string,
      });
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

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