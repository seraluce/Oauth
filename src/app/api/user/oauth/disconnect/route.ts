import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { oauthAccounts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, requireAuth } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const { provider } = body;
  if (!provider) {
    return errorResponse("VALIDATION_ERROR", "Provider required", 400);
  }

  const db = getDb();
  const binding = db
    .select()
    .from(oauthAccounts)
    .where(
      and(
        eq(oauthAccounts.userId, auth.userId),
        eq(oauthAccounts.provider, provider)
      )
    )
    .get();

  if (!binding) {
    return errorResponse("NOT_FOUND", "OAuth binding not found", 404);
  }

  db.delete(oauthAccounts).where(eq(oauthAccounts.id, binding.id)).run();

  return successResponse({ message: "OAuth account disconnected" });
}
