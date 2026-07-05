import { NextRequest } from "next/server";
import { errorResponse } from "@/lib/api/response";
import { buildContext, applyRateLimit } from "@/lib/api/handler";
import {
  validateClient,
  getApplicationByClientId,
} from "@/lib/sso/application-service";
import { consumeAuthorizationCode } from "@/lib/sso/authorization";
import { issueTokens, refreshAccessToken } from "@/lib/sso/token-service";

export async function POST(req: NextRequest) {
  const ctx = await buildContext(req);

  const rateLimitRes = await applyRateLimit("oauth-token", ctx.ipAddress);
  if (rateLimitRes) return rateLimitRes;

  const contentType = req.headers.get("content-type") || "";
  let body: Record<string, string>;

  if (contentType.includes("application/x-www-form-urlencoded")) {
    const formData = await req.formData();
    body = Object.fromEntries(formData.entries()) as Record<string, string>;
  } else {
    try {
      body = await req.json();
    } catch {
      return errorResponse("INVALID_JSON", "Invalid request body", 400);
    }
  }

  const { grant_type } = body;

  if (grant_type === "authorization_code") {
    const { code, redirect_uri, client_id, client_secret, code_verifier } = body;

    if (!code || !redirect_uri || !client_id || !client_secret) {
      return errorResponse("INVALID_REQUEST", "Missing required parameters", 400);
    }

    const app = await validateClient(client_id, client_secret);
    if (!app) {
      return errorResponse("INVALID_CLIENT", "Client authentication failed", 401);
    }

    const result = await consumeAuthorizationCode(
      code,
      app.id,
      redirect_uri,
      code_verifier
    );

    if (!result) {
      return errorResponse("INVALID_GRANT", "Invalid authorization code", 400);
    }

    const tokens = await issueTokens(result.userId, app.id, result.scope);

    return Response.json({
      access_token: tokens.accessToken,
      token_type: "Bearer",
      expires_in: tokens.expiresIn,
      refresh_token: tokens.refreshToken,
      scope: result.scope,
    });
  }

  if (grant_type === "refresh_token") {
    const { refresh_token, client_id, client_secret } = body;

    if (!refresh_token || !client_id || !client_secret) {
      return errorResponse("INVALID_REQUEST", "Missing required parameters", 400);
    }

    const app = await validateClient(client_id, client_secret);
    if (!app) {
      return errorResponse("INVALID_CLIENT", "Client authentication failed", 401);
    }

    const tokens = await refreshAccessToken(refresh_token, app.id);
    if (!tokens) {
      return errorResponse("INVALID_GRANT", "Invalid refresh token", 400);
    }

    return Response.json({
      access_token: tokens.accessToken,
      token_type: "Bearer",
      expires_in: tokens.expiresIn,
      refresh_token: tokens.refreshToken,
      scope: "openid profile email",
    });
  }

  return errorResponse(
    "UNSUPPORTED_GRANT_TYPE",
    "Unsupported grant type",
    400
  );
}
