"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/elements";
import { useToast } from "@/components/providers/toast-provider";
import { useTranslation } from "@/lib/i18n";
import { Loader2, Shield, Key } from "lucide-react";

export default function SecuritySettingsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Failed");

      toast(t.settings.passwordChanged, "success");
      setCurrentPassword("");
      setNewPassword("");
    } catch (err: any) {
      toast(err.message || t.settings.failedToChange, "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t.settings.security}</h2>
        <p className="text-sm text-muted-foreground">{t.settings.manageSecurity}</p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Key className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{t.settings.changePassword}</CardTitle>
              <CardDescription>{t.settings.updatePasswordDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="current-password" className="text-sm font-medium">
                {t.settings.currentPassword}
              </label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t.settings.enterCurrentPassword}
                required
                autoComplete="current-password"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="new-password" className="text-sm font-medium">
                {t.settings.newPassword}
              </label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t.auth.minChars}
                required
                minLength={8}
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {t.settings.updatePassword}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>{t.settings.twoFactor}</CardTitle>
              <CardDescription>{t.settings.twoFactorDesc}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <p className="text-sm font-medium">{t.settings.authenticatorApp}</p>
              <p className="text-xs text-muted-foreground">{t.settings.authenticatorDesc}</p>
            </div>
            <Button variant="outline" size="sm" disabled>
              {t.settings.comingSoon}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
