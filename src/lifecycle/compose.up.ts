import { ValidateServer } from '@/types/index.js';
import { startServer } from '@/server.js';
import { databaseService } from '@/services/index.js';

export async function composeUp({
  port,
  appName,
  env,
}: ValidateServer) {

  await databaseService.connect();
  const server = await startServer(
    port,
    appName,
    env,
  );

  return server;
}