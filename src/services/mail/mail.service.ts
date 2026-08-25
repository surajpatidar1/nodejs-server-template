import nodemailer from 'nodemailer';
import { configMail } from '@/configs/index.js';
import { mailQueue } from './mail.queue.js';
import type { MailJobData } from './mail.queue.js';
import { renderTemplate } from './renderer.js';

const transporter = nodemailer.createTransport({
  host: configMail.HOST,
  port: configMail.PORT,
  secure: configMail.PORT === 465,

  auth: {
    user: configMail.USER,
    pass: configMail.PASSWORD,
  },
});

const enqueue = async (data: MailJobData): Promise<void> => {
  await mailQueue.add('send-mail', data);
};

export const mailService = {
  async verifyConnection(): Promise<void> {
    await transporter.verify();
  },

  async enqueue(data: MailJobData): Promise<void> {
    await enqueue(data);
  },

  async enqueueTemplate(data: {
    to: string;
    subject: string;
    template: string;
    variables: object;
  }): Promise<void> {
    const html = renderTemplate(data.template, data.variables);

    await enqueue({
      to: data.to,
      subject: data.subject,
      html,
    });
  },

  async send(data: MailJobData): Promise<void> {
    await transporter.sendMail({
      from: configMail.FROM,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  },
} as const;
