import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { userSettings } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { successResponse, errorResponse } from "@/lib/api/response";
import { buildContext, requireAuth } from "@/lib/api/handler";
import { updateUserSettingsSchema } from "@/lib/security/validation";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const db = getDb();
  const settings = db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, auth.userId))
    .get();

  return successResponse(settings || {
    userId: auth.userId,
    theme: "system",
    locale: "en",
    twoFactorEnabled: false,
    emailNotifications: true,
  });
}

export async function PATCH(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  let body;
  try {
    body = await req.json();
  } catch {
    return errorResponse("INVALID_JSON", "Invalid request body", 400);
  }

  const parsed = updateUserSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const db = getDb();
  const existing = db
    .select()
    .from(userSettings)
    .where(eq(userSettings.userId, auth.userId))
    .get();

  if (existing) {
    db.update(userSettings)
      .set({ ...parsed.data, updatedAt: new Date() })
      .where(eq(userSettings.userId, auth.userId))
      .run();
  } else {
    db.insert(userSettings)
      .values({
        userId: auth.userId,
        theme: parsed.data.theme || "system",
        locale: parsed.data.locale || "en",
        twoFactorEnabled: false,
        emailNotifications: parsed.data.emailNotifications ?? true,
        updatedAt: new Date(),
      })
      .run();
  }

  return successResponse({ message: "Settings updated" });
}
