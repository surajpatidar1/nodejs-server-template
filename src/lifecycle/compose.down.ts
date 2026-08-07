import type { Server } from 'node:http';
import { shutdownServer } from '@/server.js';
import { databaseService } from '@/services/index.js';

export async function composeDown(
  server: Server,
  signal: string,
): Promise<void> {

   shutdownServer(server, signal);
  await databaseService.disconnect();
  process.exit(0)
}