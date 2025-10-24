import { BaseService } from './base-service';
import { RedFlag } from '@/types';

export class RedflagsService extends BaseService<RedFlag> {
  protected getTableName(): string {
    return 'redflags';
  }

  protected transformFromDB(items: any[]): RedFlag[] {
    return items.map(item => ({
      id: item.id,
      username: item.username,
      reason: item.reason,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  protected transformToDB(item: RedFlag): any {
    return {
      id: item.id,
      username: item.username,
      reason: item.reason,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}

export const redflagsService = new RedflagsService();