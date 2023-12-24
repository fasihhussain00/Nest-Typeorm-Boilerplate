import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from '@testcontainers/postgresql';
export async function getTestDBContainer(): Promise<StartedPostgreSqlContainer> {
  const container = await new PostgreSqlContainer().start();
  return container;
}
