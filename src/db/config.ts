import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';
import { env } from 'src/env';

export const dataSourceOptions = {
  type: 'postgres',
  url: env.DB_URI,
  entities: [__dirname + '/../**/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/**/*.{js,ts}'],
  synchronize: false,
  migrationsRun: false,
  migrationsTableName: 'migrations',
  namingStrategy: new SnakeNamingStrategy(),
  useUTC: true,
} as TypeOrmModuleOptions;

export default new DataSource(dataSourceOptions as DataSourceOptions);
