export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || "SSO Auth";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

export const RESERVED_ID_START = 11000;
export const RESERVED_ID_END = 11999;
export const USER_ID_START = 12000;

export const SESSION_COOKIE_NAME = "session_id";
export const CSRF_COOKIE_NAME = "csrf_token";

export const OAUTH_PROVIDERS = ["github", "google"] as const;
export type OAuthProvider = (typeof OAUTH_PROVIDERS)[number];

export const SSO_SCOPES = ["openid", "profile", "email"] as const;

export const VERIFICATION_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
export const ACCESS_TOKEN_EXPIRY = 15 * 60; // 15 minutes in seconds
export const REFRESH_TOKEN_EXPIRY = 30 * 24 * 60 * 60; // 30 days in seconds
export const AUTH_CODE_EXPIRY = 10 * 60 * 1000; // 10 minutes
