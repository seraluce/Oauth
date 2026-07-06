import { getSystemConfig } from "@/lib/settings";
import { createGithubProvider } from "./github";
import { createGoogleProvider } from "./google";
import type { OAuthProvider } from "./types";

export async function getEnabledProviders(): Promise<Record<string, OAuthProvider>> {
  const config = await getSystemConfig();
  const providers: Record<string, OAuthProvider> = {};

  if (config.oauth.github.enabled && config.oauth.github.clientId && config.oauth.github.clientSecret) {
    providers.github = createGithubProvider(config.oauth.github.clientId, config.oauth.github.clientSecret);
  }

  if (config.oauth.google.enabled && config.oauth.google.clientId && config.oauth.google.clientSecret) {
    providers.google = createGoogleProvider(config.oauth.google.clientId, config.oauth.google.clientSecret);
  }

  return providers;
}
