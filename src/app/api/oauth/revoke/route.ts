import { NextRequest } from "next/server";
import { revokeToken } from "@/lib/sso/token-service";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const { token } = body;
  if (!token) {
    return errorResponse("INVALID_REQUEST", "Token required", 400);
  }

  await revokeToken(token);
  return successResponse({ message: "Token revoked" });
}
