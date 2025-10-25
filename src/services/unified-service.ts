import { BaseService } from './base-service';
import { checklistsService } from './checklists-service';
import { ServiceResponse, Sub, Tribute, CustomPrice, CalendarEvent, RedFlag } from '@/types';

// Create typed service classes extending BaseService
class SubsService extends BaseService<Sub> {
  public getTableName(): string {
    return 'subs';
  }
}

class TributesService extends BaseService<Tribute> {
  public getTableName(): string {
    return 'tributes';
  }
}

class CustomPricesService extends BaseService<CustomPrice> {
  public getTableName(): string {
    return 'custom_prices';
  }
}

class CalendarService extends BaseService<CalendarEvent> {
  public getTableName(): string {
    return 'calendar_events';
  }
}

class RedflagsService extends BaseService<RedFlag> {
  public getTableName(): string {
    return 'redflags';
  }
}

// Create service instances
export const subsService = new SubsService();
export const tributesService = new TributesService();
export const customPricesService = new CustomPricesService();
export const calendarService = new CalendarService();
export const redflagsService = new RedflagsService();

// Export checklistsService separately since it has additional methods
export { checklistsService };