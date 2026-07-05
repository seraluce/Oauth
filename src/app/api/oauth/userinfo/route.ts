import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { verifyJwt } from "@/lib/auth/jwt";
import { errorResponse } from "@/lib/api/response";

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return errorResponse("UNAUTHORIZED", "Bearer token required", 401);
  }

  const token = authHeader.slice(7);
  const payload = await verifyJwt(token);

  if (!payload) {
    return errorResponse("INVALID_TOKEN", "Invalid or expired token", 401);
  }

  const db = getDb();
  const user = db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      emailVerifiedAt: users.emailVerifiedAt,
      displayName: users.displayName,
      avatarUrl: users.avatarUrl,
    })
    .from(users)
    .where(eq(users.id, payload.userId))
    .get();

  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", 404);
  }

  return Response.json({
    sub: String(user.id),
    username: user.username,
    email: user.email,
    email_verified: !!user.emailVerifiedAt,
    name: user.displayName || undefined,
    picture: user.avatarUrl || undefined,
  });
}
