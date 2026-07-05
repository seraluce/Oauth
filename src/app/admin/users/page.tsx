"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, Badge } from "@/components/ui/elements";
import { useTranslation } from "@/lib/i18n";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils/helpers";

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  status: string;
  displayName: string | null;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function AdminUsersPage() {
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const pageSize = 20;

  const fetchUsers = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
      });
      if (search) params.set("search", search);

      const res = await fetch(`/api/admin/users?${params}`);
      if (res.ok) {
        const data = await res.json();
        setUsers(data.data || []);
        setTotal(data.meta?.total || 0);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [page, search]);

  const totalPages = Math.ceil(total / pageSize);

  const handleStatusChange = async (userId: number, status: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      fetchUsers();
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">{t.admin.users}</h2>
          <p className="text-sm text-muted-foreground">
            {t.admin.manageUsers.replace("{total}", String(total))}
          </p>
        </div>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t.common.search}
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-foreground" />
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="pb-3 text-left font-medium text-muted-foreground">ID</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">{t.admin.user}</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">{t.admin.role}</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">{t.admin.status}</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">{t.admin.joined}</th>
                      <th className="pb-3 text-left font-medium text-muted-foreground">{t.admin.actions}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-b border-border last:border-0">
                        <td className="py-3 text-muted-foreground">{user.id}</td>
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{user.username}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </td>
                        <td className="py-3">
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user.id, e.target.value)}
                            className="rounded border border-border bg-transparent px-2 py-1 text-xs"
                          >
                            <option value="user">{t.admin.user}</option>
                            <option value="admin">{t.admin.admins}</option>
                          </select>
                        </td>
                        <td className="py-3">
                          <Badge
                            variant={
                              user.status === "active"
                                ? "default"
                                : user.status === "suspended"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {user.status === "active" ? t.admin.active : user.status === "suspended" ? t.admin.suspended : t.admin.locked}
                          </Badge>
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {user.createdAt ? formatDate(user.createdAt) : "-"}
                        </td>
                        <td className="py-3">
                          <select
                            value={user.status}
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            className="rounded border border-border bg-transparent px-2 py-1 text-xs"
                          >
                            <option value="active">{t.admin.active}</option>
                            <option value="suspended">{t.admin.suspended}</option>
                            <option value="locked">{t.admin.locked}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {t.admin.page.replace("{page}", String(page)).replace("{total}", String(totalPages))}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
