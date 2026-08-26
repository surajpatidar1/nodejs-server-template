import {
  BadRequestException,
  UnauthorizedException,
} from '@/utils/exceptions.js';
import { databaseService } from '../database/database.service.js';
import { utilService } from '../common/common.service.js';
import { OTP_TTL_MINUTES } from '@/module/auth/index.js';
import { mailService } from '../mail/mail.service.js';
import { environmentService } from '@/utils/index.js';

export type OtpType = 'register' | 'forgot-password';

export const otpService = {
  async sendCode(data: { email: string; type: OtpType }) {
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
    const lastSentAt = new Date();

    const otpRecord = await databaseService.client.otp.upsert({
      where: {
        transport_target: {
          transport: 'Email',
          target: data.email,
        },
      },

      update: {
        code,
        lastSentAt,
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

    const template = data.type === 'register' ? 'otp' : 'forgot-password';
    const subject =
      data.type === 'register' ? 'Verification code' : 'Password reset code';

    await mailService.enqueueTemplate({
      to: data.email,
      subject,
      template,
      variables: {
        code,
        expiresIn: OTP_TTL_MINUTES,
      },
    });

    return {
      success: true,
      message:
        data.type === 'register'
          ? 'Verification code sent successfully.'
          : 'Password reset code sent successfully.',
      expiresAt: new Date(lastSentAt.getTime() + OTP_TTL_MINUTES * 60 * 1000),
      attempts: otpRecord.attempt,
    };
  },

  async verifyOtp(data: { otp: string; email: string }): Promise<boolean> {
    const isDevBypass =
      environmentService.isDevelopment() && data.otp === '000000';

    const otpRecord = await databaseService.client.otp.findUnique({
      where: {
        transport_target: {
          transport: 'Email',
          target: data.email,
        },
      },
    });

    if (!otpRecord) {
      if (isDevBypass) {
        return true;
      }
      throw UnauthorizedException(
        `No verification code sent for ${data.email}`,
      );
    }

    if (otpRecord.blocked) {
      throw UnauthorizedException('OTP verification blocked.');
    }

    if (otpRecord.lastCodeVerified) {
      throw UnauthorizedException('OTP has already been verified.');
    }

    if (
      !isDevBypass &&
      utilService.isOtpExpired(otpRecord.lastSentAt, OTP_TTL_MINUTES)
    ) {
      throw UnauthorizedException('OTP has expired.');
    }

    if (!isDevBypass && otpRecord.code !== data.otp) {
      const retries = otpRecord.retries + 1;

      await databaseService.client.otp.update({
        where: {
          transport_target: {
            transport: 'Email',
            target: data.email,
          },
        },
        data: {
          retries,
        },
      });

      throw UnauthorizedException('Invalid OTP.');
    }

    await databaseService.client.otp.update({
      where: {
        transport_target: {
          transport: 'Email',
          target: data.email,
        },
      },
      data: {
        lastCodeVerified: true,
        retries: 0,
      },
    });

    return true;
  },
} as const;
