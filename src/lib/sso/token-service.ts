import { getDb } from "@/lib/db";
import { refreshTokens, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { signJwt } from "@/lib/auth/jwt";
import { generateToken } from "@/lib/auth/id-generator";
import { ACCESS_TOKEN_EXPIRY, REFRESH_TOKEN_EXPIRY } from "@/lib/utils/constants";

export async function issueTokens(
  userId: number,
  applicationId: number | null,
  scope: string
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}> {
  const db = await getDb();

  const user = await db
    .select({ role: users.role })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  const accessToken = await signJwt(
    {
      sub: String(userId),
      userId,
      role: user?.role || "user",
      sessionId: `sso_${applicationId || "direct"}`,
    },
    ACCESS_TOKEN_EXPIRY
  );

  const refreshTokenValue = generateToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY * 1000);

  await db.insert(refreshTokens)
    .values({
      userId,
      applicationId,
      token: refreshTokenValue,
      expiresAt,
      createdAt: new Date(),
    });

  return {
    accessToken,
    refreshToken: refreshTokenValue,
    expiresIn: ACCESS_TOKEN_EXPIRY,
  };
}

export async function refreshAccessToken(
  refreshTokenValue: string,
  applicationId: number | null
): Promise<{
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} | null> {
  const db = await getDb();

  const existingToken = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, refreshTokenValue))
    .get();

  if (!existingToken) return null;
  if (existingToken.revokedAt) return null;
  if (new Date() > existingToken.expiresAt) return null;
  if (applicationId !== null && existingToken.applicationId !== applicationId)
    return null;

  await db.update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.id, existingToken.id));

  return issueTokens(
    existingToken.userId,
    existingToken.applicationId,
    "openid profile email"
  );
}

export async function revokeToken(tokenValue: string): Promise<void> {
  const db = await getDb();
  await db.update(refreshTokens)
    .set({ revokedAt: new Date() })
    .where(eq(refreshTokens.token, tokenValue));
}
