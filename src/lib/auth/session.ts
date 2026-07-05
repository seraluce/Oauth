import { getDb } from "@/lib/db";
import { sessions, users } from "@/lib/db/schema";
import { eq, and, gt } from "drizzle-orm";
import { generateSessionId, generateToken } from "./id-generator";
import { signJwt, verifyJwt, type JwtPayload } from "./jwt";

const SESSION_DURATION = 60 * 60 * 24 * 30; // 30 days
const ACCESS_TOKEN_DURATION = 900; // 15 minutes

export async function createSession(
  userId: number,
  ipAddress: string | null,
  userAgent: string | null
): Promise<{ sessionId: string; token: string; accessToken: string }> {
  const db = getDb();
  const sessionId = generateSessionId();
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION * 1000);

  db.insert(sessions)
    .values({
      id: sessionId,
      userId,
      token,
      expiresAt,
      ipAddress,
      userAgent,
      createdAt: new Date(),
    })
    .run();

  const accessToken = await signJwt(
    {
      sub: String(userId),
      userId,
      role: "user",
      sessionId,
    },
    ACCESS_TOKEN_DURATION
  );

  return { sessionId, token, accessToken };
}

export async function validateSession(
  sessionId: string
): Promise<{ userId: number; role: string } | null> {
  const db = getDb();
  const session = db
    .select()
    .from(sessions)
    .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, new Date())))
    .get();

  if (!session) return null;

  const user = db
    .select({ role: users.role, status: users.status })
    .from(users)
    .where(eq(users.id, session.userId))
    .get();

  if (!user || user.status !== "active") return null;

  return { userId: session.userId, role: user.role };
}

export async function destroySession(sessionId: string): Promise<void> {
  const db = getDb();
  db.delete(sessions).where(eq(sessions.id, sessionId)).run();
}

export async function destroyUserSessions(userId: number): Promise<void> {
  const db = getDb();
  db.delete(sessions).where(eq(sessions.userId, userId)).run();
}

export async function getUserSessions(userId: number) {
  const db = getDb();
  return db
    .select()
    .from(sessions)
    .where(eq(sessions.userId, userId))
    .all();
}

export async function refreshAccessToken(
  sessionId: string,
  userId: number,
  role: string
): Promise<string> {
  return signJwt(
    { sub: String(userId), userId, role, sessionId },
    ACCESS_TOKEN_DURATION
  );
}
