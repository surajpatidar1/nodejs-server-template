import { configAdmin } from '@/configs/index.js';
import {
  databaseService,
  otpService,
  storageService,
  utilService,
} from '@/services/index.js';
import {
  NotFoundException,
  UnauthorizedException,
} from '@/utils/exceptions.js';

export const adminService = {
  async updateImage(userId: number, filename: string): Promise<string> {
    const user = await databaseService.client.admin.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    if (!user) throw NotFoundException('User not found.');

    const profileImage = await storageService.move(
      filename,
      configAdmin.filePath,
    );

    if (user.profileImage) {
      await storageService.delete(user.profileImage);
    }

    await databaseService.client.admin.update({
      where: { id: userId },
      data: { profileImage },
    });

    return profileImage;
  },

  async update(
    userId: number,
    data: {
      firstname?: string;
      lastname?: string;
    },
  ) {
    const user = await databaseService.client.admin.findUnique({
      where: { id: userId },
    });

    if (!user) throw NotFoundException('User not found.');

    return databaseService.client.admin.update({
      where: {
        id: userId,
      },
      data: {
        ...(data.firstname !== undefined && {
          firstname: data.firstname,
        }),

        ...(data.lastname !== undefined && {
          lastname: data.lastname,
        }),
      },
    });
  },

  async changePassword(
    userId: number,
    data: {
      currentPassword: string;
      newPassword: string;
    },
  ) {
    const meta = await databaseService.client.adminMeta.findUnique({
      where: {
        adminId: userId,
      },
      select: {
        passwordHash: true,
        passwordSalt: true,
      },
    });

    if (!meta?.passwordHash || !meta.passwordSalt) {
      throw UnauthorizedException('Invalid credentials');
    }

    const isValid = await utilService.verifyPassword(
      data.currentPassword,
      meta.passwordHash,
      meta.passwordSalt,
    );

    if (!isValid) throw UnauthorizedException('Current password is incorrect.');

    const { hash, salt } = await utilService.hashPassword(data.newPassword);

    await databaseService.client.adminMeta.update({
      where: {
        adminId: userId,
      },
      data: {
        passwordHash: hash,
        passwordSalt: salt,
      },
    });

    return {
      success: true,
      message: 'Password changed successfully.',
    };
  },

  async forgotPassword(data: {
    email: string;
    newPassword: string;
    code: string;
  }) {
    const user = await databaseService.client.admin.findUnique({
      where: {
        email: data.email,
      },
    });

    if (!user) {
      throw NotFoundException('User not found.');
    }

    await otpService.verifyOtp({
      otp: data.code,
      email: data.email,
    });

    const { hash, salt } = await utilService.hashPassword(data.newPassword);

    await databaseService.client.adminMeta.update({
      where: {
        adminId: user.id,
      },
      data: {
        passwordHash: hash,
        passwordSalt: salt,
      },
    });

    return {
      success: true,
      message: 'Password reset successfully.',
    };
  },
} as const;
