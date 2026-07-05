import { NextRequest } from "next/server";
import { getDb } from "@/lib/db";
import { users, sessions, auditLogs } from "@/lib/db/schema";
import { successResponse } from "@/lib/api/response";
import { requireAdmin } from "@/lib/api/handler";
import { sql } from "drizzle-orm";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof Response) return auth;

  const db = await getDb();

  const totalUsers = (await db.select().from(users).all()).length;
  const activeUsers = (await db
    .select()
    .from(users)
    .where(sql`${users.status} = 'active'`)
    .all()).length;
  const adminUsers = (await db
    .select()
    .from(users)
    .where(sql`${users.role} = 'admin'`)
    .all()).length;

  const recentUsers = await db
    .select({
      id: users.id,
      username: users.username,
      email: users.email,
      role: users.role,
      status: users.status,
      createdAt: users.createdAt,
    })
    .from(users)
    .orderBy(sql`${users.createdAt} DESC`)
    .limit(10)
    .all();

  const recentLogs = await db
    .select()
    .from(auditLogs)
    .orderBy(sql`${auditLogs.createdAt} DESC`)
    .limit(20)
    .all();

  return successResponse({
    totalUsers,
    activeUsers,
    adminUsers,
    recentUsers,
    recentActivity: recentLogs,
  });
}
