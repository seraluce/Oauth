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
import { Loader2, Settings } from "lucide-react";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [siteName, setSiteName] = useState("SSO Auth");
  const [siteUrl, setSiteUrl] = useState("");
  const [allowRegistration, setAllowRegistration] = useState(true);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ siteName, siteUrl, allowRegistration }),
      });

      if (!res.ok) throw new Error("Failed");
      toast("Settings saved", "success");
    } catch {
      toast("Failed to save settings", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">System Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure your SSO system
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>General</CardTitle>
              <CardDescription>
                Basic system configuration
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Site Name</label>
              <Input
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Site URL</label>
              <Input
                value={siteUrl}
                onChange={(e) => setSiteUrl(e.target.value)}
                placeholder="https://auth.example.com"
                type="url"
              />
            </div>
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <p className="text-sm font-medium">Allow Registration</p>
                <p className="text-xs text-muted-foreground">
                  Allow new users to register accounts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAllowRegistration(!allowRegistration)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  allowRegistration ? "bg-foreground" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                    allowRegistration ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Settings
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
