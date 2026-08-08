import { OAuth2Client } from 'google-auth-library';
import { configOAuth } from '@/configs/index.js';
import type { OAuthProvider } from '../oauth.provider.js';
import type {
    OAuthProfile,
    OAuthToken,
} from '../oauth.types.js';

const googleClient = new OAuth2Client(
    configOAuth.GOOGLE.CLIENT_ID,
    configOAuth.GOOGLE.CLIENT_SECRET,
    configOAuth.GOOGLE.CALLBACK_URL,
);

const getAuthorizationUrl =
    (): string => {
        return googleClient.generateAuthUrl({
            access_type: 'offline',
            prompt: 'consent',
            scope: [
                'openid',
                'email',
                'profile',
            ],
        });
    };

const exchangeCode = async (
    code: string,
): Promise<OAuthToken> => {
    const { tokens } =
        await googleClient.getToken(code);

    if (!tokens.access_token) {
        throw new Error(
            'Google access token was not returned',
        );
    }

    return {
        accessToken: tokens.access_token,
        refreshToken:
            tokens.refresh_token ?? undefined,
        expiresIn:
            tokens.expiry_date
                ? Math.floor(
                    (tokens.expiry_date -
                        Date.now()) /
                    1000,
                )
                : undefined,
    };
};

const getProfile = async (
    accessToken: string,
): Promise<OAuthProfile> => {
    const response = await fetch(
        'https://www.googleapis.com/oauth2/v3/userinfo',
        {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        },
    );

    if (!response.ok) {
        throw new Error(
            'Failed to fetch Google profile',
        );
    }

    const profile = (await response.json()) as {
        sub: string;
        email?: string;
        given_name?: string;
        family_name?: string;
        picture?: string;
    };

    if (!profile.email) {
        throw new Error(
            'Google account email was not returned',
        );
    }

    return {
        providerId: profile.sub,
        email: profile.email,
        firstname: profile.given_name ?? '',
        lastname: profile.family_name ?? '',
        profileImage: profile.picture,
    };
};

export const googleProvider: OAuthProvider = {
    getAuthorizationUrl,
    exchangeCode,
    getProfile,
};