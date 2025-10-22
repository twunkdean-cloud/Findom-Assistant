import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';

export abstract class BaseService<T extends { id: string }> {
  protected tableName: string;
  protected getUserId() {
    const { user } = useAuth();
    if (!user) throw new Error('User not authenticated');
    return user.id;
  }

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  async getAll(): Promise<T[]> {
    const userId = this.getUserId();
    const { data, error } = await supabase
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId);

    if (error) throw error;
    return this.transformFromDB(data || []);
  }

  async create(item: Omit<T, 'id'>): Promise<T> {
    const userId = this.getUserId();
    const itemToInsert = { ...item, user_id: userId };
    
    const { data, error } = await supabase
      .from(this.tableName)
      .insert(itemToInsert)
      .select()
      .single();

    if (error) throw error;
    return this.transformFromDB([data])[0];
  }

  async update(id: string, updates: Partial<T>): Promise<T> {
    const userId = this.getUserId();
    
    const { data, error } = await supabase
      .from(this.tableName)
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) throw error;
    return this.transformFromDB([data])[0];
  }

  async delete(id: string): Promise<void> {
    const userId = this.getUserId();
    
    const { error } = await supabase
      .from(this.tableName)
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throw error;
  }

  async updateAll(items: T[]): Promise<void> {
    const userId = this.getUserId();
    
    // Delete existing items
    await supabase.from(this.tableName).delete().eq('user_id', userId);
    
    // Insert new items
    if (items.length > 0) {
      const itemsToInsert = items.map(item => ({
        ...item,
        user_id: userId
      }));
      
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