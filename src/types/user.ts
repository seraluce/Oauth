export interface User {
  id: number;
  username: string;
  email: string;
  emailVerifiedAt: Date | null;
  role: "user" | "admin";
  status: "active" | "suspended" | "locked";
  displayName: string | null;
  avatarUrl: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  id: string;
  userId: number;
  expiresAt: Date;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export interface UserSettings {
  theme: "light" | "dark" | "system";
  locale: string;
  twoFactorEnabled: boolean;
  emailNotifications: boolean;
}
