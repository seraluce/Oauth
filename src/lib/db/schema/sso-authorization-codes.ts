import { sqliteTable, integer, text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { ssoApplications } from "./sso-applications";

export const ssoAuthorizationCodes = sqliteTable("sso_authorization_codes", {
  id: integer("id").primaryKey(),
  applicationId: integer("application_id")
    .notNull()
    .references(() => ssoApplications.id),
  userId: integer("user_id")
    .notNull()
    .references(() => users.id),
  code: text("code").notNull(),
  redirectUri: text("redirect_uri").notNull(),
  scope: text("scope").notNull(),
  codeChallenge: text("code_challenge"),
  codeChallengeMethod: text("code_challenge_method"),
  expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
  usedAt: integer("used_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
});
