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
import { useToast } from "@/components/providers/toast-provider";
import { useTranslation } from "@/lib/i18n";
import { Loader2, Settings, Copy, ExternalLink } from "lucide-react";

interface OAuthProviderState {
  enabled: boolean;
  clientId: string;
  clientSecret: string;
}

interface SystemSettings {
  siteName: string;
  siteUrl: string;
  allowRegistration: boolean;
  oauth: {
    github: OAuthProviderState;
    google: OAuthProviderState;
  };
}

const GITHUB_DEV_URL = "https://github.com/settings/developers";
const GOOGLE_CONSOLE_URL = "https://console.cloud.google.com/apis/credentials";

export default function AdminSettingsPage() {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "SSO Auth",
    siteUrl: "",
    allowRegistration: true,
    oauth: {
      github: { enabled: false, clientId: "", clientSecret: "" },
      google: { enabled: false, clientId: "", clientSecret: "" },
    },
  });

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setSettings(res.data);
      })
      .catch(() => {})
      .finally(() => setIsFetching(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });
      if (!res.ok) throw new Error("Failed");
      toast(t.admin.settingsSaved, "success");
    } catch {
      toast(t.admin.failedToSave, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const updateOAuth = (
    provider: "github" | "google",
    field: keyof OAuthProviderState,
    value: string | boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      oauth: {
        ...prev.oauth,
        [provider]: { ...prev.oauth[provider], [field]: value },
      },
    }));
  };

  const copyCallbackUrl = (provider: string) => {
    const url = `${settings.siteUrl || window.location.origin}/api/user/oauth/callback?provider=${provider}`;
    navigator.clipboard.writeText(url);
    toast(t.common.copied, "success");
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">{t.admin.systemSettings}</h2>
        <p className="text-sm text-muted-foreground">{t.admin.systemSettingsDesc}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-muted-foreground" />
              <div>
                <CardTitle>{t.admin.general}</CardTitle>
                <CardDescription>{t.admin.generalDesc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.admin.siteName}</label>
                <Input
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, siteName: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">{t.admin.siteUrl}</label>
                <Input
                  value={settings.siteUrl}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, siteUrl: e.target.value }))
                  }
                  placeholder="https://auth.example.com"
                  type="url"
                />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border p-4">
                <div>
                  <p className="text-sm font-medium">{t.admin.allowRegistration}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.admin.allowRegistrationDesc}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setSettings((p) => ({
                      ...p,
                      allowRegistration: !p.allowRegistration,
                    }))
                  }
                  className={`relative h-6 w-11 rounded-full transition-colors ${
                    settings.allowRegistration ? "bg-foreground" : "bg-muted"
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
                      settings.allowRegistration ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
              <div>
                <CardTitle>GitHub</CardTitle>
                <CardDescription>{t.admin.githubDesc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OAuthProviderForm
              provider="github"
              state={settings.oauth.github}
              onChange={updateOAuth}
              onCopyCallback={copyCallbackUrl}
              devUrl={GITHUB_DEV_URL}
              t={t}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <svg className="h-5 w-5 text-muted-foreground" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <div>
                <CardTitle>Google</CardTitle>
                <CardDescription>{t.admin.googleDesc}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <OAuthProviderForm
              provider="google"
              state={settings.oauth.google}
              onChange={updateOAuth}
              onCopyCallback={copyCallbackUrl}
              devUrl={GOOGLE_CONSOLE_URL}
              t={t}
            />
          </CardContent>
        </Card>

        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {t.admin.saveSettings}
        </Button>
      </form>
    </div>
  );
}

function OAuthProviderForm({
  provider,
  state,
  onChange,
  onCopyCallback,
  devUrl,
  t,
}: {
  provider: "github" | "google";
  state: OAuthProviderState;
  onChange: (provider: "github" | "google", field: keyof OAuthProviderState, value: string | boolean) => void;
  onCopyCallback: (provider: string) => void;
  devUrl: string;
  t: any;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-lg border border-border p-4">
        <div>
          <p className="text-sm font-medium">{t.admin.providerEnabled}</p>
        </div>
        <button
          type="button"
          onClick={() => onChange(provider, "enabled", !state.enabled)}
          className={`relative h-6 w-11 rounded-full transition-colors ${
            state.enabled ? "bg-foreground" : "bg-muted"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-background transition-transform ${
              state.enabled ? "translate-x-5" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {state.enabled && (
        <>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.admin.clientId}</label>
            <Input
              value={state.clientId}
              onChange={(e) => onChange(provider, "clientId", e.target.value)}
              placeholder={t.admin.clientIdPlaceholder}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.admin.clientSecret}</label>
            <Input
              value={state.clientSecret}
              onChange={(e) => onChange(provider, "clientSecret", e.target.value)}
              placeholder={t.admin.clientSecretPlaceholder}
              type="password"
            />
            <p className="text-xs text-muted-foreground">{t.admin.clientSecretHint}</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t.admin.callbackUrl}</label>
            <div className="flex gap-2">
              <Input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/api/user/oauth/callback?provider=${provider}`}
                className="font-mono text-xs"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCopyCallback(provider)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <a
            href={devUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            {t.admin.createOAuthApp}
          </a>
        </>
      )}
    </div>
  );
}
