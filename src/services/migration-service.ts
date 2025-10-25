import { toast } from '@/utils/toast';
import { Sub, Tribute, CustomPrice, CalendarEvent, RedFlag, Checklist } from '@/types/index';
import {
  subsService,
  tributesService,
  customPricesService,
  calendarService,
  redflagsService,
  checklistsService,
} from '@/services/unified-service';
import { userDataService } from './user-data-service';

export class MigrationService {
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('No user ID found');
      }

      // Migrate subs
      const subsData = localStorage.getItem('subs');
      if (subsData) {
        const subs = JSON.parse(subsData);
        await subsService.updateAll(userId, subs);
      }

      // Migrate tributes
      const tributesData = localStorage.getItem('tributes');
      if (tributesData) {
        const tributes = JSON.parse(tributesData);
        await tributesService.updateAll(userId, tributes);
      }

      // Migrate custom prices
      const customPricesData = localStorage.getItem('customPrices');
      if (customPricesData) {
        const customPrices = JSON.parse(customPricesData);
        await customPricesService.updateAll(userId, customPrices);
      }

      // Migrate calendar events
      const calendarData = localStorage.getItem('calendarEvents');
      if (calendarData) {
        const calendarEvents = JSON.parse(calendarData);
        await calendarService.updateAll(userId, calendarEvents);
      }

      // Migrate red flags
      const redflagsData = localStorage.getItem('redflags');
      if (redflagsData) {
        const redflags = JSON.parse(redflagsData);
        await redflagsService.updateAll(userId, redflags);
      }

      // Migrate user data
      const apiKey = localStorage.getItem('apiKey');
      if (apiKey) {
        await userDataService.setApiKey(userId, apiKey);
      }

      const persona = localStorage.getItem('persona');
      if (persona) {
        await userDataService.setPersona(userId, persona);
      }

      const goal = localStorage.getItem('goal');
      if (goal) {
        await userDataService.setGoal(userId, JSON.parse(goal));
      }

      const responses = localStorage.getItem('responses');
      if (responses) {
        await userDataService.setResponses(userId, JSON.parse(responses));
      }

      toast.success('Data migrated successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed. Please try again.');
      throw error;
    }
  }
}

export const migrationService = new MigrationService();