import { Test, TestingModule } from '@nestjs/testing';
import { CoffeesService } from './coffees.service';
import { Connection, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Flavor } from './entities/flavor.entity';
import { Coffee } from './entities/coffee.entity';
import { NotFoundException } from '@nestjs/common';

// Define a type for a mock repository
type MockRepository<T = any> = Partial<Record<keyof Repository<T>, jest.Mock>>;

// Helper function to create a mock repository
const createMockRepository = <T = any>(): MockRepository<T> => ({
  findOne: jest.fn(), // Mock the findOne method
  create: jest.fn(), // Mock the create method
});

describe('CoffeesService', () => {
  let _underTest: CoffeesService;
  let coffeeRepository: MockRepository;

  //set up
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoffeesService, // Provide the CoffeesService
        { provide: Connection, useValue: {} }, // Provide a mock Connection
        {
          provide: getRepositoryToken(Flavor),
          useValue: createMockRepository(), // Provide a mock Flavor repository
        },
        {
          provide: getRepositoryToken(Coffee),
          useValue: createMockRepository(), // Provide a mock Coffee repository
        },
      ],
    }).compile();

    _underTest = module.get<CoffeesService>(CoffeesService); // Get the CoffeesService instance
    coffeeRepository = module.get<MockRepository>(getRepositoryToken(Coffee)); // Get the mock coffee repository
  });

  // Test to ensure the service is defined
  it('should be defined', () => {
    expect(_underTest).toBeDefined();
  });

  describe('findOne', () => {
    it('should return the coffee object when ID exists', async () => {
      // given
      const coffeeId = '1';
      const expectedCoffee = {
        id: '1',
        name: 'Latte',
        brand: 'Starbucks',
        flavors: [],
      };

      // when
      coffeeRepository.findOne.mockReturnValue(expectedCoffee); // Mock the return value of findOne
      const coffee = await _underTest.findOne(coffeeId);

      // then
      expect(coffee).toEqual(expectedCoffee);
      expect(coffeeRepository.findOne).toHaveBeenCalledWith({
        where: { id: coffeeId },
      });
    });

    it('should throw the "NotFoundException"', async () => {
      //given
      const coffeeId = '1';

      // when
      coffeeRepository.findOne.mockReturnValue(undefined); // Mock the return value of findOne to be undefined

      try {
        await _underTest.findOne(coffeeId);
      } catch (err) {
        // then
        expect(err).toBeInstanceOf(NotFoundException);
        expect(err.message).toEqual(`Coffee with ID ${coffeeId} not found`);
      }
    });
  });
});
