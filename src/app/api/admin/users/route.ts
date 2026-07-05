import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq, sql, like, or } from "drizzle-orm";
import { successResponse, errorResponse, paginatedResponse } from "@/lib/api/response";
import { requireAdmin, buildContext } from "@/lib/api/handler";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "20", 10);
  const search = searchParams.get("search") || "";

  const db = await getDb();
  const offset = (page - 1) * pageSize;

  let query = db.select().from(users);
  let allUsers: any[];

  if (search) {
    allUsers = await db
      .select()
      .from(users)
      .where(
        or(
          like(users.username, `%${search}%`),
          like(users.email, `%${search}%`)
        )
      )
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(pageSize)
      .offset(offset)
      .all();
  } else {
    allUsers = await db
      .select()
      .from(users)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(pageSize)
      .offset(offset)
      .all();
  }

  const total = (await db.select().from(users).all()).length;

  return paginatedResponse(
    allUsers.map((u) => ({
      id: u.id,
      username: u.username,
      email: u.email,
      role: u.role,
      status: u.status,
      displayName: u.displayName,
      emailVerifiedAt: u.emailVerifiedAt,
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
    })),
    total,
    page,
    pageSize
  );
}
