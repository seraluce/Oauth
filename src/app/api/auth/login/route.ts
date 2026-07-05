import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { createSession } from "@/lib/auth/session";
import { loginSchema } from "@/lib/security/validation";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { isAccountLocked, recordFailedLogin, resetFailedLogin } from "@/lib/security/lockout";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, applyRateLimit, logAuditEvent } from "@/lib/api/handler";
import { SESSION_COOKIE_NAME } from "@/lib/utils/constants";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);

  const rateLimitRes = await applyRateLimit("login", ctx.ipAddress);
  if (rateLimitRes) return rateLimitRes;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid input",
      400,
      parsed.error.issues
    );
  }

  const { email: rawEmail, password } = parsed.data;
  const email = sanitizeEmail(rawEmail);

  const db = await getDb();
  const user = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (!user) {
    return errorResponse(
      "INVALID_CREDENTIALS",
      "Invalid email or password",
      401
    );
  }

  if (user.status === "suspended") {
    return errorResponse("ACCOUNT_SUSPENDED", "Account has been suspended", 403);
  }

  const locked = await isAccountLocked(user.id);
  if (locked) {
    return errorResponse(
      "ACCOUNT_LOCKED",
      "Account temporarily locked. Please try again later.",
      423
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await recordFailedLogin(user.id);
    await logAuditEvent(user.id, "login_failed", ctx.ipAddress, ctx.userAgent);
    return errorResponse(
      "INVALID_CREDENTIALS",
      "Invalid email or password",
      401
    );
  }

  await resetFailedLogin(user.id);

  const { sessionId, accessToken } = await createSession(
    user.id,
    ctx.ipAddress,
    ctx.userAgent
  );

  await db.update(users)
    .set({ lastLoginAt: new Date(), updatedAt: new Date() })
    .where(eq(users.id, user.id));

  await logAuditEvent(user.id, "login", ctx.ipAddress, ctx.userAgent);

  const response = successResponse({
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      displayName: user.displayName,
      avatarUrl: user.avatarUrl,
    },
    accessToken,
  });

  const cookieHeader = `${SESSION_COOKIE_NAME}=${sessionId}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 60 * 60}${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
  response.headers.set("Set-Cookie", cookieHeader);

  return response;
}
