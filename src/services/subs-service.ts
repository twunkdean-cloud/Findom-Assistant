import { BaseService } from './base-service';
import { Sub } from '@/types';

export class SubsService extends BaseService<Sub> {
  protected getTableName(): string {
    return 'subs';
  }

  protected transformFromDB(items: any[]): Sub[] {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      total: item.total,
      lastTribute: item.last_tribute || null,
      preferences: item.preferences || null,
      notes: item.notes || null,
      conversationHistory: item.conversation_history || null,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  protected transformToDB(item: Sub): any {
    return {
      id: item.id,
      name: item.name,
      total: item.total,
      last_tribute: item.lastTribute,
      preferences: item.preferences,
      notes: item.notes,
      conversation_history: item.conversationHistory,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }

  async create(userId: string, item: Omit<Sub, 'id'>): Promise<Sub> {
    try {
      const { data, error } = await this.supabase
        .from(this.getTableName())
        .insert({
          ...this.transformToDB(item as Sub),
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
}

export const subsService = new SubsService();