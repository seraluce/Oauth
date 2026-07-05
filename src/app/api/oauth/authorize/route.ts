import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { ssoApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { errorResponse, successResponse } from "@/lib/api/response";
import { requireAuth, buildContext } from "@/lib/api/handler";
import {
  getApplicationByClientId,
  validateRedirectUri,
} from "@/lib/sso/application-service";
import { createAuthorizationCode } from "@/lib/sso/authorization";
import { validateScopes } from "@/lib/sso/scopes";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get("client_id");
  const redirectUri = searchParams.get("redirect_uri");
  const responseType = searchParams.get("response_type");
  const scope = searchParams.get("scope") || "openid";
  const state = searchParams.get("state");
  const codeChallenge = searchParams.get("code_challenge");
  const codeChallengeMethod = searchParams.get("code_challenge_method");

  if (!clientId || !redirectUri || responseType !== "code") {
    return errorResponse(
      "INVALID_REQUEST",
      "Missing or invalid parameters",
      400
    );
  }

  const app = await getApplicationByClientId(clientId);
  if (!app || !app.isActive) {
    return errorResponse("INVALID_CLIENT", "Unknown client", 400);
  }

  const validRedirect = await validateRedirectUri(app, redirectUri);
  if (!validRedirect) {
    return errorResponse("INVALID_REDIRECT", "Invalid redirect_uri", 400);
  }

  return successResponse({
    application: {
      name: app.name,
      description: app.description,
      clientId: app.clientId,
    },
    scope,
    state,
    redirectUri,
    codeChallenge,
    codeChallengeMethod,
  });
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const {
    clientId,
    redirectUri,
    scope,
    state,
    codeChallenge,
    codeChallengeMethod,
    approve,
  } = body;

  if (!clientId || !redirectUri) {
    return errorResponse("INVALID_REQUEST", "Missing parameters", 400);
  }

  const app = await getApplicationByClientId(clientId);
  if (!app || !app.isActive) {
    return errorResponse("INVALID_CLIENT", "Unknown client", 400);
  }

  const validRedirect = await validateRedirectUri(app, redirectUri);
  if (!validRedirect) {
    return errorResponse("INVALID_REDIRECT", "Invalid redirect_uri", 400);
  }

  if (!approve) {
    const url = new URL(redirectUri);
    url.searchParams.set("error", "access_denied");
    if (state) url.searchParams.set("state", state);
    return successResponse({ redirect: url.toString() });
  }

  const validScopes = validateScopes(scope || "openid");
  const code = await createAuthorizationCode(
    app.id,
    auth.userId,
    redirectUri,
    validScopes.join(" "),
    codeChallenge,
    codeChallengeMethod
  );

  const url = new URL(redirectUri);
  url.searchParams.set("code", code);
  if (state) url.searchParams.set("state", state);

  return successResponse({ redirect: url.toString() });
}
