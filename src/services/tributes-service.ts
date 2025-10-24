import { BaseService } from './base-service';
import { Tribute } from '@/types';

interface DBTribute {
  id: string;
  amount: number;
  date: string;
  from: string;
  reason?: string;
  notes?: string;
  source: string;
  created_at?: string;
  updated_at?: string;
}

export class TributesService extends BaseService<Tribute> {
  protected getTableName(): string {
    return 'tributes';
  }

  protected transformFromDB(items: DBTribute[]): Tribute[] {
    return items.map(item => ({
      id: item.id,
      amount: item.amount,
      date: item.date,
      from_sub: item.from,
      reason: item.reason || null,
      notes: item.notes || null,
      source: item.source,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  protected transformToDB(item: Tribute): DBTribute {
    return {
      id: item.id,
      amount: item.amount,
      date: item.date,
      from: item.from_sub,
      reason: item.reason || undefined,
      notes: item.notes || undefined,
      source: item.source,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}

export const tributesService = new TributesService();