import type { OAuthProvider, OAuthTokens, OAuthUserInfo } from "./types";
import { APP_URL } from "@/lib/utils/constants";

export function createGoogleProvider(
  clientId: string,
  clientSecret: string
): OAuthProvider {
  return {
    name: "google",

    getAuthorizationUrl(state: string): string {
      const params = new URLSearchParams({
        client_id: clientId,
        redirect_uri: `${APP_URL}/api/user/oauth/callback?provider=google`,
        response_type: "code",
        scope: "openid email profile",
        state,
        access_type: "offline",
        prompt: "consent",
      });
      return `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
    },

    async exchangeCode(code: string): Promise<OAuthTokens> {
      const res = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          grant_type: "authorization_code",
          redirect_uri: `${APP_URL}/api/user/oauth/callback?provider=google`,
        }),
      });

      const data = await res.json();
      return {
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
        expiresIn: data.expires_in,
        scope: data.scope,
      };
    },

    async getUserInfo(accessToken: string): Promise<OAuthUserInfo> {
      const res = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      const user = await res.json();

      return {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.picture,
        emailVerified: user.verified_email,
      };
    },
  };
}
