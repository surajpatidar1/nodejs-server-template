import { createProcessor } from '../queue/index.js';
import { MAIL_QUEUE, type MailJobData } from './mail.queue.js';
import { mailService } from './mail.service.js';

export const createMailProcessor = () =>
  createProcessor<MailJobData>(MAIL_QUEUE, async (job) => {
    await mailService.send(job.data);
  });
