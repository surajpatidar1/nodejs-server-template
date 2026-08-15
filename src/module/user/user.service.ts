import { User, UserStatus } from '@/generated/prisma/client.js';
import {
  databaseService,
  utilService,
  storageService,
  otpService,
} from '@/services/index.js';
import { configUser } from '@/configs/index.js';
import {
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@/utils/exceptions.js';

export const userService = {
  async create(data: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    dialCode?: string;
    mobile?: string;
    profileImage?: string;
    country?: string;
  }): Promise<User> {
    let profileImage: string | null = null;

    const { hash, salt } = await utilService.hashPassword(data.password);

    if (data.profileImage) {
      profileImage = await storageService.move(
        data.profileImage,
        configUser.filePath,
      );
    }

    const user = await databaseService.client.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          firstname: data.firstname,
          lastname: data.lastname,
          username: data.username,
          email: data.email,
          dialCode: data.dialCode ?? null,
          mobile: data.mobile ?? null,
          profileImage: profileImage,
          country: data.country ?? null,
        },
      });

      await tx.userMeta.create({
        data: {
          passwordHash: hash,
          passwordSalt: salt,
          userId: user.id,
        },
      });

      return user;
    });

    return user;
  },

  async updateImage(userId: number, filename: string): Promise<string> {
    const user = await databaseService.client.user.findUnique({
      where: { id: userId },
      select: { profileImage: true },
    });

    if (!user) throw NotFoundException('User not found.');

    const profileImage = await storageService.move(
      filename,
      configUser.filePath,
    );

    if (user.profileImage) {
      await storageService.delete(user.profileImage);
    }

    await databaseService.client.user.update({
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
      username?: string;
      dialCode?: string;
      mobile?: string;
      country?: string;
    },
  ) {
    const user = await databaseService.client.user.findUnique({
      where: { id: userId },
    });

    if (!user) throw NotFoundException('User not found.');

    if (data.username && data.username !== user.username) {
      const existingUsername = await databaseService.client.user.findUnique({
        where: { username: data.username },
        select: { id: true },
      });

      if (existingUsername) throw ConflictException('Username already exists.');
    }

    return databaseService.client.user.update({
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

        ...(data.username !== undefined && {
          username: data.username,
        }),

        ...(data.dialCode !== undefined && {
          dialCode: data.dialCode,
        }),

        ...(data.mobile !== undefined && {
          mobile: data.mobile,
        }),

        ...(data.country !== undefined && {
          country: data.country,
        }),
      },
    });
  },

  async deactiveUser(userId: number) {
    const user = await databaseService.client.user.findUnique({
      where: {
        id: userId,
      },
    });

    if (!user) throw NotFoundException('User not exist');

    return await databaseService.client.user.update({
      where: {
        id: userId,
      },
      data: {
        status: UserStatus.Blocked,
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
    const meta = await databaseService.client.userMeta.findUnique({
      where: {
        userId: userId,
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

    if (!isValid) {
      throw UnauthorizedException('Current password is incorrect.');
    }

    const { hash, salt } = await utilService.hashPassword(data.newPassword);

    await databaseService.client.userMeta.update({
      where: {
        userId: userId,
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
    const user = await databaseService.client.user.findUnique({
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

    await databaseService.client.userMeta.update({
      where: {
        userId: user.id,
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
