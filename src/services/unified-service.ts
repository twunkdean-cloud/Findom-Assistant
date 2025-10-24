import { supabase } from '@/integrations/supabase/client';
import { checklistsService } from './checklists-service';

export class UnifiedService<T> {
  protected supabase = supabase;

  constructor(protected tableName: string) {}

  async getAll(userId: string): Promise<T[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return data as T[] || [];
    } catch (error) {
      console.error(`Error fetching ${this.tableName}:`, error);
      return [];
    }
  }

  async updateAll(userId: string, items: T[]): Promise<void> {
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

        if (error) throw error;
      }
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  async create(userId: string, item: T): Promise<T> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert({ ...item, user_id: userId })
        .select()
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Error creating ${this.tableName}:`, error);
      throw error;
    }
  }

  async update(userId: string, id: string, updates: Partial<T>): Promise<T> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .update(updates)
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as T;
    } catch (error) {
      console.error(`Error updating ${this.tableName}:`, error);
      throw error;
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting ${this.tableName}:`, error);
      throw error;
    }
  }
}

// Create typed service instances
export const subsService = new UnifiedService<import('@/types').Sub>('subs');
export const tributesService = new UnifiedService<import('@/types').Tribute>('tributes');
export const customPricesService = new UnifiedService<import('@/types').CustomPrice>('custom_prices');
export const calendarService = new UnifiedService<import('@/types').CalendarEvent>('calendar_events');
export const redflagsService = new UnifiedService<import('@/types').RedFlag>('redflags');

// Export checklistsService separately since it has additional methods
export { checklistsService };