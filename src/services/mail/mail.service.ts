import nodemailer from 'nodemailer';
import { configMail } from '@/configs/index.js';
import { MailJobData, mailQueue } from './mail.queue.js';

const transporter = nodemailer.createTransport({
  host: configMail.HOST,
  port: configMail.PORT,
  secure: configMail.PORT === 465,

  auth: {
    user: configMail.USER,
    pass: configMail.PASSWORD,
  },
});

export const mailService = {
  async enqueue(
    data: MailJobData,
  ): Promise<void> {
    await mailQueue.add(
      'send-mail',
      data,
    );
  },
  
  async send(
    data: MailJobData,
  ): Promise<void> {
    await transporter.sendMail({
      from: configMail.FROM,
      to: data.to,
      subject: data.subject,
      html: data.html,
    });
  },
} as const;