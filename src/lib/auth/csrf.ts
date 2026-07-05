import { nanoid } from "nanoid";
import { getCache } from "@/lib/redis";

const CSRF_COOKIE = "csrf_token";
const CSRF_HEADER = "x-csrf-token";

export function generateCsrfToken(): string {
  return nanoid(32);
}

export function getCsrfCookieName(): string {
  return CSRF_COOKIE;
}

export function getCsrfHeaderName(): string {
  return CSRF_HEADER;
}

export async function validateCsrfToken(
  cookieToken: string | undefined,
  headerToken: string | undefined
): Promise<boolean> {
  if (!cookieToken || !headerToken) return false;
  if (cookieToken.length !== headerToken.length) return false;

  let result = 0;
  for (let i = 0; i < cookieToken.length; i++) {
    result |= cookieToken.charCodeAt(i) ^ headerToken.charCodeAt(i);
  }
  return result === 0;
}
