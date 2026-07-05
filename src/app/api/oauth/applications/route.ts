import { NextRequest } from "next/server";
import { successResponse, errorResponse } from "@/lib/api/response";
import { requireAuth, buildContext } from "@/lib/api/handler";
import {
  createApplication,
  getUserApplications,
} from "@/lib/sso/application-service";
import { createSsoApplicationSchema } from "@/lib/security/validation";

export async function GET(req: NextRequest) {
  const auth = await requireAuth(req);
  if (auth instanceof Response) return auth;

  const apps = await getUserApplications(auth.userId);
  return successResponse(
    apps.map((app) => ({
      id: app.id,
      name: app.name,
      description: app.description,
      clientId: app.clientId,
      redirectUris: JSON.parse(app.redirectUris),
      scopes: app.scopes,
      isActive: app.isActive,
      createdAt: app.createdAt,
    }))
  );
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

  const parsed = createSsoApplicationSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse("VALIDATION_ERROR", "Invalid input", 400, parsed.error.issues);
  }

  const { name, description, redirectUris, scopes } = parsed.data;
  const result = await createApplication(
    name,
    auth.userId,
    redirectUris,
    description,
    scopes
  );

  return successResponse(
    {
      application: {
        id: result.application.id,
        name: result.application.name,
        clientId: result.application.clientId,
        redirectUris: JSON.parse(result.application.redirectUris),
        scopes: result.application.scopes,
      },
      clientSecret: result.clientSecret,
    },
    201
  );
}
