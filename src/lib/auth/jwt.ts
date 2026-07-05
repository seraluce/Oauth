import { SignJWT, jwtVerify, importJWK, type JWK } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "default-secret-change-me-in-production-please";

let _key: CryptoKey | null = null;

async function getKey(): Promise<CryptoKey> {
  if (_key) return _key;
  const encoder = new TextEncoder();
  const keyData = encoder.encode(JWT_SECRET);
  _key = await crypto.subtle.importKey(
    "raw",
    keyData,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  return _key;
}

export interface JwtPayload {
  sub: string;
  userId: number;
  role: string;
  sessionId: string;
}

export async function signJwt(
  payload: JwtPayload,
  expiresInSeconds: number = 900
): Promise<string> {
  const key = await getKey();
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(key);
}

export async function verifyJwt(token: string): Promise<JwtPayload | null> {
  try {
    const key = await getKey();
    const { payload } = await jwtVerify(token, key);
    return payload as unknown as JwtPayload;
  } catch {
    return null;
  }
}

export async function signSsoJwt(
  payload: Record<string, any>,
  privateKeyPem: string,
  kid: string,
  expiresInSeconds: number = 900
): Promise<string> {
  const key = await importJWK(JSON.parse(privateKeyPem) as JWK, "RS256");
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "RS256", kid })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(key as CryptoKey);
}
