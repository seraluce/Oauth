import { NextRequest } from "next/server";
import { getUserSessions, destroySession } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, requireAuth } from "@/lib/api/handler";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const sessions: any[] = await getUserSessions(auth.userId);
  return successResponse(
    sessions.map((s) => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: s.id === auth.sessionId,
    }))
  );
}

export async function DELETE(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const sessionId = searchParams.get("id");

  if (!sessionId) {
    return errorResponse("VALIDATION_ERROR", "Session ID required", 400);
  }

  await destroySession(sessionId);
  return successResponse({ message: "Session revoked" });
}
