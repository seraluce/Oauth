import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users, verificationCodes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { generateVerificationCode } from "@/lib/auth/id-generator";
import { forgotPasswordSchema } from "@/lib/security/validation";
import { sanitizeEmail } from "@/lib/security/sanitize";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, applyRateLimit } from "@/lib/api/handler";
import { sendVerificationEmail } from "@/lib/email";
import { VERIFICATION_CODE_EXPIRY } from "@/lib/utils/constants";

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

  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const email = sanitizeEmail(parsed.data.email);
  const db = await getDb();

  const user = await db.select().from(users).where(eq(users.email, email)).get();
  if (!user || user.emailVerifiedAt) {
    return successResponse({
      message: "If an unverified account exists, a code has been sent.",
    });
  }

  const code = generateVerificationCode();
  const expiresAt = new Date(Date.now() + VERIFICATION_CODE_EXPIRY);

  await db.insert(verificationCodes)
    .values({
      email,
      code,
      type: "email_verification",
      expiresAt,
      createdAt: new Date(),
    });

  await sendVerificationEmail(email, code);

  return successResponse({
    message: "If an unverified account exists, a code has been sent.",
  });
}
