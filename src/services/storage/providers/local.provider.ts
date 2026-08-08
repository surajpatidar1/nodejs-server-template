import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

import { configStorage } from '@/configs/index.js';
import type {
    StorageFile,
    StorageResult,
} from '../storage.types.js';

const destination = path.resolve(
    configStorage.LOCAL.DESTINATION,
);

const ensureDirectory = async (): Promise<void> => {
    await fs.mkdir(destination, {
        recursive: true,
    });
};

const resolvePath = (key: string): string => {
    const filePath = path.resolve(
        destination,
        key,
    );

    if (!filePath.startsWith(`${destination}${path.sep}`,)
    ) {
        throw new Error('Invalid storage key');
    }
    return filePath;
};

const upload = async (
    file: StorageFile,
): Promise<StorageResult> => {
    await ensureDirectory();

    const extension = path.extname(file.originalName,);
    const key = `${crypto.randomUUID()}${extension}`;
    const filePath = resolvePath(key);

    await fs.writeFile(
        filePath,
        file.buffer,
    );

    return {
        key,
        url: `/uploads/${key}`,
        provider: 'local',
    };
};

const remove = async (
    key: string,
): Promise<void> => {
    const filePath = resolvePath(key);

    try {
        await fs.unlink(filePath);
    } catch (error) {
        if (
            error instanceof Error &&
            'code' in error &&
            error.code === 'ENOENT'
        ) {
            return;
        }

        throw error;
    }
};

const getUrl = async (
    key: string,
): Promise<string> => {
    return `/uploads/${key}`;
};

export const localStorageProvider = {
    upload,
    delete: remove,
    getUrl,
} as const;