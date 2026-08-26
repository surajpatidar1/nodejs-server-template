import { googleProvider } from './providers/google.provider.js';

const providers = {
  google: googleProvider,
} as const;

type OAuthProviderName = keyof typeof providers;

const getProvider = (provider: OAuthProviderName) => {
  const selectedProvider = providers[provider];
  if (!selectedProvider) {
    throw new Error(`Unsupported OAuth provider: ${provider}`);
  }

  return selectedProvider;
};

const getAuthorizationUrl = (provider: OAuthProviderName): string => {
  return getProvider(provider).getAuthorizationUrl();
};

const authenticate = async (provider: OAuthProviderName, code: string) => {
  const selectedProvider = getProvider(provider);
  const tokens = await selectedProvider.exchangeCode(code);
  const profile = await selectedProvider.getProfile(tokens.accessToken);

  return {
    tokens,
    profile,
  };
};

export const oauthService = {
  getAuthorizationUrl,
  authenticate,
} as const;
