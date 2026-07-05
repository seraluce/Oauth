import { nanoid } from "nanoid";
import { getDb } from "@/lib/db";
import { idSequence } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export function generateSessionId(): string {
  return nanoid(32);
}

export function generateToken(): string {
  return nanoid(48);
}

export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function generateClientId(): string {
  return `sso_${nanoid(24)}`;
}

export function generateClientSecret(): string {
  return nanoid(48);
}

export async function getNextUserId(): Promise<number> {
  const db = getDb();
  const seq = db
    .select()
    .from(idSequence)
    .where(eq(idSequence.name, "user_id"))
    .get();

  if (!seq) {
    const now = new Date();
    db.insert(idSequence)
      .values({ name: "user_id", currentValue: 12000 })
      .run();
    return 12000;
  }

  const nextValue = seq.currentValue + 1;
  db.update(idSequence)
    .set({ currentValue: nextValue })
    .where(eq(idSequence.name, "user_id"))
    .run();

  return nextValue;
}
