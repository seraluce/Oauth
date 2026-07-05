import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users, verificationCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyEmailSchema } from "@/lib/security/validation";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, applyRateLimit, logAuditEvent } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);

  const rateLimitRes = await applyRateLimit("verification-code", ctx.ipAddress);
  if (rateLimitRes) return rateLimitRes;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const parsed = verifyEmailSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const { email: rawEmail, code } = parsed.data;
  const email = sanitizeEmail(rawEmail);

  const db = getDb();

  const codeRecord = db
    .select()
    .from(verificationCodes)
    .where(
      and(
        eq(verificationCodes.email, email),
        eq(verificationCodes.type, "email_verification"),
        eq(verificationCodes.code, code)
      )
    )
    .get();

  if (!codeRecord || codeRecord.usedAt || new Date() > codeRecord.expiresAt) {
    return errorResponse("INVALID_CODE", "Invalid or expired verification code", 400);
  }

  const user = db.select().from(users).where(eq(users.email, email)).get();
  if (!user) {
    return errorResponse("INVALID_CODE", "Invalid or expired verification code", 400);
  }

  const now = new Date();

  db.update(users)
    .set({ emailVerifiedAt: now, updatedAt: now })
    .where(eq(users.id, user.id))
    .run();

  db.update(verificationCodes)
    .set({ usedAt: now })
    .where(eq(verificationCodes.id, codeRecord.id))
    .run();

  await logAuditEvent(user.id, "email_verified", ctx.ipAddress, ctx.userAgent);

  return successResponse({ message: "Email verified successfully" });
}
