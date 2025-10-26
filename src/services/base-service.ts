import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse } from '@/types';

export abstract class BaseService<T extends { id: string }> {
  protected supabase = supabase;

  public abstract getTableName(): string;

  protected transformFromDB(items: any[]): T[] {
    return items as T[];
  }

  protected transformToDB(item: Partial<T>): any {
    return item;
  }

  async getAll(userId: string): Promise<T[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      
      return this.transformFromDB(data || []);
    } catch (error) {
      console.error(`Error fetching ${this.getTableName()}:`, error);
      return [];
    }
  }

  async updateAll(userId: string, items: T[]): Promise<void> {
    try {
      await this.supabase
        .from(this.getTableName())
        .delete()
        .eq('user_id', userId);

      if (items.length > 0) {
        const itemsWithUserId = items.map(item => ({
          ...this.transformToDB(item),
          user_id: userId,
        }));

        const { error } = await this.supabase
          .from(this.getTableName())
          .insert(itemsWithUserId);

        if (error) {
          throw error;
        }
      }
    } catch (error) {
      console.error(`Error updating ${this.getTableName()}:`, error);
      throw error;
    }
  }

  async create(userId: string, item: Omit<T, 'id'>): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .insert({ ...this.transformToDB(item as Partial<T>), user_id: userId })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return this.transformFromDB([data])[0];
    } catch (error) {
      console.error(`Error creating ${this.getTableName()}:`, error);
      return null;
    }
  }

  async update(userId: string, id: string, updates: Partial<T>): Promise<T | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .update(this.transformToDB(updates))
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return this.transformFromDB([data])[0];
    } catch (error) {
      console.error(`Error updating ${this.getTableName()}:`, error);
      return null;
    }
  }

  async delete(userId: string, id: string): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from(this.getTableName())
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      
      return true;
    } catch (error) {
      console.error(`Error deleting ${this.getTableName()}:`, error);
      return false;
    }
  }
}