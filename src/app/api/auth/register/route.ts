import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users, verificationCodes, userSettings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { getNextUserId } from "@/lib/auth/id-generator";
import { registerSchema } from "@/lib/security/validation";
import { sanitizeEmail, sanitizeInput } from "@/lib/security/sanitize";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, applyRateLimit, logAuditEvent } from "@/lib/api/handler";
import { VERIFICATION_CODE_EXPIRY } from "@/lib/utils/constants";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);

  const rateLimitRes = await applyRateLimit("register", ctx.ipAddress);
  if (rateLimitRes) return rateLimitRes;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(
      "VALIDATION_ERROR",
      "Invalid input",
      400,
      parsed.error.issues
    );
  }

  const { username, email: rawEmail, password, verificationCode } = parsed.data;
  const email = sanitizeEmail(rawEmail);
  const cleanUsername = sanitizeInput(username);

  const db = await getDb();

  const codeRecord = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.type, "registration"),
        eq(verificationCodes.code, verificationCode)
      )
    )
    .get();

  if (!codeRecord) {
    return errorResponse("INVALID_CODE", "Invalid verification code", 400);
  }

  if (codeRecord.usedAt) {
    return errorResponse("CODE_USED", "Verification code already used", 400);
  }

  if (new Date() > codeRecord.expiresAt) {
    return errorResponse("CODE_EXPIRED", "Verification code expired", 400);
  }

  const existingUser = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .get();

  if (existingUser) {
    return errorResponse(
      "EMAIL_EXISTS",
      "Invalid email or password",
      400
    );
  }

  const existingUsername = await db
    .select()
    .from(users)
    .where(eq(users.username, cleanUsername))
    .get();

  if (existingUsername) {
    return errorResponse("USERNAME_EXISTS", "Username already taken", 400);
  }

  const passwordHash = await hashPassword(password);
  const userId = await getNextUserId();
  const now = new Date();

  await db.insert(users)
    .values({
      id: userId,
      username: cleanUsername,
      email,
      passwordHash,
      role: "user",
      status: "active",
      emailVerifiedAt: now,
      failedLoginAttempts: 0,
      createdAt: now,
      updatedAt: now,
    });

  await db.insert(userSettings)
    .values({
      userId,
      theme: "system",
      locale: "en",
      twoFactorEnabled: false,
      emailNotifications: true,
      updatedAt: now,
    });

  await db.update(verificationCodes)
    .set({ usedAt: now })
    .where(eq(verificationCodes.id, codeRecord.id));

  await logAuditEvent(userId, "register", ctx.ipAddress, ctx.userAgent);

  return successResponse({ userId, username: cleanUsername }, 201);
}
