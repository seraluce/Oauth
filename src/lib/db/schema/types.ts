import type { DbDriver } from "../dialect";

export interface UserRecord {
  id: number;
  username: string;
  email: string;
  emailVerifiedAt: Date | null;
  passwordHash: string;
  role: "user" | "admin";
  status: "active" | "suspended" | "locked";
  failedLoginAttempts: number;
  lockedUntil: Date | null;
  displayName: string | null;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface SessionRecord {
  id: string;
  userId: number;
  token: string;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface OAuthAccountRecord {
  id: number;
  userId: number;
  provider: "github" | "google";
  providerAccountId: string;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiresAt: Date | null;
  scope: string | null;
  createdAt: Date;
}

export interface VerificationCodeRecord {
  id: number;
  email: string;
  code: string;
  type: "registration" | "password_reset" | "email_verification";
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface SSOApplicationRecord {
  id: number;
  name: string;
  description: string | null;
  clientId: string;
  clientSecretHash: string;
  ownerUserId: number;
  redirectUris: string;
  scopes: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SSOAuthorizationCodeRecord {
  id: number;
  applicationId: number;
  userId: number;
  code: string;
  redirectUri: string;
  scope: string;
  codeChallenge: string | null;
  codeChallengeMethod: "S256" | "plain" | null;
  expiresAt: Date;
  usedAt: Date | null;
  createdAt: Date;
}

export interface RefreshTokenRecord {
  id: number;
  userId: number;
  applicationId: number | null;
  token: string;
  expiresAt: Date;
  revokedAt: Date | null;
  createdAt: Date;
}

export interface UserSettingsRecord {
  userId: number;
  theme: "light" | "dark" | "system";
  locale: string;
  twoFactorEnabled: boolean;
  twoFactorSecret: string | null;
  emailNotifications: boolean;
  updatedAt: Date;
}

export interface AuditLogRecord {
  id: number;
  userId: number | null;
  action: string;
  ipAddress: string | null;
  userAgent: string | null;
  details: string | null;
  createdAt: Date;
}

export interface IdSequenceRecord {
  name: string;
  currentValue: number;
}

export interface AllTables {
  users: any;
  sessions: any;
  oauthAccounts: any;
  verificationCodes: any;
  ssoApplications: any;
  ssoAuthorizationCodes: any;
  refreshTokens: any;
  userSettings: any;
  auditLogs: any;
  idSequence: any;
}
