import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { changePasswordSchema } from "@/lib/security/validation";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, requireAuth, logAuditEvent } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const db = await getDb();
  const user = await db.select().from(users).where(eq(users.id, auth.userId)).get();

  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", 404);
  }

  const valid = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!valid) {
    return errorResponse("INVALID_PASSWORD", "Current password is incorrect", 400);
  }

  const newPasswordHash = await hashPassword(parsed.data.newPassword);
  await db.update(users)
    .set({ passwordHash: newPasswordHash, updatedAt: new Date() })
    .where(eq(users.id, auth.userId));

  await logAuditEvent(auth.userId, "password_change", ctx.ipAddress, ctx.userAgent);

  return successResponse({ message: "Password changed successfully" });
}
