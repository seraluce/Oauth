import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { getCache } from "@/lib/redis";
import { getEnabledProviders } from "@/lib/oauth-providers";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAuth } from "@/lib/api/handler";

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
  const providers = await getEnabledProviders();

  if (!provider || !providers[provider]) {
    return errorResponse("VALIDATION_ERROR", "Invalid or unconfigured provider", 400);
  }

  const state = nanoid(32);
  const cache = getCache();
  await cache.set(`oauth_state:${state}`, String(auth.userId), 600);

  const authUrl = providers[provider].getAuthorizationUrl(state);
  return successResponse({ authUrl });
}
