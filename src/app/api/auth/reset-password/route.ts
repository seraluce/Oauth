import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users, verificationCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { resetPasswordSchema } from "@/lib/security/validation";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, applyRateLimit, logAuditEvent } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);

  const rateLimitRes = await applyRateLimit("forgot-password", ctx.ipAddress);
  if (rateLimitRes) return rateLimitRes;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const { email: rawEmail, code, password } = parsed.data;
  const email = sanitizeEmail(rawEmail);

  const db = await getDb();

  const codeRecord = await db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.type, "password_reset"),
        eq(verificationCodes.code, code)
      )
    )
    .get();

  if (!codeRecord || codeRecord.usedAt || new Date() > codeRecord.expiresAt) {
    return errorResponse("INVALID_CODE", "Invalid or expired reset code", 400);
  }

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return errorResponse("INVALID_CODE", "Invalid or expired reset code", 400);
  }

  const passwordHash = await hashPassword(password);
  const now = new Date();

  await db.update(users)
    .set({ passwordHash, updatedAt: now })
    .where(eq(users.id, user.id));

  await db.update(verificationCodes)
    .set({ usedAt: now })
    .where(eq(verificationCodes.id, codeRecord.id));

  await logAuditEvent(user.id, "password_reset", ctx.ipAddress, ctx.userAgent);

  return successResponse({ message: "Password reset successfully" });
}
