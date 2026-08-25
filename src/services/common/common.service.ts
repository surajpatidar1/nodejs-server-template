import crypto from 'node:crypto';
import os from 'node:os';
import { promisify } from 'node:util';
import { configPassword } from '@/configs/config.password.js';

const scryptAsync = promisify(crypto.scrypt);

export const utilService = {
  async hashPassword(password: string) {
    const salt = crypto.randomBytes(configPassword.SALT_LENGTH).toString('hex');

    const derivedKey = (await scryptAsync(
      password,
      salt,
      configPassword.KEY_LENGTH,
    )) as Buffer;

    return {
      hash: derivedKey.toString('hex'),
      salt,
    };
  },

  async verifyPassword(
    password: string,
    storedHash: string,
    salt: string,
  ): Promise<boolean> {
    const derivedKey = (await scryptAsync(
      password,
      salt,
      configPassword.KEY_LENGTH,
    )) as Buffer;

    const storedHashBuffer = Buffer.from(storedHash, 'hex');
    if (derivedKey.length !== storedHashBuffer.length) return false;

    return crypto.timingSafeEqual(derivedKey, storedHashBuffer);
  },

  generateOtp(length = 6, ttlInMinutes = 5) {
    if (length < 1 || length > 9) {
      throw new Error('OTP length must be between 1 and 9');
    }

    if (ttlInMinutes <= 0) {
      throw new Error('OTP TTL must be greater than 0');
    }

    const code = crypto
      .randomInt(0, 10 ** length)
      .toString()
      .padStart(length, '0');

    const expiresAt = new Date(Date.now() + ttlInMinutes * 60 * 1000);

    return {
      code,
      expiresAt,
    };
  },

  isOtpExpired(lastSentAt: Date, ttlInMinutes = 5): boolean {
    return Date.now() - lastSentAt.getTime() > ttlInMinutes * 60 * 1000;
  },

  generateUsername(name: string): string {
    const username = name
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');

    const randomNumber = crypto.randomInt(1000, 9999);
    return `${username}${randomNumber}`;
  },

  buildSearchFilter: <T extends string>(
    search: string | undefined,
    fields: readonly T[],
  ) => {
    const value = search?.trim();

    if (!value) return {};

    return {
      OR: fields.map((field) => ({
        [field]: {
          contains: value,
          mode: 'insensitive' as const,
        },
      })),
    };
  },

  async batchable<T, R>(
    elements: T[],
    fn: (element: T, index: number) => Promise<R>,
    batchSize = Math.max(1, os.cpus().length),
  ): Promise<R[]> {
    const results: R[] = [];
    let currentIndex = 0;

    const worker = async (): Promise<void> => {
      while (currentIndex < elements.length) {
        const index = currentIndex++;
        results[index] = await fn(elements[index], index);
      }
    };

    const workers = Array.from(
      {
        length: Math.min(batchSize, elements.length),
      },
      () => worker(),
    );

    await Promise.all(workers);
    return results;
  },
} as const;
