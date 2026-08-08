import { v2 as cloudinary } from 'cloudinary';
import crypto from 'node:crypto';
import path from 'node:path';
import { configStorage } from '@/configs/index.js';
import type {
    StorageFile,
    StorageResult,
} from '../storage.types.js';

cloudinary.config({
    cloud_name: configStorage.CLOUDINARY.CLOUD_NAME,
    api_key: configStorage.CLOUDINARY.API_KEY,
    api_secret: configStorage.CLOUDINARY.API_SECRET,
});

const upload = async (
    file: StorageFile,
): Promise<StorageResult> => {
    const extension = path.extname(
        file.originalName,
    );

    const publicId = `${crypto.randomUUID()}${extension}`;

    const result =
        await new Promise<{
            public_id: string;
            secure_url: string;
        }>((resolve, reject) => {
            const stream =
                cloudinary.uploader.upload_stream(
                    {
                        public_id: publicId,
                        resource_type: 'auto',
                    },
                    (error, result) => {
                        if (error) {
                            reject(error);
                            return;
                        }

                        if (!result) {
                            reject(
                                new Error(
                                    'Cloudinary upload failed',
                                ),
                            );
                            return;
                        }

                        resolve({
                            public_id: result.public_id,
                            secure_url: result.secure_url,
                        });
                    },
                );

            stream.end(file.buffer);
        });

    return {
        key: result.public_id,
        url: result.secure_url,
        provider: 'cloudinary',
    };
};

const remove = async (
    key: string,
): Promise<void> => {
    await cloudinary.uploader.destroy(key, {
        resource_type: 'image',
    });
};

const getUrl = async (
    key: string,
): Promise<string> => {
    return cloudinary.url(key, {
        secure: true,
    });
};

export const cloudinaryStorageProvider = {
    upload,
    delete: remove,
    getUrl,
} as const;