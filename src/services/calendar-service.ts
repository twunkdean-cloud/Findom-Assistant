import { BaseService } from './base-service';
import { CalendarEvent } from '@/context/FindomContext';

export class CalendarService extends BaseService<CalendarEvent> {
  constructor() {
    super('calendar_events');
  }
}

export const calendarService = new CalendarService();