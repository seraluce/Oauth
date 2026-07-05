export interface OAuthProvider {
  name: string;
  getAuthorizationUrl(state: string): string;
  exchangeCode(code: string): Promise<OAuthTokens>;
  getUserInfo(accessToken: string): Promise<OAuthUserInfo>;
}

export interface OAuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn?: number;
  scope?: string;
}

export interface OAuthUserInfo {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  emailVerified?: boolean;
}
