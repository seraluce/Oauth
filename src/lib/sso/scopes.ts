import { SSO_SCOPES } from "@/lib/utils/constants";

export function validateScopes(requested: string): string[] {
  const scopes = requested.split(" ").filter(Boolean);
  const valid = scopes.filter((s) =>
    (SSO_SCOPES as readonly string[]).includes(s)
  );
  return valid.length > 0 ? valid : ["openid"];
}

export function scopesInclude(scopes: string[], scope: string): boolean {
  return scopes.includes(scope);
}
