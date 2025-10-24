import { supabase } from '@/integrations/supabase/client';

export abstract class BaseService<T> {
  protected supabase = supabase;

  protected abstract getTableName(): string;

  protected abstract transformFromDB(items: any[]): T[];
  protected abstract transformToDB(item: T): any;

  async getAll(userId: string): Promise<T[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      return this.transformFromDB(data || []);
    } catch (error) {
      console.error(`Error fetching ${this.getTableName()}:`, error);
      return [];
    }
  }

  async updateAll(userId: string, items: T[]): Promise<void> {
    try {
      // First, delete existing records
      await this.supabase
        .from(this.getTableName())
        .delete()
        .eq('user_id', userId);

      // Then insert new records
      if (items.length > 0) {
        const itemsWithUserId = items.map(item => ({
          ...this.transformToDB(item),
          user_id: userId,
        }));

        const { error } = await this.supabase
          .from(this.getTableName())
          .insert(itemsWithUserId);

        if (error) throw error;
      }
    } catch (error) {
      console.error(`Error updating ${this.getTableName()}:`, error);
      throw error;
    }
  }

  async update(userId: string, id: string, updates: Partial<T>): Promise<T> {
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .update(this.transformToDB(updates as T))
        .eq('id', id)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return this.transformFromDB([data])[0];
    } catch (error) {
      console.error(`Error updating ${this.getTableName()}:`, error);
      throw error;
    }
  }

  async create(userId: string, item: T): Promise<T> {
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .insert({
          ...this.transformToDB(item),
          user_id: userId,
        })
        .select()
        .single();

      if (error) throw error;
      return this.transformFromDB([data])[0];
    } catch (error) {
      console.error(`Error creating ${this.getTableName()}:`, error);
      throw error;
    }
  }

  async delete(userId: string, id: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.getTableName())
        .delete()
        .eq('id', id)
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error(`Error deleting ${this.getTableName()}:`, error);
      throw error;
    }
  }
}