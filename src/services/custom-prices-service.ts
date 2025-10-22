import { BaseService } from './base-service';
import { CustomPrice } from '@/context/FindomContext';

export class CustomPricesService extends BaseService<CustomPrice> {
  constructor() {
    super('custom_prices');
  }
}

export const customPricesService = new CustomPricesService();