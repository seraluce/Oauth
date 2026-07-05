import { type ReactNode } from "react";
import { Shield } from "lucide-react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <span className="text-lg font-semibold">SSO Auth</span>
      </div>
      {children}
    </div>
  );
}
