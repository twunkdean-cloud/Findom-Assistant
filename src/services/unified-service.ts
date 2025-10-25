import { BaseService } from './base-service';
import { checklistsService } from './checklists-service';
import { ServiceResponse, Sub, Tribute, CustomPrice, CalendarEvent, RedFlag } from '@/types';

// Create typed service classes extending BaseService
class SubsService extends BaseService<Sub> {
  protected getTableName(): string {
    return 'subs';
  }
}

class TributesService extends BaseService<Tribute> {
  protected getTableName(): string {
    return 'tributes';
  }
}

class CustomPricesService extends BaseService<CustomPrice> {
  protected getTableName(): string {
    return 'custom_prices';
  }
}

class CalendarService extends BaseService<CalendarEvent> {
  protected getTableName(): string {
    return 'calendar_events';
  }
}

class RedflagsService extends BaseService<RedFlag> {
  protected getTableName(): string {
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