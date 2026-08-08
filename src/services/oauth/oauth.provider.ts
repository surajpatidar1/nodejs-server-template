import type {
  OAuthProfile,
  OAuthToken,
} from './oauth.types.js';

export interface OAuthProvider {
  getAuthorizationUrl(): string;
  exchangeCode( code: string,): Promise<OAuthToken>;
  getProfile( accessToken: string,): Promise<OAuthProfile>;
}