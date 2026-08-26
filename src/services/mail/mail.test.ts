import { mailService } from './mail.service.js';

export async function testMailQueue(): Promise<void> {
  await mailService.enqueue({
    to: 'surajpatidar@498gmail.com',
    subject: 'Thank You for Using the Template',
    html: `
      <h1>Hello 👋</h1>

      <p>
        Thank you for using this Node.js server template!
      </p>

      <p>
        I hope this template helps you build your application
        faster and with a solid production-ready foundation.
      </p>

      <p>
        Thank you for using the template. ❤️
      </p>

      <p>
        Best regards,<br />
        Suraj
      </p>
    `,
  });

  console.log('✓ Test mail added to BullMQ successfully');
}
