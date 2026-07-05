"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
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
import { ArrowLeft, Loader2, CheckCircle } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { toast } = useToast();
  const { t } = useTranslation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error("Failed to send reset code");
      setSent(true);
    } catch {
      toast(t.auth.failedToSendReset, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <Card className="w-full max-w-sm">
        <CardContent className="pt-6 text-center">
          <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
          <h2 className="mt-4 text-lg font-semibold">{t.auth.checkEmail}</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {t.auth.ifAccountExists.replace("{email}", email).split(email).length > 1
              ? null
              : null}
            <span dangerouslySetInnerHTML={{
              __html: t.auth.ifAccountExists.replace("{email}", `<strong>${email}</strong>`)
            }} />
          </p>
          <div className="mt-6 space-y-3">
            <Link href={`/reset-password?email=${encodeURIComponent(email)}`}>
              <Button className="w-full">{t.auth.enterResetCode}</Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSent(false)}
              className="w-full"
            >
              <ArrowLeft className="h-4 w-4" />
              {t.auth.backToEmail}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">{t.auth.resetPassword}</CardTitle>
        <CardDescription>{t.auth.enterEmail}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              {t.auth.email}
            </label>
            <Input
              id="email"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {t.auth.sendResetCode}
          </Button>
        </form>
        <p className="mt-6 text-center">
          <Link
            href="/login"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="mr-1 inline h-3 w-3" />
            {t.auth.backToSignIn}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
