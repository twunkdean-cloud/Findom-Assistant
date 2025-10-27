import { useContext } from 'react';
import { toast } from '@/utils/toast';
import { useAuth } from '@/context/AuthContext';
import { 
  AppData, 
  Checklist, 
  Sub, 
  Tribute, 
  CustomPrice, 
  CalendarEvent, 
  RedFlag,
  ServiceResponse,
  DeepPartial
} from '@/types';
import { DEFAULT_APP_DATA } from '@/constants/default-data';
import {
  subsService,
  tributesService,
  customPricesService,
  calendarService,
  redflagsService,
  checklistsService,
} from '@/services/unified-service';
import { migrationService } from '@/services/migration-service';
import { userDataService } from '@/services/user-data-service';

export const useFindomActions = (
  appData: AppData, 
  setAppData: React.Dispatch<React.SetStateAction<AppData>>
) => {
  const { user } = useAuth();

  const updateAppData = async (key: keyof AppData, value: any): Promise<void> => {
    if (!user) return;

    setAppData(prev => ({ ...prev, [key]: value }));
    const userId = user.id;

    try {
      switch (key) {
        case 'apiKey':
          await userDataService.setApiKey(userId, value);
          break;
        case 'persona':
          await userDataService.setPersona(userId, value);
          break;
        case 'goal':
          await userDataService.setGoal(userId, value);
          break;
        case 'responses':
          await userDataService.setResponses(userId, value);
          break;
        case 'screenTime':
          await userDataService.setScreenTime(userId, value);
          break;
        case 'timerStart':
          await userDataService.setTimerStart(userId, value);
          break;
        case 'uploadedImageData':
          await userDataService.setUploadedImageData(userId, value);
          break;
        case 'checklist':
          await checklistsService.updateChecklist(userId, value);
          break;
        case 'profile':
          await userDataService.setProfile(userId, value);
          break;
        case 'settings':
          await userDataService.setSettings(userId, value);
          break;
        case 'subscription':
          await userDataService.setSubscription(userId, value);
          break;
        default:
          console.warn('Unknown app data key:', key);
      }
    } catch (error) {
      console.error('Error updating data:', error);
      toast.error('Error saving data');
    }
  };

  const updateSubs = async (subs: Sub[]): Promise<void> => {
    if (!user) return;
    setAppData(prev => ({ ...prev, subs }));
    try {
      await subsService.updateAll(user.id, subs);
    } catch (error) {
      console.error('Error updating subs:', error);
      toast.error('Error saving subs');
    }
  };

  const createSub = async (sub: Omit<Sub, 'id' | 'created_at' | 'updated_at'>): Promise<Sub | null> => {
    if (!user) return null;
    try {
      const newSub = await subsService.create(user.id, sub);
      if (newSub) {
        setAppData(prev => ({ ...prev, subs: [...prev.subs, newSub] }));
        return newSub;
      }
      return null;
    } catch (error) {
      console.error('Error creating sub:', error);
      toast.error('Error creating sub');
      return null;
    }
  };

  const updateSub = async (id: string, updates: Partial<Sub>): Promise<Sub | null> => {
    if (!user) return null;
    try {
      const updatedSub = await subsService.update(user.id, id, updates);
      if (updatedSub) {
        setAppData(prev => ({
          ...prev,
          subs: prev.subs.map(s => (s.id === id ? { ...s, ...updatedSub } : s)),
        }));
        return updatedSub;
      }
      return null;
    } catch (error) {
      console.error('Error updating sub:', error);
      toast.error('Error updating sub');
      return null;
    }
  };

  const deleteSub = async (id: string): Promise<void> => {
    if (!user) return;
    try {
      const success = await subsService.delete(user.id, id);
      if (success) {
        setAppData(prev => ({
          ...prev,
          subs: prev.subs.filter(s => s.id !== id),
        }));
        toast.success('Sub deleted.');
      } else {
        toast.error('Failed to delete sub.');
      }
    } catch (error) {
      console.error('Error deleting sub:', error);
      toast.error('Error deleting sub');
    }
  };

  const updateTributes = async (tributes: Tribute[]): Promise<void> => {
    if (!user) return;
    setAppData(prev => ({ ...prev, tributes }));
    try {
      await tributesService.updateAll(user.id, tributes);
    } catch (error) {
      console.error('Error updating tributes:', error);
      toast.error('Error saving tributes');
    }
  };

  const updateCustomPrices = async (customPrices: CustomPrice[]): Promise<void> => {
    if (!user) return;
    setAppData(prev => ({ ...prev, customPrices }));
    try {
      await customPricesService.updateAll(user.id, customPrices);
    } catch (error) {
      console.error('Error updating custom prices:', error);
      toast.error('Error saving custom prices');
    }
  };

  const updateCalendar = async (calendar: CalendarEvent[]): Promise<void> => {
    if (!user) return;
    setAppData(prev => ({ ...prev, calendarEvents: calendar }));
    try {
      await calendarService.updateAll(user.id, calendar);
    } catch (error) {
      console.error('Error updating calendar:', error);
      toast.error('Error saving calendar');
    }
  };

  const updateRedflags = async (redflags: RedFlag[]): Promise<void> => {
    if (!user) return;
    setAppData(prev => ({ ...prev, redflags }));
    try {
      await redflagsService.updateAll(user.id, redflags);
    } catch (error) {
      console.error('Error updating redflags:', error);
      toast.error('Error saving redflags');
    }
  };

  const updateChecklist = (key: keyof Checklist, value: any) => {
    setAppData(prev => ({
      ...prev,
      checklist: {
        ...prev.checklist,
        [key]: value
      }
    }));
  };

  const saveAllAppData = (newData?: AppData): void => {
    const dataToSave = newData || appData;
    setAppData(dataToSave);
  };

  const clearAllData = async (): Promise<void> => {
    if (!user) return;
    
    if (window.confirm('Are you sure you want to clear all data? This cannot be undone.')) {
      try {
        const userId = user.id;
        
        await Promise.all([
          userDataService.setApiKey(userId, ''),
          userDataService.setPersona(userId, DEFAULT_APP_DATA.persona || 'dominant'),
          userDataService.setGoal(userId, DEFAULT_APP_DATA.goal),
          userDataService.setResponses(userId, DEFAULT_APP_DATA.responses),
          userDataService.setScreenTime(userId, 0),
          userDataService.setTimerStart(userId, null),
          userDataService.setUploadedImageData(userId, null),
          subsService.updateAll(userId, []),
          tributesService.updateAll(userId, []),
          customPricesService.updateAll(userId, []),
          calendarService.updateAll(userId, []),
          redflagsService.updateAll(userId, []),
        ]);

        setAppData(DEFAULT_APP_DATA);
        toast.success('All data has been cleared.');
      } catch (error) {
        console.error('Error clearing data:', error);
        toast.error('Error clearing data');
      }
    }
  };

  const exportData = (): void => {
    const dataStr = JSON.stringify(appData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'findom-assistant-backup.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Data exported!');
  };

  const importData = (data: AppData): void => {
    if (window.confirm('This will overwrite all current data. Are you sure?')) {
      saveAllAppData(data);
      toast.success('Data imported successfully!');
    }
  };

  const addChecklistTask = async (task: string): Promise<void> => {
    if (!appData.checklist?.tasks.includes(task)) {
      const updatedTasks = [...(appData.checklist?.tasks || []), task];
      await updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks });
      toast.success('Task added!');
    } else {
      toast.error('Task already exists.');
    }
  };

  const editChecklistTask = async (oldTask: string, newTask: string): Promise<void> => {
    if (oldTask === newTask) {
      toast.info('No change made to task.');
      return;
    }
    if (appData.checklist?.tasks.includes(newTask)) {
      toast.error('A task with this name already exists.');
      return;
    }
    const updatedTasks = (appData.checklist?.tasks || []).map(t => (t === oldTask ? newTask : t));
    const updatedCompleted = (appData.checklist?.completed || []).map(t => (t === oldTask ? newTask : t));
    await updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks, completed: updatedCompleted });
    toast.success('Task updated!');
  };

  const deleteChecklistTask = async (task: string): Promise<void> => {
    const updatedTasks = (appData.checklist?.tasks || []).filter(t => t !== task);
    const updatedCompleted = (appData.checklist?.completed || []).filter(t => t !== task);
    await updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks, completed: updatedCompleted });
    toast.success('Task deleted!');
  };

  const handleToggleWeeklyTask = (task: string) => {
    const isCompleted = appData.checklist?.weeklyCompleted?.includes(task) || false;
    
    if (isCompleted) {
      // Remove from completed
      const updatedWeeklyCompleted = (appData.checklist?.weeklyCompleted || []).filter(t => t !== task);
      updateChecklist('weeklyCompleted', updatedWeeklyCompleted);
    } else {
      // Add to completed
      const updatedWeeklyCompleted = [...(appData.checklist?.weeklyCompleted || []), task];
      updateChecklist('weeklyCompleted', updatedWeeklyCompleted);
    }
  };

  const migrateFromLocalStorage = async (): Promise<void> => {
    try {
      await migrationService.migrateFromLocalStorage();
      window.location.reload();
    } catch (error) {
      console.error('Migration failed:', error);
    }
  };

  return {
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
    createSub,
    updateSub,
    deleteSub,
    updateTributes,
    updateCustomPrices,
    updateCalendar,
    updateRedflags,
    updateChecklist,
    handleToggleWeeklyTask,
  };
};