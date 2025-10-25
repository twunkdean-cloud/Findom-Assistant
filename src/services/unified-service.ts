import { supabase } from '@/integrations/supabase/client';
import { checklistsService } from './checklists-service';
import { ServiceResponse, Sub, Tribute, CustomPrice, CalendarEvent, RedFlag } from '@/types';

export class UnifiedService<T extends { id: string }> {
  protected supabase = supabase;

  constructor(protected tableName: string) {}

  async getAll(userId: string): Promise<ServiceResponse<T[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      
      return {
        data: data as T[] || [],
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      return {
        data: [],
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateAll(userId: string, items: T[]): Promise<ServiceResponse<void>> {
    try {
      await this.supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', userId);

      if (items.length > 0) {
        const itemsWithUserId = items.map(item => ({
          ...item,
          user_id: userId,
        }));

        const { error } = await this.supabase
          .from(this.tableName)
          .insert(itemsWithUserId);

        if (error) {
          throw error;
        }
      }
      
      return {
        data: undefined,
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async create(userId: string, item: Omit<T, 'id'>): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert({ ...item, user_id: userId })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return {
        data: data as T,
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async update(userId: string, id: string, updates: Partial<T>): Promise<ServiceResponse<T>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return {
        data: data as T,
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async delete(userId: string, id: string): Promise<ServiceResponse<void>> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      
      return {
        data: undefined,
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Create typed service instances
export const subsService = new UnifiedService<Sub>('subs');
export const tributesService = new UnifiedService<Tribute>('tributes');
export const customPricesService = new UnifiedService<CustomPrice>('custom_prices');
export const calendarService = new UnifiedService<CalendarEvent>('calendar_events');
export const redflagsService = new UnifiedService<RedFlag>('redflags');

// Export checklistsService separately since it has additional methods
export { checklistsService };