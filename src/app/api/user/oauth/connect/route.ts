import { NextRequest } from "next/server";
import { nanoid } from "nanoid";
import { getCache } from "@/lib/redis";
import { githubProvider } from "@/lib/oauth-providers/github";
import { googleProvider } from "@/lib/oauth-providers/google";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, requireAuth } from "@/lib/api/handler";
import type { OAuthProvider } from "@/lib/oauth-providers/types";

const providers: Record<string, OAuthProvider> = {
  github: githubProvider,
  google: googleProvider,
};

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
  if (!provider || !providers[provider]) {
    return errorResponse("VALIDATION_ERROR", "Invalid provider", 400);
  }

  const state = nanoid(32);
  const cache = getCache();
  await cache.set(`oauth_state:${state}`, String(auth.userId), 600);

  const authUrl = providers[provider].getAuthorizationUrl(state);
  return successResponse({ authUrl });
}
