"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/elements";
import { useAuth } from "@/components/providers/auth-provider";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslation } from "@/lib/i18n";
import { Loader2, User } from "lucide-react";

export default function ProfileSettingsPage() {
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setUsername(user.username);
      setEmail(user.email);
      setAvatarUrl(user.avatarUrl || "");
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          displayName,
          username,
          email,
          avatarUrl: avatarUrl || "",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Update failed");
      await refreshUser();
      toast(t.settings.profileUpdated, "success");
    } catch (err: any) {
      toast(err.message || t.settings.failedToUpdate, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t.settings.profile}</h2>
        <p className="text-sm text-muted-foreground">{t.settings.manageProfile}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-muted">
              {avatarUrl ? (
                <img src={avatarUrl} alt="" className="h-12 w-12 rounded-full object-cover" />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div>
              <CardTitle>{user?.username}</CardTitle>
              <CardDescription>UID: {user?.id}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="avatarUrl" className="text-sm font-medium">
                {t.settings.avatarUrl}
              </label>
              <Input
                id="avatarUrl"
                type="url"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder={t.settings.avatarUrlPlaceholder}
              />
              <p className="text-xs text-muted-foreground">{t.settings.avatarUrlHint}</p>
            </div>
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium">
                {t.auth.username}
              </label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                minLength={3}
                maxLength={30}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                {t.auth.email}
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="displayName" className="text-sm font-medium">
                {t.settings.displayName}
              </label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder={t.settings.yourDisplayName}
                maxLength={50}
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.settings.saveChanges}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
