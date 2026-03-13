//components/AppShell.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Settings, LogOut, ShieldAlert, Loader2 } from "lucide-react";
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
  const [loading, setLoading] = useState(true);

  const isLogin = pathname === "/";
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
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const maxWidth = isLogin 
    ? "max-w-4xl" 
    : "w-full md:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl";

  const isAuthPage = [
    "/", "/login", "/register", "/verify", "/forgot-password", "/reset-password", "/account-deleted", "/setup"
  ].includes(pathname);

  if (isAuthPage) {
    return (
      <div className={`${maxWidth} mx-auto p-4 sm:p-6 xl:p-8 bg-(--db-surface) border-2 md:border-4 border-(--db-border) shadow-[6px_6px_0px_0px_var(--db-border)] md:shadow-[12px_12px_0px_0px_var(--db-border)] transition-all duration-300 mb-24`}>
        {children}
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <header className={`
        ${maxWidth} w-full mb-6 p-4
        bg-(--db-surface) border-4 border-(--db-border)
        shadow-[8px_8px_0px_0px_var(--db-border)]
        flex flex-col sm:flex-row items-center justify-between gap-4
        sticky top-4 z-40
      `}>
        <div className="flex items-center gap-4">
          <Link href="/dash" className="bg-(--db-text) p-1 hover:rotate-3 transition-transform">
            <DeauBitLogo size={28} />
          </Link>
          <nav className="flex gap-4">
            <Link href="/dash" className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 p-2 border-2 transition-all ${pathname === "/dash" ? "bg-(--db-primary) text-white border-(--db-border) shadow-[2px_2px_0px_0px_var(--db-border)]" : "text-(--db-text-muted) border-transparent hover:border-(--db-border) hover:bg-(--db-bg)"}`}>
              <LayoutDashboard className="h-3 w-3" /> <span className="hidden xs:block">Dash</span>
            </Link>
            <Link href="/dash/settings" className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 p-2 border-2 transition-all ${pathname === "/dash/settings" ? "bg-(--db-primary) text-white border-(--db-border) shadow-[2px_2px_0px_0px_var(--db-border)]" : "text-(--db-text-muted) border-transparent hover:border-(--db-border) hover:bg-(--db-bg)"}`}>
              <Settings className="h-3 w-3" /> <span className="hidden xs:block">Settings</span>
            </Link>
            {user?.role === "ADMIN" && (
              <Link href="/admin" className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 p-2 border-2 transition-all ${isAdminPage ? "bg-red-500 text-white border-red-700 shadow-[2px_2px_0px_0px_#991b1b]" : "text-red-500 border-transparent hover:border-red-500 hover:bg-red-50"}`}>
                <ShieldAlert className="h-3 w-3" /> <span className="hidden xs:block">Admin Panel</span>
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {loading ? (
            <div className="p-2 border-2 border-dashed border-(--db-border) opacity-50">
                <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          ) : user ? (
            <div className="flex items-center gap-3 pl-3 sm:border-l-4 sm:border-(--db-border)">
              <div className="hidden sm:flex flex-col items-end leading-tight mr-1">
                <span className="text-[10px] font-black truncate max-w-32 uppercase tracking-tighter text-(--db-text)">{user.email.split('@')[0]}</span>
                <span className="text-[8px] font-bold text-white bg-(--db-primary) px-1 border border-(--db-border) uppercase">{user.role}</span>
              </div>
              <button 
                onClick={handleLogout}
                className="group flex items-center gap-2 p-2 border-2 border-(--db-border) bg-(--db-surface) hover:bg-red-500 hover:text-white transition-all shadow-[4px_4px_0px_0px_var(--db-border)] hover:shadow-[2px_2px_0px_0px_#991b1b] active:translate-y-1 active:shadow-none"
                title="Sign Out"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden lg:block text-[10px] font-black uppercase">Logout</span>
              </button>
            </div>
          ) : null}
        </div>
      </header>

      <div className={`
        ${maxWidth} w-full
        p-4 sm:p-6 xl:p-8
        bg-(--db-surface) 
        border-2 md:border-4 border-(--db-border) 
        shadow-[6px_6px_0px_0px_var(--db-border)]
        md:shadow-[12px_12px_0px_0px_var(--db-border)]
        transition-all duration-300
        mb-24
      `}>
        {children}
      </div>
    </div>
  );
}
