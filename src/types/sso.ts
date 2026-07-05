export interface SsoApplication {
  id: number;
  name: string;
  description: string | null;
  clientId: string;
  ownerUserId: number;
  redirectUris: string[];
  scopes: string;
  isActive: boolean;
  createdAt: Date;
}

export interface AuthorizationRequest {
  clientId: string;
  redirectUri: string;
  responseType: string;
  scope: string;
  state?: string;
  codeChallenge?: string;
  codeChallengeMethod?: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope: string;
}

export interface UserInfoResponse {
  sub: string;
  username: string;
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
}
