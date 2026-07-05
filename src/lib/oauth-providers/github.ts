import type { OAuthProvider, OAuthTokens, OAuthUserInfo } from "./types";
import { APP_URL } from "@/lib/utils/constants";

const CLIENT_ID = process.env.GITHUB_CLIENT_ID || "";
const CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || "";

export const githubProvider: OAuthProvider = {
  name: "github",

  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: CLIENT_ID,
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
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
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
