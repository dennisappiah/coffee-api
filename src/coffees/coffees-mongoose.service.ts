import { Injectable, NotFoundException } from '@nestjs/common';
import { Coffee } from './entities/coffee-mongo.entity';
import { CreateCoffeeDto } from './dto/create-coffee.dto';
import { InjectConnection, InjectModel } from '@nestjs/mongoose';
import { Connection, Model } from 'mongoose';
import { UpdateCoffeeDto } from './dto/update-coffee.dto';
import { PaginationQueryDto } from 'src/common/dto/pagination-query.dto';

@Injectable()
export class CoffeesMongooseService {
  constructor(
    // injecting mongoose model
    @InjectModel(Coffee.name) private readonly coffeeModel: Model<Coffee>,
    @InjectModel(Event.name) private readonly eventModel: Model<Event>,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  findAll() {
    return this.coffeeModel.find().exec();
  }

  findAllPaginated(paginattionQuery: PaginationQueryDto) {
    const { limit, offset } = paginattionQuery;
    return this.coffeeModel.find().skip(offset).limit(limit).exec();
  }

  async findOne(id: string) {
    const coffee = await this.coffeeModel.findOne({ _id: id }).exec();

    if (!coffee) throw new NotFoundException(`Coffee with ID ${id} not found`);

    return coffee;
  }

  async create(createCoffeeDto: CreateCoffeeDto) {
    const coffee = new this.coffeeModel(createCoffeeDto);

    return coffee.save();
  }

  async update(id: string, updateCoffeeDto: UpdateCoffeeDto) {
    const existingCoffee = await this.coffeeModel
      .findOneAndUpdate({ _id: id }, { $set: updateCoffeeDto }, { new: true })
      .exec();

    if (!existingCoffee)
      throw new NotFoundException(`Coffee with ID ${id} not found`);

    return existingCoffee;
  }

  async remove(id: string) {
    const coffee = await this.coffeeModel.findOneAndDelete({ _id: id }).exec();

    if (!coffee) throw new NotFoundException(`Coffee with ID ${id} not found`);
    return coffee;
  }

  async recommendCoffee(coffee: Coffee) {
    const session = await this.connection.startSession();
    session.startTransaction();

    try {
      coffee.recommendations++;

      const recommendEvent = new this.eventModel({
        name: 'recommend_coffee',
        type: 'coffee',
        payload: { coffeeId: coffee.id },
      });

      await recommendEvent.save({ session });
      await coffee.save({ session });
    } catch (err) {
      await session.abortTransaction();
    } finally {
      await session.endSession();
    }
  }
}
