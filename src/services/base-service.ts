import { supabase } from '@/integrations/supabase/client';
import { ServiceResponse } from '@/types';

export abstract class BaseService<T extends { id: string }> {
  protected supabase = supabase;

  abstract getTableName(): string;

  protected transformFromDB(items: any[]): T[] {
    return items as T[];
  }

  protected transformToDB(item: T): any {
    return item;
  }

  async getAll(userId: string): Promise<ServiceResponse<T[]>> {
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .select('*')
        .eq('user_id', userId);

      if (error) {
        throw error;
      }
      
      return {
        data: this.transformFromDB(data || []),
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error fetching ${this.getTableName()}:`, error);
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
      
      return {
        data: undefined,
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error updating ${this.getTableName()}:`, error);
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
        .from(this.getTableName())
        .insert({ ...this.transformToDB(item as T), user_id: userId })
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return {
        data: this.transformFromDB([data])[0],
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error creating ${this.getTableName()}:`, error);
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
        .from(this.getTableName())
        .update(this.transformToDB(updates as T))
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) {
        throw error;
      }
      
      return {
        data: this.transformFromDB([data])[0],
        success: true,
        error: null
      };
    } catch (error) {
      console.error(`Error updating ${this.getTableName()}:`, error);
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
        .from(this.getTableName())
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
      console.error(`Error deleting ${this.getTableName()}:`, error);
      return {
        data: undefined,
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}