import { NextRequest } from "next/server";
import { errorResponse } from "./response";
import { validateSession } from "@/lib/auth/session";
import { checkRateLimit } from "@/lib/auth/rate-limiter";
import { getDb } from "@/lib/db";
import { auditLogs } from "@/lib/db/schema";

export interface ApiContext {
  userId?: number;
  userRole?: string;
  sessionId?: string;
  ipAddress: string;
  userAgent: string;
}

type Handler = (
  req: NextRequest,
  ctx: ApiContext
) => Promise<Response>;

export function withApiHandler(handler: Handler): Handler {
  return async (req: NextRequest, ctx: ApiContext) => {
    try {
      return await handler(req, ctx);
    } catch (error) {
      console.error("[API Error]", error);
      return errorResponse("INTERNAL_ERROR", "An unexpected error occurred", 500);
    }
  };
}

export async function buildContext(req: NextRequest): Promise<ApiContext> {
  const forwarded = req.headers.get("x-forwarded-for");
  const ipAddress = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "";

  return { ipAddress, userAgent };
}

export async function requireAuth(
  req: NextRequest
): Promise<{ userId: number; role: string; sessionId: string } | Response> {
  const cookies = await req.cookies;
  const sessionId = cookies.get("session_id")?.value;

  if (!sessionId) {
    return errorResponse("UNAUTHORIZED", "Authentication required", 401);
  }

  const session = await validateSession(sessionId);
  if (!session) {
    return errorResponse("UNAUTHORIZED", "Invalid or expired session", 401);
  }

  return { ...session, sessionId };
}

export async function requireAdmin(
  req: NextRequest
): Promise<{ userId: number; role: string; sessionId: string } | Response> {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;
  if (auth.role !== "admin") {
    return errorResponse("FORBIDDEN", "Admin access required", 403);
  }
  return auth;
}

export async function applyRateLimit(
  category: string,
  identifier: string
): Promise<Response | null> {
  const result = await checkRateLimit(
    category as any,
    identifier
  );

  if (!result.allowed) {
    return errorResponse(
      "RATE_LIMITED",
      "Too many requests. Please try again later.",
      429
    );
  }
  return null;
}

export async function logAuditEvent(
  userId: number | null,
  action: string,
  ipAddress: string,
  userAgent: string,
  details?: Record<string, unknown>
): Promise<void> {
  const db = await getDb();
  await db.insert(auditLogs)
    .values({
      userId,
      action,
      ipAddress,
      userAgent,
      details: details ? JSON.stringify(details) : null,
      createdAt: new Date(),
    });
}
