import { supabase } from '@/integrations/supabase/client';
import { useAppToast } from '@/hooks/use-app-toast';
import { useOffline } from '@/hooks/use-offline';

export abstract class BaseServiceV2 {
  protected tableName: string;
  protected toast = useAppToast();
  protected offline = useOffline();
  protected userId: string;

  constructor(tableName: string, userId: string) {
    this.tableName = tableName;
    this.userId = userId;
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

  async getAll(): Promise<T[]> {
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', this.userId)
    ) as Promise<T[]>;
  }

  async getById(id: string): Promise<T | null> {
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .select('*')
        .eq('user_id', this.userId)
        .eq('id', id)
        .single()
    ) as Promise<T | null>;
  }

  async create(data: Partial<T>): Promise<T> {
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .insert({ ...data, user_id: this.userId })
        .select('*')
        .single()
    ) as Promise<T>;
  }

  async update(id: string, data: Partial<T>): Promise<T> {
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .update(data)
        .eq('user_id', this.userId)
        .eq('id', id)
        .select('*')
        .single()
    ) as Promise<T>;
  }

  async delete(id: string): Promise<boolean> {
    return this.handleOperation(
      () => supabase
        .from(this.tableName)
        .delete()
        .eq('user_id', this.userId)
        .eq('id', id)
    ) as Promise<boolean>;
  }
}