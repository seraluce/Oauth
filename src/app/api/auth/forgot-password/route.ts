import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users, verificationCodes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { generateVerificationCode } from "@/lib/auth/id-generator";
import { forgotPasswordSchema } from "@/lib/security/validation";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, applyRateLimit, logAuditEvent } from "@/lib/api/handler";
import { sendPasswordResetEmail } from "@/lib/email";
import { VERIFICATION_CODE_EXPIRY } from "@/lib/utils/constants";

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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const email = sanitizeEmail(parsed.data.email);
  const db = getDb();

  const user = db.select().from(users).where(eq(users.email, email)).get();

  if (user) {
    const code = generateVerificationCode();
    const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

    db.insert(verificationCodes)
      .values({
        email,
        code,
        type: "password_reset",
        expiresAt,
        createdAt: new Date(),
      })
      .run();

    await sendPasswordResetEmail(email, code);
    await logAuditEvent(user.id, "forgot_password", ctx.ipAddress, ctx.userAgent);
  }

  return successResponse({
    message: "If an account exists with this email, a reset code has been sent.",
  });
}
