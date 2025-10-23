import { useContext } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { AppData, Checklist, Sub, Tribute, CustomPrice, CalendarEvent, RedFlag } from '@/types';
import { DEFAULT_APP_DATA } from '@/constants/default-data';
import {
  subsService,
  tributesService,
  customPricesService,
  calendarService,
  redflagsService,
  checklistsService,
  userDataService,
  migrationService,
} from '@/services';

export const useFindomActions = (appData: AppData, setAppData: React.Dispatch<React.SetStateAction<AppData>>) => {
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
          await checklistsService.update(userId, value);
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
    setAppData(prev => ({ ...prev, calendar }));
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
          userDataService.setPersona(userId, DEFAULT_APP_DATA.persona),
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
    a.download = 'findom_assistant_backup.json';
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
    if (!appData.checklist.tasks.includes(task)) {
      const updatedTasks = [...appData.checklist.tasks, task];
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
    if (appData.checklist.tasks.includes(newTask)) {
      toast.error('A task with this name already exists.');
      return;
    }
    const updatedTasks = appData.checklist.tasks.map(t => (t === oldTask ? newTask : t));
    const updatedCompleted = appData.checklist.completed.map(t => (t === oldTask ? newTask : t));
    await updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks, completed: updatedCompleted });
    toast.success('Task updated!');
  };

  const deleteChecklistTask = async (task: string): Promise<void> => {
    const updatedTasks = appData.checklist.tasks.filter(t => t !== task);
    const updatedCompleted = appData.checklist.completed.filter(t => t !== task);
    await updateAppData('checklist', { ...appData.checklist, tasks: updatedTasks, completed: updatedCompleted });
    toast.success('Task deleted!');
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
    updateTributes,
    updateCustomPrices,
    updateCalendar,
    updateRedflags,
    updateChecklist,
  };
};