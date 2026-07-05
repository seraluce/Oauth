interface CloudflareEnv {
  DB: D1Database;
  DB_DRIVER: string;
  NEXT_PUBLIC_APP_NAME: string;
  EMAIL_MODE: string;
  JWT_SECRET: string;
  SESSION_SECRET: string;
  ENCRYPTION_KEY: string;
  SSO_ISSUER: string;
  SSO_PRIVATE_KEY: string;
  SSO_PUBLIC_KEY: string;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  EMAIL_FROM: string;
  SMTP_HOST: string;
  SMTP_PORT: string;
  SMTP_USER: string;
  SMTP_PASSWORD: string;
  REDIS_URL: string;
  NEXT_PUBLIC_APP_URL: string;
  LOCKOUT_MAX_ATTEMPTS: string;
  LOCKOUT_DURATION_MINUTES: string;
  BCRYPT_ROUNDS: string;
}
