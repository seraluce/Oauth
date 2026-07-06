import type { OAuthProvider, OAuthTokens, OAuthUserInfo } from "./types";
import { APP_URL } from "@/lib/utils/constants";

export function createGithubProvider(
  clientId: string,
  clientSecret: string
): OAuthProvider {
  return {
    name: "github",

    getAuthorizationUrl(state: string): string {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: `${APP_URL}/api/user/oauth/callback?provider=github`,
        scope: "read:user user:email",
        state,
      });
      return `https://github.com/login/oauth/authorize?${params}`;
    },

    async exchangeCode(code: string): Promise<OAuthTokens> {
      const res = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: `${APP_URL}/api/user/oauth/callback?provider=github`,
        }),
      });

      const data = await res.json();
      return {
        accessToken: data.access_token,
        scope: data.scope,
      };
    },

    async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
      const userRes = await fetch("https://api.github.com/user", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await userRes.json();

      let email = user.email;
      if (!email) {
        const emailsRes = await fetch("https://api.github.com/user/emails", {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        const emails = await emailsRes.json();
        const primary = emails.find(
          (e: { primary: boolean; verified: boolean }) => e.primary && e.verified
        );
        email = primary?.email || emails[0]?.email;
      }

      return {
        id: String(user.id),
        email,
        name: user.name || user.login,
        avatarUrl: user.avatar_url,
        emailVerified: true,
      };
    },
  };
}
