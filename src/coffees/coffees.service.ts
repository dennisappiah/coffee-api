import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';

@Injectable()
export class CoffeesService {
  private coffees: Coffee[] = [
    {
      id: 1,
      name: 'shipreck',
      brand: 'buddy',
      flavors: ['chocolate', 'vanilla'],
    },
  ];

  findAll() {
    return this.coffees;
  }

  findById(id: string) {
    const coffee = this.coffees.find((item) => item.id === +id);

    if (!coffee)
      throw new HttpException(
        `could not coffee with ${id}`,
        HttpStatus.NOT_FOUND,
      );

    return coffee;
  }

  create(createCoffeeDto: any) {
    this.coffees.push(createCoffeeDto);
  }

  update(id: string, updateCoffeeDto: any) {
    const existingCoffee = this.findById(id);
    if (existingCoffee) {
      // update
    }
  }
}
