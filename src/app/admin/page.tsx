"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/elements";
import { useTranslation } from "@/lib/i18n";
import { Users, UserCheck, Shield, Activity } from "lucide-react";
import { formatDateTime } from "@/lib/utils/helpers";

interface Stats {
  totalUsers: number;
  activeUsers: number;
  adminUsers: number;
  recentUsers: any[];
  recentActivity: any[];
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { t } = useTranslation();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data.data);
        }
      } catch {
        // ignore
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
      </div>
    );
  }

  if (!stats) {
    return <p className="text-muted-foreground">{t.admin.failedToLoad}</p>;
  }

  const statCards = [
    { label: t.admin.totalUsers, value: stats.totalUsers, icon: Users },
    { label: t.admin.activeUsers, value: stats.activeUsers, icon: UserCheck },
    { label: t.admin.admins, value: stats.adminUsers, icon: Shield },
    { label: t.admin.recentActivity, value: stats.recentActivity.length, icon: Activity },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.label}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{card.label}</p>
                  <p className="text-2xl font-bold">{card.value}</p>
                </div>
                <card.icon className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t.admin.recentUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{user.username}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">
                      {user.createdAt ? formatDateTime(user.createdAt) : "-"}
                    </p>
                    <span
                      className={`inline-block rounded px-1.5 py-0.5 text-xs ${
                        user.role === "admin"
                          ? "bg-foreground/10 text-foreground"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
              {stats.recentUsers.length === 0 && (
                <p className="text-sm text-muted-foreground">{t.admin.noUsers}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t.admin.recentActivity}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between border-b border-border pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{log.action}</p>
                    <p className="text-xs text-muted-foreground">
                      {t.admin.user}: {log.userId || "System"}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {log.createdAt ? formatDateTime(log.createdAt) : "-"}
                  </p>
                </div>
              ))}
              {stats.recentActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">{t.admin.noActivity}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
