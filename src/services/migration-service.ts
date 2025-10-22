import { toast } from 'sonner';
import { Sub, Tribute, CustomPrice, CalendarEvent, RedFlag, Checklist, Persona, Goal } from '@/context/FindomContext';
import { subsService } from './subs-service';
import { tributesService } from './tributes-service';
import { customPricesService } from './custom-prices-service';
import { calendarService } from './calendar-service';
import { redflagsService } from './redflags-service';
import { checklistsService } from './checklists-service';
import { userDataService } from './user-data-service';

export class MigrationService {
  async migrateFromLocalStorage(): Promise<void> {
    try {
      const keys = [
        'findom_subs', 
        'findom_tributes', 
        'findom_customPrices', 
        'findom_calendar', 
        'findom_redflags', 
        'findom_checklist', 
        'findom_apiKey', 
        'findom_persona', 
        'findom_goal', 
        'findom_responses'
      ];
      
      const migrationData: Record<string, any> = {};

      // Load data from localStorage
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
      const migrationPromises: Promise<void>[] = [];

      if (migrationData.apiKey) {
        migrationPromises.push(userDataService.setApiKey(migrationData.apiKey));
      }
      
      if (migrationData.persona) {
        migrationPromises.push(userDataService.setPersona(migrationData.persona));
      }
      
      if (migrationData.goal) {
        migrationPromises.push(userDataService.setGoal(migrationData.goal));
      }
      
      if (migrationData.responses) {
        migrationPromises.push(userDataService.setResponses(migrationData.responses));
      }
      
      if (migrationData.screenTime) {
        migrationPromises.push(userDataService.setScreenTime(migrationData.screenTime));
      }
      
      if (migrationData.subs) {
        migrationPromises.push(subsService.updateAll(migrationData.subs));
      }
      
      if (migrationData.tributes) {
        migrationPromises.push(tributesService.updateAll(migrationData.tributes));
      }
      
      if (migrationData.customPrices) {
        migrationPromises.push(customPricesService.updateAll(migrationData.customPrices));
      }
      
      if (migrationData.calendar) {
        migrationPromises.push(calendarService.updateAll(migrationData.calendar));
      }
      
      if (migrationData.redflags) {
        migrationPromises.push(redflagsService.updateAll(migrationData.redflags));
      }
      
      if (migrationData.checklist) {
        migrationPromises.push(checklistsService.update(migrationData.checklist));
      }

      await Promise.all(migrationPromises);
      
      // Clear localStorage after successful migration
      keys.forEach(key => localStorage.removeItem(key));
      
      toast.success('Migration completed successfully!');
    } catch (error) {
      console.error('Migration failed:', error);
      toast.error('Migration failed. Please try again.');
      throw error;
    }
  }

  hasLocalStorageData(): boolean {
    const keys = [
      'findom_subs', 
      'findom_tributes', 
      'findom_customPrices', 
      'findom_calendar', 
      'findom_redflags', 
      'findom_checklist', 
      'findom_apiKey', 
      'findom_persona', 
      'findom_goal', 
      'findom_responses'
    ];
    
    return keys.some(key => {
      const value = localStorage.getItem(key);
      return value && value !== 'null' && value !== 'undefined' && value !== '{}';
    });
  }
}

export const migrationService = new MigrationService();