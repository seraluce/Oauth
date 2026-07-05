"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/elements";
import { useToast } from "@/components/providers/toast-provider";
import { useTheme } from "next-themes";
import { Loader2, Palette } from "lucide-react";

export default function PreferencesSettingsPage() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const [locale, setLocale] = useState("en");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/user/settings");
        if (res.ok) {
          const data = await res.json();
          if (data.data) {
            setLocale(data.data.locale || "en");
            setEmailNotifications(data.data.emailNotifications ?? true);
          }
        }
      } catch {
        // ignore
      }
    };
    fetchSettings();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/user/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ locale, emailNotifications }),
      });

      if (!res.ok) throw new Error("Failed");
      toast("Preferences updated", "success");
    } catch {
      toast("Failed to update preferences", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Preferences</h2>
        <p className="text-sm text-muted-foreground">
          Customize your experience
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Choose your preferred theme
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-3">
            {(["light", "dark", "system"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTheme(t)}
                className={`rounded-lg border p-4 text-center text-sm font-medium transition-colors ${
                  (mounted ? theme === t : t === "system")
                    ? "border-foreground bg-accent"
                    : "border-border hover:bg-accent"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>
            Configure how you receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Receive email notifications for important account activity
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  emailNotifications ? "bg-foreground" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                    emailNotifications ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            <div className="space-y-2">
              <label htmlFor="locale" className="text-sm font-medium">
                Language
              </label>
              <select
                id="locale"
                value={locale}
                onChange={(e) => setLocale(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="en">English</option>
                <option value="zh">Chinese</option>
                <option value="ja">Japanese</option>
              </select>
            </div>

            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save preferences
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
