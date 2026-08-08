import { databaseService, mailService, utilService } from '@/services/index.js';
import { BadRequestException } from '@/utils/exceptions.js';
import { OTP_TTL_MINUTES } from './index.js';

export const authService = {
  async sendCode(data: { email: string; type: string }) {
    const isUser = await databaseService.client.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (isUser) {
      throw BadRequestException('User already registered .');
    }

    const existingOtp = await databaseService.client.otp.findUnique({
      where: {
        transport_target: {
          transport: 'Email',
          target: data.email,
        },
      },
    });

    if (
      existingOtp &&
      !utilService.isOtpExpired(existingOtp.lastSentAt, OTP_TTL_MINUTES)
    ) {
      throw BadRequestException(
        'OTP already sent. Please wait before requesting another.',
      );
    }

    const { code } = utilService.generateOtp();

    await databaseService.client.otp.upsert({
      where: {
        transport_target: {
          transport: 'Email',
          target: data.email,
        },
      },
      update: {
        code,
        lastSentAt: new Date(),
        attempt: {
          increment: 1,
        },
        retries: 0,
        lastCodeVerified: false,
        blocked: false,
      },
      create: {
        code,
        transport: 'Email',
        target: data.email,
      },
    });

    await mailService.enqueueTemplate({
      to: data.email,
      subject: 'Verification code',
      template: 'otp',
      variables: {
        code: code,
        expiresIn: OTP_TTL_MINUTES,
      },
    });

    return {
      message: 'Verification code sent successfully.',
    };
  },
} as const;
