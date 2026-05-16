//components/AppShell.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { SquaresFour, GearSix, SignOut, ShieldWarning, X } from "@phosphor-icons/react";
import { useEffect, useState } from "react";
import DeauBitLogo from "./DeauBitLogo";

interface UserInfo {
  email: string;
  name: string | null;
  role: string;
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Navbar only for authenticated dashboard pages
  const isDashboard = pathname.startsWith("/dash") || pathname.startsWith("/admin");

  // Public document pages (no navbar, top-aligned)
  const isPublicDoc = ["/terms", "/privacy", "/report"].includes(pathname);

  useEffect(() => {
    if (!isDashboard) return;
    fetch("/api/session")
      .then(r => r.json())
      .then(data => { if (data.authenticated) setUser(data.user); })
      .catch(() => {});
  }, [isDashboard]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { name } = (e as CustomEvent<{ name: string }>).detail;
      setUser(prev => prev ? { ...prev, name } : prev);
    };
    window.addEventListener("db:profile-updated", handler);
    return () => window.removeEventListener("db:profile-updated", handler);
  }, []);

  async function handleLogout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  async function confirmLogout() {
    setShowLogoutConfirm(false);
    await handleLogout();
  }

  // ── Dashboard layout (with navbar) ──────────────────────────
  if (isDashboard) {
    return (
      <div className="min-h-screen flex flex-col">
        <nav className="sticky top-0 z-50 px-4 py-3 sm:py-4">
          <div className="max-w-6xl mx-auto flex items-center justify-between glass-panel rounded-full px-4 sm:px-6 py-2 shadow-xl">
            <div className="flex items-center gap-2 sm:gap-5 lg:gap-7">
              <Link href="/" className="hover:scale-110 transition-transform active:scale-95 shrink-0">
                <DeauBitLogo size={30} />
              </Link>
              <div className="flex items-center gap-1">
                <Link href="/dash" className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-[9px] sm:text-[10px] font-dot tracking-widest transition-all ${pathname === "/dash" ? "bg-(--db-primary) text-(--db-primary-fg)" : "hover:bg-(--db-surface-hover) text-(--db-text-muted)"}`}>
                  <SquaresFour className="h-3.5 w-3.5" /> <span className="hidden sm:inline">DASH</span>
                </Link>
                <Link href="/dash/settings" className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-[9px] sm:text-[10px] font-dot tracking-widest transition-all ${pathname === "/dash/settings" ? "bg-(--db-primary) text-(--db-primary-fg)" : "hover:bg-(--db-surface-hover) text-(--db-text-muted)"}`}>
                  <GearSix className="h-3.5 w-3.5" /> <span className="hidden sm:inline">SETTINGS</span>
                </Link>
                {user?.role === "ADMIN" && (
                  <Link href="/admin" className={`flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-full text-[9px] sm:text-[10px] font-dot tracking-widest transition-all ${pathname.startsWith("/admin") ? "bg-(--db-danger) text-white" : "text-(--db-danger) hover:bg-(--db-danger)/10"}`}>
                    <ShieldWarning className="h-3.5 w-3.5" /> <span className="hidden sm:inline">ADMIN</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 sm:gap-3">
              {user && (
                <>
                  <div className="hidden md:flex flex-col items-end leading-none">
                    <span className="nothing-label scale-75 origin-right opacity-30">Auth_OK</span>
                    <span className="text-[10px] font-black uppercase tracking-tight">
                      {user.name || user.email.split("@")[0]}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowLogoutConfirm(true)}
                    className="p-2 sm:p-2.5 rounded-full bg-(--db-surface) border border-(--db-border) hover:bg-(--db-danger) hover:text-white hover:border-(--db-danger) transition-all active:scale-90 shadow-sm"
                    title="Logout"
                  >
                    <SignOut className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1 container-nothing py-6 sm:py-8 lg:py-12 animate-reveal">
          {children}
        </main>

        <footer className="py-7 border-t border-(--db-border) bg-(--db-surface)">
          <div className="container-nothing flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DeauBitLogo size={22} />
              <span className="nothing-label text-[10px] opacity-40">DeauBit_v{process.env.NEXT_PUBLIC_APP_VERSION}</span>
            </div>
            <div className="nothing-label text-[10px] opacity-20">
              VorDeau &copy; {new Date().getFullYear()}
            </div>
          </div>
        </footer>

        {/* ── Logout Confirm Modal ── */}
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-reveal">
            <div className="db-card w-full max-w-xs p-7 space-y-5 text-center relative">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-(--db-surface-hover) transition-colors opacity-40 hover:opacity-100"
              >
                <X size={15} />
              </button>
              <div className="inline-flex p-4 bg-(--db-surface-hover) rounded-3xl">
                <SignOut size={26} className="text-(--db-text-muted)" />
              </div>
              <div className="space-y-1">
                <h3 className="nothing-title text-lg">SIGN_OUT</h3>
                <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px]">
                  Terminate your current session?
                </p>
              </div>
              <div className="flex gap-3 pt-1">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 btn-secondary text-[10px] nothing-label opacity-100">
                  CANCEL
                </button>
                <button onClick={confirmLogout} className="flex-1 py-3 btn-primary text-[10px] tracking-widest">
                  CONFIRM
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Public document layout (no navbar, centered) ─────────────
  if (isPublicDoc) {
    return (
      <div className="min-h-dvh flex flex-col">
        <main className="flex-1 py-10 sm:py-14 px-4 sm:px-6 lg:px-8 animate-reveal">
          {children}
        </main>
        <footer className="py-5 text-center border-t border-(--db-border)/30">
          <p className="nothing-label text-[9px] opacity-20 uppercase tracking-[0.3em]">
            VORDEAU_SYSTEM &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    );
  }

  // ── Default: centered (home, auth pages, redirect pages, etc.) ──
  return (
    <div className="min-h-dvh flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <footer className="py-5 text-center">
        <p className="nothing-label text-[9px] opacity-20 uppercase tracking-[0.3em]">
          VORDEAU_SYSTEM &copy; {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}
