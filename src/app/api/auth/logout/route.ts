import { NextRequest } from "next/server";
import { destroySession } from "@/lib/auth/session";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, requireAuth, logAuditEvent } from "@/lib/api/handler";
import { SESSION_COOKIE_NAME } from "@/lib/utils/constants";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  await destroySession(auth.sessionId);
  await logAuditEvent(auth.userId, "logout", ctx.ipAddress, ctx.userAgent);

  const response = successResponse({ message: "Logged out successfully" });
  response.headers.set(
    "Set-Cookie",
    `${SESSION_COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
  );

  return response;
}
