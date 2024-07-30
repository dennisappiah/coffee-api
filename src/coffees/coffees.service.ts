import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee.entity';
import { Connection, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { Flavor } from './entities/flavor.entity';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';
import { Event } from 'src/events/entities/event.entity';
import { ConfigType } from '@nestjs/config';
import coffeesConfig from './config/coffees.config';

@Injectable()
export class CoffeesService {
  constructor(
    @InjectRepository(Coffee)
    private readonly coffeeRepository: Repository<Coffee>,

    @InjectRepository(Flavor)
    private readonly flavorRepository: Repository<Flavor>,

    //for transaction
    private readonly connection: Connection,

    // loading env variables based on coffees config
    @Inject(coffeesConfig.KEY)
    private readonly coffeesConfiguration: ConfigType<typeof coffeesConfig>,
  ) {
    const configData = coffeesConfiguration.foo;

    console.log(configData);
  }

  // by default the orm loads data by lazy loading the relations entity,
  //we can include using the relations prop
  findAll() {
    return this.coffeeRepository.find({ relations: ['flavors'] });
  }

  findAllPaginated(paginattionQuery: PaginationQueryDto) {
    const { limit, offset } = paginattionQuery;

    return this.coffeeRepository.find({
      relations: ['flavors'],
      skip: offset,
      take: limit,
    });
  }

  async findOne(id: string) {
    const coffee = await this.coffeeRepository.findOne({
      where: { id: +id },
      relations: ['flavors'],
    });

    if (!coffee) throw new NotFoundException(`Coffee with ID ${id} not found`);

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const flavors = await Promise.all(
      createCoffeeDto.flavors.map((flavor) =>
        this.preloadFlavorByName(flavor.name),
      ),
    );
    // creating instance of coffee
    const coffee = this.coffeeRepository.create({
      ...createCoffeeDto,
      flavors,
    });
    // save instance
    return this.coffeeRepository.save(coffee);
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const flavors =
      updateCoffeeDto.flavors &&
      (await Promise.all(
        updateCoffeeDto.flavors.map((flavor) =>
          this.preloadFlavorByName(flavor.name),
        ),
      ));
    const coffee = await this.coffeeRepository.preload({
      id: +id,
      ...updateCoffeeDto,
    });
    if (!coffee) throw new NotFoundException(`Coffee with ID ${id} not found`);

    return this.coffeeRepository.save(coffee);
  }

  async remove(id: string) {
    const coffee = await this.findOne(id);
    return this.coffeeRepository.remove(coffee);
  }

  // recommmend coffee (update coffee)
  async recommendCoffee(coffee: Coffee) {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent = new Event();
      recommendEvent.name = 'recommend_coffee';
      recommendEvent.type = 'coffee';
      recommendEvent.payload = { coffeeId: coffee.id };

      await queryRunner.manager.save(coffee);
      await queryRunner.manager.save(recommendEvent);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
    } finally {
      await queryRunner.release();
    }
  }

  // method for getting and creating new flavor item by name
  private async preloadFlavorByName(name: string) {
    const existingFlavor = await this.flavorRepository.findOne({
      where: { name },
    });

    if (existingFlavor) {
      return existingFlavor;
    }

    return this.flavorRepository.create({ name });
  }
}
