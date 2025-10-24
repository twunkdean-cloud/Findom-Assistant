import { BaseService } from './base-service';
import { CustomPrice } from '@/types';

export class CustomPricesService extends BaseService<CustomPrice> {
  protected getTableName(): string {
    return 'custom_prices';
  }

  protected transformFromDB(items: any[]): CustomPrice[] {
    return items.map(item => ({
      id: item.id,
      service: item.service,
      price: item.price,
      created_at: item.created_at,
      updated_at: item.updated_at,
    }));
  }

  protected transformToDB(item: CustomPrice): any {
    return {
      id: item.id,
      service: item.service,
      price: item.price,
      created_at: item.created_at,
      updated_at: item.updated_at,
    };
  }
}

export const customPricesService = new CustomPricesService();