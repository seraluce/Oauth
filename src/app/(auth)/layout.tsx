"use client";

import { type ReactNode } from "react";
import { Shield } from "lucide-react";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useTranslation } from "@/lib/i18n";

export default function AuthLayout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="mb-8 flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <span className="text-lg font-semibold">{t.common.appName}</span>
      </div>
      {children}
    </div>
  );
}
