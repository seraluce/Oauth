import { getDb } from "@/lib/db";
import { systemSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export interface OAuthProviderConfig {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
}

export interface SystemConfig {
  siteName: string;
  siteUrl: string;
  allowRegistration: boolean;
  oauth: {
    github: OAuthProviderConfig;
    google: OAuthProviderConfig;
  };
}

const DEFAULT_CONFIG: SystemConfig = {
  siteName: "SSO Auth",
  siteUrl: "",
  allowRegistration: true,
  oauth: {
    github: { enabled: false, clientId: "", clientSecret: "" },
    google: { enabled: false, clientId: "", clientSecret: "" },
  },
};

export async function getSystemConfig(): Promise<SystemConfig> {
  const db = await getDb();
  const rows = await db.select().from(systemSettings).all();

  const map: Record<string, string> = {};
  for (const row of rows) {
    map[row.key] = row.value;
  }

  const config: SystemConfig = { ...DEFAULT_CONFIG };

  if (map.siteName) config.siteName = map.siteName;
  if (map.siteUrl) config.siteUrl = map.siteUrl;
  if (map.allowRegistration !== undefined) {
    config.allowRegistration = map.allowRegistration === "true";
  }

  for (const provider of ["github", "google"] as const) {
    const prefix = `oauth_${provider}_`;
    config.oauth[provider] = {
      enabled: map[`${prefix}enabled`] === "true",
      clientId: map[`${prefix}client_id`] || "",
      clientSecret: map[`${prefix}client_secret`] || "",
    };
  }

  return config;
}

export async function setSystemConfig(config: SystemConfig): Promise<void> {
  const db = await getDb();

  const entries: Array<[string, string]> = [
    ["siteName", config.siteName],
    ["siteUrl", config.siteUrl],
    ["allowRegistration", String(config.allowRegistration)],
    ["oauth_github_enabled", String(config.oauth.github.enabled)],
    ["oauth_github_client_id", config.oauth.github.clientId],
    ["oauth_github_client_secret", config.oauth.github.clientSecret],
    ["oauth_google_enabled", String(config.oauth.google.enabled)],
    ["oauth_google_client_id", config.oauth.google.clientId],
    ["oauth_google_client_secret", config.oauth.google.clientSecret],
  ];

  for (const [key, value] of entries) {
    const existing = await db
      .select()
      .from(systemSettings)
      .where(eq(systemSettings.key, key))
      .get();

    if (existing) {
      await db
        .update(systemSettings)
        .set({ value })
        .where(eq(systemSettings.key, key));
    } else {
      await db.insert(systemSettings).values({ key, value });
    }
  }
}

export async function getOAuthProvider(
  provider: "github" | "google"
): Promise<OAuthProviderConfig | null> {
  const config = await getSystemConfig();
  const p = config.oauth[provider];
  if (!p.enabled || !p.clientId || !p.clientSecret) return null;
  return p;
}
