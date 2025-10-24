import { BaseService } from './base-service';
import { CalendarEvent } from '@/types';

export class CalendarService extends BaseService<CalendarEvent> {
  protected getTableName(): string {
    return 'calendar_events';
  }

  protected transformFromDB(items: any[]): CalendarEvent[] {
    return items.map(item => ({
      id: item.id,
      datetime: item.datetime,
      platform: item.platform,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  protected transformToDB(item: CalendarEvent): any {
    return {
      id: item.id,
      datetime: item.datetime,
      platform: item.platform,
      content: item.content,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}

export const calendarService = new CalendarService();