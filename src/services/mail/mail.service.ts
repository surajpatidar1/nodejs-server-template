import nodemailer from 'nodemailer';
import { configMail } from '@/configs/index.js';

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
  async send({
    to,
    subject,
    html,
  }: {
    to: string;
    subject: string;
    html: string;
  }): Promise<void> {

    await transporter.sendMail({
      from: configMail.FROM,
      to,
      subject,
      html,
    });
  },
} as const;