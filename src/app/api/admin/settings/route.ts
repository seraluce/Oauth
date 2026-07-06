import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAdmin, buildContext, logAuditEvent } from "@/lib/api/handler";
import { getSystemConfig, setSystemConfig } from "@/lib/settings";
import { updateSystemSettingsSchema } from "@/lib/security/validation";

export async function GET(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  try {
    const config = await getSystemConfig();
    return successResponse({
      ...config,
      oauth: {
        github: {
          ...config.oauth.github,
          clientSecret: config.oauth.github.clientSecret
            ? "••••••••" + config.oauth.github.clientSecret.slice(-4)
            : "",
        },
        google: {
          ...config.oauth.google,
          clientSecret: config.oauth.google.clientSecret
            ? "••••••••" + config.oauth.google.clientSecret.slice(-4)
            : "",
        },
      },
    });
  } catch (error) {
    console.error("[Settings] Failed to load config:", error);
    return errorResponse("INTERNAL_ERROR", "Failed to load settings", 500);
  }
}

export async function PATCH(req: NextRequest) {
  const admin = await requireAdmin(req);
  if (admin instanceof Response) return admin;

  const ctx = await buildContext(req);

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const parsed = updateSystemSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const current = await getSystemConfig();
  const newData = parsed.data;

  for (const provider of ["github", "google"] as const) {
    const incoming = newData.oauth[provider];
    const existing = current.oauth[provider];
    if (incoming.clientSecret.startsWith("••••••••")) {
      newData.oauth[provider].clientSecret = existing.clientSecret;
    }
  }

  await setSystemConfig(newData);

  await logAuditEvent(admin.userId, "admin.update_settings", ctx.ipAddress, ctx.userAgent, {
    siteName: newData.siteName,
    siteUrl: newData.siteUrl,
    allowRegistration: newData.allowRegistration,
  });

  return successResponse({ message: "Settings updated" });
}
