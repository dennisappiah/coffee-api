import { Flavor } from '../entities/flavor.entity';

export class UpdateCoffeeDto {
  readonly name?: string;
  readonly brand?: string;
  readonly flavors?: Flavor[];
}
