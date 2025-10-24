import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { AppData } from '@/types';
import { DEFAULT_APP_DATA } from '@/constants/default-data';
import {
  userDataService,
  subsService,
  tributesService,
  customPricesService,
  calendarService,
  redflagsService,
  checklistsService,
} from '@/services/unified-service';

export const useFindomData = () => {
  const { user } = useAuth();
  const [appData, setAppData] = useState<AppData>(DEFAULT_APP_DATA);
  const [loading, setLoading] = useState(true);

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
          calendar: calendar,
          redflags,
          checklists: [checklist],
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

  return { appData, setAppData, loading };
};