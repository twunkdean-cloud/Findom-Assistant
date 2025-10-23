import { supabase } from '@/integrations/supabase/client';

export abstract class BaseService<T extends { id: string }> {
  protected tableName: string;

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(userId: string): Promise<T[]> {
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return this.transformFromDB(data || []);
  }

  async create(userId: string, item: Omit<T, 'id'>): Promise<T> {
    const itemToInsert = { ...this.transformToDB(item as T), user_id: userId };
    
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(itemToInsert)
      .select()
      .single();

    if (error) throw error;
    return this.transformFromDB([data])[0];
  }

  async update(userId: string, id: string, updates: Partial<T>): Promise<T> {
    const { data, error } = await supabase
      .from(this.tableName)
      .update(this.transformToDB(updates as T))
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.transformFromDB([data])[0];
  }

  async delete(userId: string, id: string): Promise<void> {
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async updateAll(userId: string, items: T[]): Promise<void> {
    // Delete existing items
    await supabase.from(this.tableName).delete().eq('user_id', userId);
    
    // Insert new items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => {
        const transformed = this.transformToDB(item);
        return {
          ...transformed,
          user_id: userId
        };
      });
      
      const { error } = await supabase.from(this.tableName).insert(itemsToInsert);
      if (error) throw error;
    }
  }

  // Override these methods in subclasses for custom transformations
  protected transformFromDB(items: any[]): T[] {
    return items;
  }

  protected transformToDB(item: T): any {
    return item;
  }
}