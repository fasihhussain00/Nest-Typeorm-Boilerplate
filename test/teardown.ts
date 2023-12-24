import { getTestDbConnection } from './setup';

async function teardown() {
  const dbContainerConfig = await getTestDbConnection();
  await dbContainerConfig.container.stop();
}

teardown();
