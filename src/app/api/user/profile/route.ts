import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, and, ne } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, requireAuth } from "@/lib/api/handler";
import { updateProfileSchema } from "@/lib/security/validation";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const db = await getDb();
  const user = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
      role: users.role,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
      lastLoginAt: users.lastLoginAt,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, auth.userId))
    .get();

  return successResponse(user);
}

export async function PATCH(req: NextRequest) {
  const ctx = await buildContext(req);
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const db = await getDb();
  const data = { ...parsed.data };

  if (data.username) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.username, data.username), ne(users.id, auth.userId)))
      .get();
    if (existing) {
      return errorResponse("VALIDATION_ERROR", "Username already taken", 400);
    }
  }

  if (data.email) {
    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.email, data.email), ne(users.id, auth.userId)))
      .get();
    if (existing) {
      return errorResponse("VALIDATION_ERROR", "Email already in use", 400);
    }
  }

  const updateData: any = { updatedAt: new Date() };
  if (data.username !== undefined) updateData.username = data.username;
  if (data.email !== undefined) {
    updateData.email = data.email;
    updateData.emailVerifiedAt = null;
  }
  if (data.displayName !== undefined) updateData.displayName = data.displayName || null;
  if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl || null;

  await db.update(users)
    .set(updateData)
    .where(eq(users.id, auth.userId));

  return successResponse({ message: "Profile updated" });
}
