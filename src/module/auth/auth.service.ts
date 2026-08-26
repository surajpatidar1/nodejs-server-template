import {
  databaseService,
  jwtService,
  oauthService,
  otpService,
  OtpType,
  TokenType,
  utilService,
} from '@/services/index.js';
import {
  ConflictException,
  UnauthorizedException,
} from '@/utils/exceptions.js';
import { User } from '@/generated/prisma/client.js';
import { userService } from '../user/index.js';
import { UserType } from '@/types/index.js';

const findUser = async (email: string) => {
  const user = await databaseService.client.user.findUnique({
    where: { email },
  });

  if (user) {
    return {
      user: user,
      type: UserType.USER,
    };
  }

  const admin = await databaseService.client.admin.findUnique({
    where: { email },
  });

  if (admin) {
    return {
      user: admin,
      type: UserType.ADMIN,
    };
  }

  return null;
};

export const authService = {
  async sendCode(data: { email: string; type: OtpType }) {
    return await otpService.sendCode({
      email: data.email,
      type: data.type,
    });
  },

  async generateAvailableUsername(name: string): Promise<string> {
    const username = utilService.generateUsername(name);

    const exists = await databaseService.client.user.findUnique({
      where: {
        username,
      },
      select: {
        id: true,
      },
    });

    if (exists) {
      throw ConflictException('Username already exists.');
    }

    return username;
  },

  async register(data: {
    firstname: string;
    lastname: string;
    username: string;
    email: string;
    password: string;
    dialCode: string;
    mobile: string;
    profileImage?: string;
    country: string;
    code: string;
  }): Promise<User> {
    const isVerified = await otpService.verifyOtp({
      email: data.email,
      otp: data.code,
    });

    if (!isVerified) throw UnauthorizedException('OTP verification failed.');

    const checkUser = await databaseService.client.user.findUnique({
      where: {
        email: data.email,
      },
    });

    if (checkUser) throw ConflictException('User already register');
    return userService.create(data);
  },

  async login(data: { email: string; password: string }) {
    const result = await findUser(data.email);

    if (!result) throw UnauthorizedException('Invalid credentials');

    const { user, type } = result;

    const meta =
      type === UserType.USER
        ? await databaseService.client.userMeta.findUnique({
            where: { userId: user.id },
            select: {
              passwordHash: true,
              passwordSalt: true,
            },
          })
        : await databaseService.client.adminMeta.findUnique({
            where: { adminId: user.id },
            select: {
              passwordHash: true,
              passwordSalt: true,
            },
          });

    if (!meta?.passwordHash || !meta.passwordSalt) {
      throw UnauthorizedException('Invalid credentials');
    }

    const isValid = await utilService.verifyPassword(
      data.password,
      meta.passwordHash,
      meta.passwordSalt,
    );

    if (!isValid) {
      throw UnauthorizedException('Invalid credentials');
    }

    return {
      user,
      type,
    };
  },

  async refreshToken(refreshToken: string) {
    const payload = jwtService.verify(refreshToken, TokenType.REFRESH_TOKEN);

    const accessToken = jwtService.sign(
      {
        sub: payload.sub,
        type: payload.type,
      },
      TokenType.ACCESS_TOKEN,
    );

    return {
      accessToken,
    };
  },

  async googleAuth(code: string) {
    const { profile } = await oauthService.authenticate('google', code);

    const existingMeta = await databaseService.client.userMeta.findUnique({
      where: { googleId: profile.providerId },
      include: { user: true },
    });

    let user = existingMeta?.user ?? null;

    if (!user) {
      const userByEmail = await databaseService.client.user.findUnique({
        where: { email: profile.email },
      });

      if (userByEmail) {
        user = userByEmail;
        await databaseService.client.userMeta.upsert({
          where: { userId: user.id },
          update: { googleId: profile.providerId },
          create: { userId: user.id, googleId: profile.providerId },
        });
      } else {
        const baseName = `${profile.firstname}${profile.lastname}`.trim();
        let username = utilService.generateUsername(baseName || 'user');
        const usernameExists = await databaseService.client.user.findUnique({
          where: { username },
        });
        if (usernameExists) {
          username = `${username}${Math.floor(100 + Math.random() * 900)}`;
        }

        user = await databaseService.client.user.create({
          data: {
            firstname: profile.firstname || 'Google',
            lastname: profile.lastname || 'User',
            email: profile.email,
            username,
            isVerified: true,
            profileImage: profile.profileImage,
            meta: {
              create: {
                googleId: profile.providerId,
              },
            },
          },
        });
      }
    }

    const accessToken = jwtService.sign(
      {
        sub: String(user.id),
        type: UserType.USER,
      },
      TokenType.ACCESS_TOKEN,
    );

    const refreshToken = jwtService.sign(
      {
        sub: String(user.id),
        type: UserType.USER,
      },
      TokenType.REFRESH_TOKEN,
    );

    return {
      user,
      accessToken,
      refreshToken,
    };
  },
} as const;
