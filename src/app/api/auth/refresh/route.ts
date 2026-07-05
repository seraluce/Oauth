import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { refreshTokens, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { signJwt } from "@/lib/auth/jwt";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, applyRateLimit } from "@/lib/api/handler";
import { ACCESS_TOKEN_EXPIRY } from "@/lib/utils/constants";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);

  const rateLimitRes = await applyRateLimit("api", ctx.ipAddress);
  if (rateLimitRes) return rateLimitRes;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const { refreshToken } = body;
  if (!refreshToken) {
    return errorResponse("VALIDATION_ERROR", "Refresh token required", 400);
  }

  const db = getDb();
  const tokenRecord = db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.token, refreshToken))
    .get();

  if (!tokenRecord || tokenRecord.revokedAt || new Date() > tokenRecord.expiresAt) {
    return errorResponse("INVALID_TOKEN", "Invalid or expired refresh token", 401);
  }

  const user = db
    .select({ role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, tokenRecord.userId))
    .get();

  if (!user || user.status !== "active") {
    return errorResponse("INVALID_TOKEN", "Invalid or expired refresh token", 401);
  }

  const accessToken = await signJwt(
    {
      sub: String(tokenRecord.userId),
      userId: tokenRecord.userId,
      role: user.role,
      sessionId: `api_${tokenRecord.id}`,
    },
    ACCESS_TOKEN_EXPIRY
  );

  return successResponse({ accessToken, expiresIn: ACCESS_TOKEN_EXPIRY });
}
