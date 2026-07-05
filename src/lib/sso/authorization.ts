import { getDb } from "@/lib/db";
import { ssoAuthorizationCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateToken } from "@/lib/auth/id-generator";
import { AUTH_CODE_EXPIRY } from "@/lib/utils/constants";
import crypto from "crypto";

export async function createAuthorizationCode(
  applicationId: number,
  userId: number,
  redirectUri: string,
  scope: string,
  codeChallenge?: string,
  codeChallengeMethod?: string
): Promise<string> {
  const db = getDb();
  const code = generateToken();
  const expiresAt = new Date(Date.now() + AUTH_CODE_EXPIRY);

  db.insert(ssoAuthorizationCodes)
    .values({
      applicationId,
      userId,
      code,
      redirectUri,
      scope,
      codeChallenge: codeChallenge || null,
      codeChallengeMethod: codeChallengeMethod || null,
      expiresAt,
      createdAt: new Date(),
    })
    .run();

  return code;
}

export async function consumeAuthorizationCode(
  code: string,
  applicationId: number,
  redirectUri: string,
  codeVerifier?: string
): Promise<{ userId: number; scope: string } | null> {
  const db = getDb();
  const authCode = db
    .select()
    .from(ssoAuthorizationCodes)
    .where(
      and(
        eq(ssoAuthorizationCodes.code, code),
        eq(ssoAuthorizationCodes.applicationId, applicationId)
      )
    )
    .get();

  if (!authCode) return null;
  if (authCode.usedAt) return null;
  if (new Date() > authCode.expiresAt) return null;
  if (authCode.redirectUri !== redirectUri) return null;

  if (authCode.codeChallenge) {
    if (!codeVerifier) return null;
    const expected =
      authCode.codeChallengeMethod === "S256"
        ? crypto
            .createHash("sha256")
            .update(codeVerifier)
            .digest("base64url")
        : codeVerifier;

    if (expected !== authCode.codeChallenge) return null;
  }

  db.update(ssoAuthorizationCodes)
    .set({ usedAt: new Date() })
    .where(eq(ssoAuthorizationCodes.id, authCode.id))
    .run();

  return { userId: authCode.userId, scope: authCode.scope };
}
