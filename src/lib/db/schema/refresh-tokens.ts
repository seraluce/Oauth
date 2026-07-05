import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { ssoApplications } from "./sso-applications";

export const refreshTokens = sqliteTable("refresh_tokens", {
  id: integer("id").primaryKey(),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  applicationId: integer("application_id").references(() => ssoApplications.id),
  token: text("token").notNull(),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  revokedAt: integer("revoked_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
