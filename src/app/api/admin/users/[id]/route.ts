import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users, auditLogs } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin, buildContext, logAuditEvent } from "@/lib/api/handler";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return errorResponse("VALIDATION_ERROR", "Invalid user ID", 400);
  }

  const db = getDb();
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) {
    return errorResponse("NOT_FOUND", "User not found", 404);
  }

  const logs = db
    .select()
    .from(auditLogs)
    .where(eq(auditLogs.userId, userId))
    .orderBy(sql`${auditLogs.createdAt} DESC`)
    .limit(50)
    .all();

  return successResponse({ user, logs });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const ctx = await buildContext(req);
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const userId = parseInt(id, 10);
  if (isNaN(userId)) {
    return errorResponse("VALIDATION_ERROR", "Invalid user ID", 400);
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const { role, status } = body;
  const db = getDb();

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (role && ["user", "admin"].includes(role)) updates.role = role;
  if (status && ["active", "suspended", "locked"].includes(status)) {
    updates.status = status;
  }

  db.update(users)
    .set(updates)
    .where(eq(users.id, userId))
    .run();

  await logAuditEvent(
    auth.userId,
    "admin_update_user",
    ctx.ipAddress,
    ctx.userAgent,
    { targetUserId: userId, changes: updates }
  );

  return successResponse({ message: "User updated" });
}
