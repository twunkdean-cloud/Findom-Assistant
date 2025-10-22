import { BaseService } from './base-service';
import { Tribute } from '@/context/FindomContext';

interface DBTribute {
  id: string;
  user_id: string;
  amount: number;
  date: string;
  from_sub: string;
  reason: string | null;
  notes: string | null;
  source: string;
}

export class TributesService extends BaseService<Tribute> {
  constructor() {
    super('tributes');
  }

  protected transformFromDB(items: DBTribute[]): Tribute[] {
    return items.map(item => ({
      id: item.id,
      amount: item.amount,
      date: item.date,
      from: item.from_sub,
      reason: item.reason || '',
      notes: item.notes || '',
      source: item.source,
    }));
  }

  protected transformToDB(item: Tribute): Omit<DBTribute, 'id' | 'user_id'> {
    return {
      amount: item.amount,
      date: item.date,
      from_sub: item.from,
      reason: item.reason || null,
      notes: item.notes || null,
      source: item.source,
    };
  }

  async create(item: Omit<Tribute, 'id'>): Promise<Tribute> {
    const dbItem = this.transformToDB(item as Tribute);
    return super.create(dbItem);
  }

  async update(id: string, updates: Partial<Tribute>): Promise<Tribute> {
    const dbUpdates = this.transformToDB(updates as Tribute);
    return super.update(id, dbUpdates);
  }
}

export const tributesService = new TributesService();