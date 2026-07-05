import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

const MAX_ATTEMPTS = parseInt(process.env.LOCKOUT_MAX_ATTEMPTS || "5", 10);
const LOCKOUT_DURATION =
  parseInt(process.env.LOCKOUT_DURATION_MINUTES || "15", 10) * 60 * 1000;

export async function recordFailedLogin(userId: number): Promise<void> {
  const db = getDb();
  const user = db.select().from(users).where(eq(users.id, userId)).get();
  if (!user) return;

  const attempts = user.failedLoginAttempts + 1;
  const lockedUntil =
    attempts >= MAX_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION) : null;

  db.update(users)
    .set({
      failedLoginAttempts: attempts,
      lockedUntil,
      status: lockedUntil ? "locked" : user.status,
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .run();
}

export async function resetFailedLogin(userId: number): Promise<void> {
  const db = getDb();
  db.update(users)
    .set({
      failedLoginAttempts: 0,
      lockedUntil: null,
      status: "active",
      updatedAt: new Date(),
    })
    .where(eq(users.id, userId))
    .run();
}

export async function isAccountLocked(userId: number): Promise<boolean> {
  const db = getDb();
  const user = db
    .select({ lockedUntil: users.lockedUntil })
    .from(users)
    .where(eq(users.id, userId))
    .get();

  if (!user || !user.lockedUntil) return false;
  if (new Date() > user.lockedUntil) {
    await resetFailedLogin(userId);
    return false;
  }
  return true;
}

export { MAX_ATTEMPTS, LOCKOUT_DURATION };
