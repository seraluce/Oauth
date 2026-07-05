import { getDb } from "@/lib/db";
import { ssoApplications } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { generateClientId, generateClientSecret } from "@/lib/auth/id-generator";

export async function createApplication(
  name: string,
  ownerUserId: number,
  redirectUris: string[],
  description?: string,
  scopes?: string
): Promise<{ application: any; clientSecret: string }> {
  const db = getDb();
  const clientId = generateClientId();
  const clientSecret = generateClientSecret();
  const clientSecretHash = await hashPassword(clientSecret);
  const now = new Date();

  const result = db
    .insert(ssoApplications)
    .values({
      name,
      description: description || null,
      clientId,
      clientSecretHash,
      ownerUserId,
      redirectUris: JSON.stringify(redirectUris),
      scopes: scopes || "openid profile email",
      isActive: true,
      createdAt: now,
      updatedAt: now,
    })
    .returning()
    .get();

  return { application: result, clientSecret };
}

export async function validateClient(
  clientId: string,
  clientSecret: string
): Promise<any | null> {
  const db = getDb();
  const app = db
    .select()
    .from(ssoApplications)
    .where(eq(ssoApplications.clientId, clientId))
    .get();

  if (!app || !app.isActive) return null;

  const valid = await verifyPassword(clientSecret, app.clientSecretHash);
  if (!valid) return null;

  return app;
}

export async function getApplicationByClientId(
  clientId: string
): Promise<any | null> {
  const db = getDb();
  return db
    .select()
    .from(ssoApplications)
    .where(eq(ssoApplications.clientId, clientId))
    .get();
}

export async function getApplicationById(id: number): Promise<any | null> {
  const db = getDb();
  return db
    .select()
    .from(ssoApplications)
    .where(eq(ssoApplications.id, id))
    .get();
}

export async function getUserApplications(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(ssoApplications)
    .where(eq(ssoApplications.ownerUserId, userId))
    .all();
}

export async function validateRedirectUri(
  application: any,
  redirectUri: string
): Promise<boolean> {
  const uris: string[] = JSON.parse(application.redirectUris);
  return uris.includes(redirectUri);
}
