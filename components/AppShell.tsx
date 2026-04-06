//components/AppShell.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Settings, LogOut, ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";
import DeauBitLogo from "./DeauBitLogo";

interface UserInfo {
  email: string;
  role: string;
}

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);

  const isAdminPage = pathname.startsWith("/admin");

  useEffect(() => {
    async function fetchSession() {
      try {
        const res = await fetch("/api/session");
        const data = await res.json();
        if (data.authenticated) {
          setUser(data.user);
        }
      } catch (err) {
        console.error("Session fetch error", err);
      }
    }
    fetchSession();
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const isAuthPage = [
    "/", "/login", "/register", "/verify", "/forgot-password", "/reset-password", "/account-deleted", "/setup"
  ].includes(pathname);

  if (isAuthPage) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-reveal">
          <div className="flex justify-center mb-8">
             <DeauBitLogo size={60} />
          </div>
          <div className="db-card p-8 shadow-xl">
            {children}
          </div>
          <footer className="mt-8 text-center">
            <p className="text-[10px] font-dot tracking-nothing opacity-40 uppercase">
              Powered by VorDeau &copy; {new Date().getFullYear()}
            </p>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation - Sleek & Integrated */}
      <nav className="sticky top-0 z-50 px-4 py-4 pointer-events-none">
        <div className="max-w-5xl mx-auto flex items-center justify-between glass-panel backdrop-blur-2xl rounded-full px-6 py-3 pointer-events-auto shadow-lg border-white/5">
          <div className="flex items-center gap-6">
            <Link href="/dash" className="hover:scale-110 transition-transform active:scale-95">
              <DeauBitLogo size={32} />
            </Link>
            
            <div className="h-6 w-[1px] bg-var(--db-border) opacity-20 hidden sm:block"></div>
            
            <div className="flex items-center gap-2">
              <Link href="/dash" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-dot tracking-widest transition-all ${pathname === "/dash" ? "bg-var(--db-text) text-var(--db-bg)" : "hover:bg-var(--db-surface-hover) text-var(--db-text-muted)"}`}>
                <LayoutDashboard className="h-3 w-3" /> DASH
              </Link>
              <Link href="/dash/settings" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-dot tracking-widest transition-all ${pathname === "/dash/settings" ? "bg-var(--db-text) text-var(--db-bg)" : "hover:bg-var(--db-surface-hover) text-var(--db-text-muted)"}`}>
                <Settings className="h-3 w-3" /> SETTINGS
              </Link>
              {user?.role === "ADMIN" && (
                <Link href="/admin" className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-dot tracking-widest transition-all ${isAdminPage ? "bg-var(--db-primary) text-white" : "text-var(--db-primary) hover:bg-var(--db-primary)/10"}`}>
                  <ShieldAlert className="h-3 w-3" /> ADMIN
                </Link>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <div className="hidden md:flex flex-col items-end leading-none">
                <span className="text-[9px] font-bold opacity-40 uppercase tracking-tighter mb-1">Authenticated</span>
                <span className="text-xs font-black tracking-tight">{user.email.split('@')[0]}</span>
              </div>
            )}
            <button 
              onClick={handleLogout}
              className="p-2.5 rounded-full bg-var(--db-surface) border border-var(--db-border) hover:bg-var(--db-primary) hover:text-white hover:border-var(--db-primary) transition-all active:scale-90 shadow-sm"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 md:p-8 animate-reveal">
        {children}
      </main>

      <footer className="p-8 border-t border-var(--db-border) mt-12 opacity-30">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <DeauBitLogo size={20} />
            <span className="text-[10px] font-dot tracking-nothing uppercase">DeauBit Utility v9.2</span>
          </div>
          <div className="text-[10px] font-dot tracking-nothing uppercase">
            Powered by VorDeau &copy; {new Date().getFullYear()}
          </div>
        </div>
      </footer>
    </div>
  );
}
