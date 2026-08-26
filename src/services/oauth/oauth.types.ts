export interface OAuthProfile {
  providerId: string;
  email: string;
  firstname: string;
  lastname: string;
  profileImage?: string;
}

export interface OAuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
}
