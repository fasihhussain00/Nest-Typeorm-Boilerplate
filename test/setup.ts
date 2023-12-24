import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { getTestDBContainer } from './test.container';
import { StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { dataSourceOptions } from 'src/db/config';
import { DataSourceOptions } from 'typeorm';

interface IDBContainerConfig {
  typeormConfig: TypeOrmModuleOptions;
  container: StartedPostgreSqlContainer;
}

let dbContainerConfig: IDBContainerConfig;
export async function getTestDbConnection(): Promise<IDBContainerConfig> {
  if (!dbContainerConfig?.container) {
    const container = await getTestDBContainer();
    const typeormConfig = {
      ...dataSourceOptions,
      url: container.getConnectionUri(),
    } as DataSourceOptions;
    dbContainerConfig = { container, typeormConfig };
  }
  return dbContainerConfig;
}
getTestDbConnection();
