"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils/cn";
import { useAuth } from "@/components/providers/auth-provider";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { useTranslation } from "@/lib/i18n";
import {
  Settings,
  Shield,
  Key,
  Link2,
  Palette,
  LogOut,
} from "lucide-react";

export function AppSidebar() {
  const pathname = usePathname();
  const { t } = useTranslation();

  const navItems = [
    { href: "/settings", label: t.settings.profile, icon: Settings },
    { href: "/settings/security", label: t.settings.security, icon: Shield },
    { href: "/settings/oauth", label: t.settings.connectedAccounts, icon: Link2 },
    { href: "/settings/preferences", label: t.settings.preferences, icon: Palette },
  ];

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-card">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/settings" className="flex items-center gap-2 font-semibold">
          <Key className="h-5 w-5" />
          {t.settings.title}
        </Link>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive =
            item.href === "/settings"
              ? pathname === "/settings"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-3">
        <Link
          href="/admin"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          <Shield className="h-4 w-4" />
          {t.settings.adminDashboard}
        </Link>
      </div>
    </aside>
  );
}

export function TopBar() {
  const { t } = useTranslation();
  return (
    <header className="flex h-14 items-center justify-between border-b border-border px-6">
      <h1 className="text-lg font-semibold">{t.settings.title}</h1>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}
