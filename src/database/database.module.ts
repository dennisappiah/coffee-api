import { DynamicModule, Module } from '@nestjs/common';
import { DataSource, DataSourceOptions } from 'typeorm';

@Module({})
export class DatabaseModule {
  // register static method
  static register(options: DataSourceOptions): DynamicModule {
    const dataSource = new DataSource(options);
    return {
      module: DatabaseModule,
      providers: [
        {
          provide: 'DATA_SOURCE',
          useFactory: async () => {
            if (!dataSource.isInitialized) {
              await dataSource.initialize();
            }
            return dataSource;
          },
        },
      ],
      exports: ['DATA_SOURCE'],
    };
  }
}
