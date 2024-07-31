import { Injectable } from '@nestjs/common';
import { CoffeesService } from 'src/coffees/coffees.service';

// Assuming the coffe-rating service depends on the coffee-service

@Injectable()
export class CoffeeRatingService {
  constructor(private readonly coffeeService: CoffeesService) {}
}
