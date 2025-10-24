import { supabase } from '@/integrations/supabase/client';
import { useAppToast } from '@/hooks/use-app-toast';
import { useOffline } from '@/hooks/use-offline';

export abstract class BaseServiceV2 {
  protected tableName: string;
  protected toast = useAppToast();
  protected offline = useOffline();

  constructor(tableName: string) {
    this.tableName = tableName;
  }

  protected async handleOperation<T>(
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string,
    offlineAction?: {
      url: string;
      method: string;
      headers: Record<string, string>;
      body?: string;
    }
  ): Promise<T | null> {
    try {
      const result = await operation();
      if (successMessage) {
        this.toast.showSuccess(successMessage);
      }
      return result;
    } catch (error) {
      console.error(`Error in ${this.tableName} service:`, error);
      
      // If offline and we have an offline action, queue it
      if (this.offline.isOffline && offlineAction) {
        await this.offline.addToQueue(offlineAction);
        return null;
      }
      
      const message = errorMessage || `Failed to perform operation on ${this.tableName}`;
      this.toast.showError(message);
      return null;
    }
  }

  protected async getAll<T>(userId: string): Promise<T[]> {
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .then(({ data, error }) => {
          if (error) throw error;
          return data as T[];
        }),
      undefined,
      `Failed to fetch ${this.tableName}`
    ) || [];
  }

  protected async create<T>(userId: string, data: Partial<T>): Promise<T | null> {
    const createData = { ...data, user_id: userId };
    
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .insert(createData)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as T;
        }),
      `${this.tableName} created successfully`,
      `Failed to create ${this.tableName}`,
      {
        url: `/rest/v1/${this.tableName}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify(createData),
      }
    );
  }

  protected async update<T>(id: string, data: Partial<T>): Promise<T | null> {
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .update(data)
        .eq('id', id)
        .select()
        .single()
        .then(({ data, error }) => {
          if (error) throw error;
          return data as T;
        }),
      `${this.tableName} updated successfully`,
      `Failed to update ${this.tableName}`,
      {
        url: `/rest/v1/${this.tableName}?id=eq.${id}`,
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        },
        body: JSON.stringify(data),
      }
    );
  }

  protected async delete(id: string): Promise<boolean> {
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) throw error;
          return true;
        }),
      `${this.tableName} deleted successfully`,
      `Failed to delete ${this.tableName}`,
      {
        url: `/rest/v1/${this.tableName}?id=eq.${id}`,
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${supabase.supabaseKey}`,
          'apikey': supabase.supabaseKey,
        },
      }
    ) || false;
  }
}