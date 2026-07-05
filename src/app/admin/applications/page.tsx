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
import { Plus, Copy, AppWindow, Loader2 } from "lucide-react";

interface Application {
  id: number;
  name: string;
  description: string | null;
  clientId: string;
  redirectUris: string;
  scopes: string;
  isActive: boolean;
  createdAt: string;
}

export default function AdminApplicationsPage() {
  const { toast } = useToast();
  const [apps, setApps] = useState<Application[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRedirectUri, setNewRedirectUri] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const fetchApps = async () => {
    try {
      const res = await fetch("/api/oauth/applications");
      if (res.ok) {
        const data = await res.json();
        setApps(data.data || []);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch("/api/oauth/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          redirectUris: [newRedirectUri],
        }),
      });

      if (!res.ok) throw new Error("Failed to create");
      const data = await res.json();
      toast(`Application created. Client Secret: ${data.data.clientSecret}`, "success");
      setShowCreate(false);
      setNewName("");
      setNewRedirectUri("");
      fetchApps();
    } catch {
      toast("Failed to create application", "error");
    } finally {
      setIsCreating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast("Copied to clipboard", "success");
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">SSO Applications</h2>
          <p className="text-sm text-muted-foreground">
            Manage OAuth2 applications that can authenticate through your SSO
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)}>
          <Plus className="h-4 w-4" />
          New Application
        </Button>
      </div>

      {showCreate && (
        <Card>
          <CardHeader>
            <CardTitle>Create Application</CardTitle>
            <CardDescription>
              Register a new OAuth2 application
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Application Name</label>
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="My Application"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Redirect URI</label>
                <Input
                  value={newRedirectUri}
                  onChange={(e) => setNewRedirectUri(e.target.value)}
                  placeholder="https://myapp.com/callback"
                  required
                  type="url"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isCreating}>
                  {isCreating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {apps.map((app) => (
          <Card key={app.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <AppWindow className="mt-0.5 h-5 w-5 text-muted-foreground" />
                  <div>
                    <h3 className="font-semibold">{app.name}</h3>
                    {app.description && (
                      <p className="text-sm text-muted-foreground">
                        {app.description}
                      </p>
                    )}
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          Client ID:
                        </span>
                        <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                          {app.clientId}
                        </code>
                        <button
                          onClick={() => copyToClipboard(app.clientId)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <Copy className="h-3 w-3" />
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Scopes: {app.scopes}
                      </p>
                    </div>
                  </div>
                </div>
                <span
                  className={`rounded px-2 py-0.5 text-xs ${
                    app.isActive
                      ? "bg-green-500/10 text-green-600"
                      : "bg-red-500/10 text-red-600"
                  }`}
                >
                  {app.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
        {apps.length === 0 && !isLoading && (
          <Card>
            <CardContent className="pt-6 text-center">
              <AppWindow className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-4 text-sm text-muted-foreground">
                No applications registered yet
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
