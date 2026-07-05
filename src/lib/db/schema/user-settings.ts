import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";

export const userSettings = sqliteTable("user_settings", {
  userId: integer("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  theme: text("theme").notNull().default("system"),
  locale: text("locale").notNull().default("en"),
  twoFactorEnabled: integer("two_factor_enabled", { mode: "boolean" })
    .notNull()
    .default(false),
  twoFactorSecret: text("two_factor_secret"),
  emailNotifications: integer("email_notifications", { mode: "boolean" })
    .notNull()
    .default(true),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
});
