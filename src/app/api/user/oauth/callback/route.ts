import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { oauthAccounts, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { getCache } from "@/lib/redis";
import { getEnabledProviders } from "@/lib/oauth-providers";
import { APP_URL } from "@/lib/utils/constants";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const providerName = searchParams.get("provider");

  if (!code || !state || !providerName) {
    return new Response(null, {
      status: 302,
      headers: { Location: `${APP_URL}/login?error=oauth_missing_params` },
    });
  }

  const providers = await getEnabledProviders();
  const provider = providers[providerName];
  if (!provider) {
    return new Response(null, {
      status: 302,
      headers: { Location: `${APP_URL}/login?error=invalid_provider` },
    });
  }

  const cache = getCache();
  const userIdStr = await cache.get(`oauth_state:${state}`);
  if (!userIdStr) {
    return new Response(null, {
      status: 302,
      headers: { Location: `${APP_URL}/login?error=invalid_state` },
    });
  }

  await cache.del(`oauth_state:${state}`);
  const userId = parseInt(userIdStr, 10);

  try {
    const tokens = await provider.exchangeCode(code);
    const userInfo = await provider.getUserInfo(tokens.accessToken);

    const db = await getDb();

    const existing = await db
      .select()
      .from(oauthAccounts)
      .where(
        and(
          eq(oauthAccounts.provider, providerName as any),
          eq(oauthAccounts.providerAccountId, userInfo.id)
        )
      )
      .get();

    if (existing) {
      await db.update(oauthAccounts)
        .set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || null,
          tokenExpiresAt: tokens.expiresIn
            ? new Date(Date.now() + tokens.expiresIn * 1000)
            : null,
          scope: tokens.scope || null,
        })
        .where(eq(oauthAccounts.id, existing.id));
    } else {
      const alreadyBound = await db
        .select()
        .from(oauthAccounts)
        .where(
          and(
            eq(oauthAccounts.userId, userId),
            eq(oauthAccounts.provider, providerName as any)
          )
        )
        .get();

      if (alreadyBound) {
        return new Response(null, {
          status: 302,
          headers: {
            Location: `${APP_URL}/settings/oauth?error=already_bound`,
          },
        });
      }

      await db.insert(oauthAccounts)
        .values({
          userId,
          provider: providerName as any,
          providerAccountId: userInfo.id,
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken || null,
          tokenExpiresAt: tokens.expiresIn
            ? new Date(Date.now() + tokens.expiresIn * 1000)
            : null,
          scope: tokens.scope || null,
          createdAt: new Date(),
        });
    }

    const user = await db
      .select({ avatarUrl: users.avatarUrl, displayName: users.displayName })
      .from(users)
      .where(eq(users.id, userId))
      .get();

    if (!user?.avatarUrl && userInfo.avatarUrl) {
      await db.update(users)
        .set({ avatarUrl: userInfo.avatarUrl, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    return new Response(null, {
      status: 302,
      headers: { Location: `${APP_URL}/settings/oauth?success=connected` },
    });
  } catch (error) {
    console.error("[OAuth Callback Error]", error);
    return new Response(null, {
      status: 302,
      headers: { Location: `${APP_URL}/settings/oauth?error=oauth_failed` },
    });
  }
}
