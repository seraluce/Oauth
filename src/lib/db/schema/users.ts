import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey(),
  username: text("username").notNull(),
  email: text("email").notNull(),
  emailVerifiedAt: integer("email_verified_at", { mode: "timestamp" }),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("user"),
  status: text("status").notNull().default("active"),
  failedLoginAttempts: integer("failed_login_attempts").notNull().default(0),
  lockedUntil: integer("locked_until", { mode: "timestamp" }),
  displayName: text("display_name"),
  avatarUrl: text("avatar_url"),
  lastLoginAt: integer("last_login_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
