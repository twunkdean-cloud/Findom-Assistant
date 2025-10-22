import { BaseService } from './base-service';
import { Sub } from '@/context/FindomContext';

interface DBSub {
  id: string;
  user_id: string;
  name: string;
  total: number;
  last_tribute: string | null;
  preferences: string | null;
  notes: string | null;
  conversation_history: string | null;
}

export class SubsService extends BaseService<Sub> {
  constructor() {
    super('subs');
  }

  protected transformFromDB(items: DBSub[]): Sub[] {
    return items.map(item => ({
      id: item.id,
      name: item.name,
      total: item.total,
      lastTribute: item.last_tribute || '',
      preferences: item.preferences || '',
      notes: item.notes || '',
      conversationHistory: item.conversation_history || '',
    }));
  }

  protected transformToDB(item: Sub): Omit<DBSub, 'id' | 'user_id'> {
    return {
      name: item.name,
      total: item.total,
      last_tribute: item.lastTribute || null,
      preferences: item.preferences || null,
      notes: item.notes || null,
      conversation_history: item.conversationHistory || null,
    };
  }

  async create(item: Omit<Sub, 'id'>): Promise<Sub> {
    const dbItem = this.transformToDB(item as Sub);
    return super.create(dbItem);
  }

  async update(id: string, updates: Partial<Sub>): Promise<Sub> {
    const dbUpdates = this.transformToDB(updates as Sub);
    return super.update(id, dbUpdates);
  }
}

export const subsService = new SubsService();