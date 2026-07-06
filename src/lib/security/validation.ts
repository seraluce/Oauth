import { z } from "zod/v4";

export const registerSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    ),
  email: z.email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
  verificationCode: z.string().length(6, "Verification code must be 6 digits"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.email("Invalid email address"),
});

export const resetPasswordSchema = z.object({
  email: z.email("Invalid email address"),
  code: z.string().length(6, "Verification code must be 6 digits"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const verifyEmailSchema = z.object({
  email: z.email("Invalid email address"),
  code: z.string().length(6, "Verification code must be 6 digits"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128, "Password must be at most 128 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number"),
});

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(30, "Username must be at most 30 characters")
    .regex(
      /^[a-zA-Z0-9_-]+$/,
      "Username can only contain letters, numbers, hyphens, and underscores"
    )
    .optional(),
  email: z.email("Invalid email address").optional(),
  displayName: z.string().max(50).optional().or(z.literal("")),
  avatarUrl: z.string().url().optional().or(z.literal("")),
});

export const updateUserSettingsSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  locale: z.string().max(10).optional(),
  emailNotifications: z.boolean().optional(),
});

export const createSsoApplicationSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  redirectUris: z.array(z.string().url()).min(1),
  scopes: z.string().optional(),
});

const oauthProviderConfigSchema = z.object({
  enabled: z.boolean(),
  clientId: z.string().max(500).default(""),
  clientSecret: z.string().max(500).default(""),
});

export const updateSystemSettingsSchema = z.object({
  siteName: z.string().min(1).max(100),
  siteUrl: z.string().max(500).default(""),
  allowRegistration: z.boolean(),
  oauth: z.object({
    github: oauthProviderConfigSchema,
    google: oauthProviderConfigSchema,
  }),
});
