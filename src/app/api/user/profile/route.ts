import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, requireAuth } from "@/lib/api/handler";
import { updateProfileSchema } from "@/lib/security/validation";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const db = getDb();
  const user = db
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

  const db = getDb();
  db.update(users)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(users.id, auth.userId))
    .run();

  return successResponse({ message: "Profile updated" });
}
