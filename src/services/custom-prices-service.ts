import { BaseService } from './base-service';
import { CustomPrice } from '@/types/index';

export class CustomPricesService extends BaseService<CustomPrice> {
  constructor() {
    super('custom_prices');
  }
}

export const customPricesService = new CustomPricesService();