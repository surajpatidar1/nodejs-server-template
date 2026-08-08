import { Server } from 'node:http';
import { ValidateServer } from '@/types/index.js';
import { startServer } from '@/server.js';
import { databaseService, redisService } from '@/services/index.js';
import { environmentService } from '@/utils/index.js';

type MailProcessor = {
  close: () => Promise<void>;
};

interface ComposeResult {
  server: Server;
  mailProcessor?: MailProcessor;
}

export async function composeUp({
  port,
  appName,
  env,
}: ValidateServer): Promise<ComposeResult> {
  let mailProcessor: MailProcessor | undefined;

  await databaseService.connect();
  await redisService.connect();

  if (environmentService.isProduction()) {
    const { createMailProcessor } =
      await import('@/services/mail/mail.processor.js');
    mailProcessor = createMailProcessor();
  }

  const server = await startServer(
    port,
    appName,
    env,
  );

  return {
    server,
    mailProcessor,
  };
}