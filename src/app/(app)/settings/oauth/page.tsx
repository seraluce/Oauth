"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Badge,
} from "@/components/ui/elements";
import { useToast } from "@/components/providers/toast-provider";
import { Loader2, Link2, Unlink } from "lucide-react";

interface OAuthBinding {
  id: number;
  provider: string;
  providerAccountId: string;
  createdAt: string;
}

export default function OAuthSettingsPage() {
  const { toast } = useToast();
  const [bindings, setBindings] = useState<OAuthBinding[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [connecting, setConnecting] = useState<string | null>(null);

  const fetchBindings = async () => {
    try {
      const res = await fetch("/api/user/oauth");
      if (res.ok) {
        const data = await res.json();
        setBindings(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBindings();
  }, []);

  const handleConnect = async (provider: string) => {
    setConnecting(provider);
    try {
      const res = await fetch("/api/user/oauth/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!res.ok) throw new Error("Failed to connect");
      const data = await res.json();
      window.location.href = data.data.authUrl;
    } catch {
      toast("Failed to initiate connection", "error");
      setConnecting(null);
    }
  };

  const handleDisconnect = async (provider: string) => {
    try {
      const res = await fetch("/api/user/oauth/disconnect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ provider }),
      });

      if (!res.ok) throw new Error("Failed to disconnect");
      toast("Account disconnected", "success");
      fetchBindings();
    } catch {
      toast("Failed to disconnect", "error");
    }
  };

  const providers = [
    {
      name: "github",
      label: "GitHub",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
      ),
    },
    {
      name: "google",
      label: "Google",
      icon: (
        <svg className="h-5 w-5" viewBox="0 0 24 24">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
        </svg>
      ),
    },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Connected Accounts</h2>
        <p className="text-sm text-muted-foreground">
          Link your account with third-party providers for easier sign-in
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Link2 className="h-5 w-5 text-muted-foreground" />
            <div>
              <CardTitle>OAuth Providers</CardTitle>
              <CardDescription>
                Connect or disconnect your external accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {providers.map((provider) => {
            const binding = bindings.find((b) => b.provider === provider.name);
            return (
              <div
                key={provider.name}
                className="flex items-center justify-between rounded-lg border border-border p-4"
              >
                <div className="flex items-center gap-3">
                  {provider.icon}
                  <div>
                    <p className="text-sm font-medium">{provider.label}</p>
                    {binding ? (
                      <Badge variant="secondary" className="mt-1">
                        Connected
                      </Badge>
                    ) : (
                      <p className="text-xs text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                {binding ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(provider.name)}
                  >
                    <Unlink className="h-4 w-4" />
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleConnect(provider.name)}
                    disabled={connecting === provider.name}
                  >
                    {connecting === provider.name && (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    )}
                    Connect
                  </Button>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
