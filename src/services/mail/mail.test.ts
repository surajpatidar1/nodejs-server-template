// import into main.ts and call testMailQueue() for testing 
import { mailService } from './mail.service.js';

export async function testMailQueue(): Promise<void> {
  await mailService.enqueue({
    to: 'surajpatidar498@gmail.com',
    subject: 'BullMQ Mail Test',
    html: `
      <h1>BullMQ is working</h1>
      <p>This email was sent through the BullMQ mail queue.</p>
    `,
  });
}