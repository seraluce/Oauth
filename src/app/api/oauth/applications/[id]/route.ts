import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ssoApplications } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/handler";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const appId = parseInt(id, 10);

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const db = getDb();
  const app = db
    .select()
    .from(ssoApplications)
    .where(and(eq(ssoApplications.id, appId), eq(ssoApplications.ownerUserId, auth.userId)))
    .get();

  if (!app) {
    return errorResponse("NOT_FOUND", "Application not found", 404);
  }

  const updates: Record<string, any> = { updatedAt: new Date() };
  if (body.name) updates.name = body.name;
  if (body.description !== undefined) updates.description = body.description;
  if (body.redirectUris) updates.redirectUris = JSON.stringify(body.redirectUris);
  if (body.scopes) updates.scopes = body.scopes;
  if (body.isActive !== undefined) updates.isActive = body.isActive;

  db.update(ssoApplications)
    .set(updates)
    .where(eq(ssoApplications.id, appId))
    .run();

  return successResponse({ message: "Application updated" });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const appId = parseInt(id, 10);

  const db = getDb();
  const app = db
    .select()
    .from(ssoApplications)
    .where(and(eq(ssoApplications.id, appId), eq(ssoApplications.ownerUserId, auth.userId)))
    .get();

  if (!app) {
    return errorResponse("NOT_FOUND", "Application not found", 404);
  }

  db.delete(ssoApplications).where(eq(ssoApplications.id, appId)).run();
  return successResponse({ message: "Application deleted" });
}
