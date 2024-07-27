import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { CoffeesService } from './coffees.service';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';

@Controller('coffees')
export class CoffeesController {
  constructor(private readonly coffeesService: CoffeesService) {}

  // coffees/flavors
  @Get('flavors')
  findAll() {
    return this.coffeesService.findAll();
  }

  //http://localhost:3000/coffees?limit=2&offset=20
  @Get()
  findAllPaginated(@Query() paginationQuery) {
    const { limit, offset } = paginationQuery;

    return `returns all paginated coffees ${limit} ${offset}`;
  }

  @Get(':id') // route parameters
  findOne(@Param('id') id: string) {
    return this.coffeesService.findById(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createCoffeeDto: CreateCoffeeDto) {
    return this.coffeesService.create(createCoffeeDto);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCoffeeDto: UpdateCoffeeDto) {
    this.coffeesService.update(id, updateCoffeeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {}
}
