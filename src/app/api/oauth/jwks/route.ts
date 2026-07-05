import { successResponse } from "@/lib/api/response";

export async function GET() {
  const publicKey = process.env.SSO_PUBLIC_KEY;

  if (!publicKey) {
    return successResponse({ keys: [] });
  }

  try {
    const keyData = JSON.parse(publicKey);
    return Response.json({
      keys: [
        {
          ...keyData,
          use: "sig",
          alg: "RS256",
          kid: keyData.kid || "default",
        },
      ],
    });
  } catch {
    return successResponse({ keys: [] });
  }
}
