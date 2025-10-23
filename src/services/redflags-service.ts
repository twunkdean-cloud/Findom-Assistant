import { BaseService } from './base-service';
import { RedFlag } from '@/types/index';

export class RedflagsService extends BaseService<RedFlag> {
  constructor() {
    super('redflags');
  }
}

export const redflagsService = new RedflagsService();