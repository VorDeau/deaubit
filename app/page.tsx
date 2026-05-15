//app/page.tsx

"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DeauBitLogo from "@/components/DeauBitLogo";
import LoginForm from "@/components/LoginForm";
import PublicShortlinkForm from "@/components/PublicShortlinkForm";
import Link from "next/link";

function HomeContent() {
  const [checkingSession, setCheckingSession] = useState(true);
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dash";

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const setupReq = fetch("/api/setup/status");
        const sessionReq = fetch("/api/session", { method: "GET", credentials: "include" });

        const setupRes = await setupReq;
        const setupData = await setupRes.json();
        
        if (!cancelled && !setupData.initialized) {
            router.replace("/setup");
            return;
        }

        const res = await sessionReq;
        const data = await res.json();
        
        if (!cancelled && data.authenticated) {
          router.replace(nextPath);
          return;
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [router, nextPath]);

  if (checkingSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-(--db-bg) z-60">
        <div className="flex flex-col items-center gap-8">
          <DeauBitLogo size={64} className="animate-pulse" />
          <div className="nothing-label tracking-[0.5em] animate-pulse">
            INITIALIZING_CORE_SYSTEM
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col items-center justify-center animate-reveal">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center w-full">
        
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 sm:space-y-12">
            <div className="space-y-4">
                <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl nothing-title text-(--db-text) leading-none">DEAUBIT</h1>
                <div className="h-1.5 sm:h-2 w-24 sm:w-32 bg-(--db-primary) rounded-full mx-auto lg:mx-0"></div>
            </div>
            
            <div className="max-w-2xl space-y-4">
                <div className="inline-block">
                    <p className="typewriter-text font-dot text-lg sm:text-xl md:text-2xl font-bold text-(--db-text) tracking-tight uppercase">
                        Refined Link Infrastructure.
                    </p>
                </div>
                <p className="font-dot text-sm sm:text-base md:text-lg opacity-60 text-(--db-text) tracking-widest uppercase leading-relaxed">
                    Minimalist. Private. Secure. Pure Utility.
                </p>
            </div>

            <div className="w-full max-w-xl">
                <PublicShortlinkForm />
            </div>
            
            <div className="hidden sm:flex flex-wrap items-center justify-center lg:justify-start gap-6 sm:gap-10 opacity-40 pt-6">
                <Link href="/terms" className="nothing-label text-[9px] sm:text-[10px] hover:text-(--db-primary) transition-all font-bold">TERMS_OF_SERVICE</Link>
                <Link href="/privacy" className="nothing-label text-[9px] sm:text-[10px] hover:text-(--db-primary) transition-all font-bold">PRIVACY_PROTOCOL</Link>
                <Link href="/report" className="nothing-label text-[9px] sm:text-[10px] text-red-600 hover:text-red-500 transition-all font-bold">REPORT_ABUSE</Link>
            </div>
        </div>

        <div className="lg:col-span-5 w-full flex justify-center mt-10 lg:mt-0">
          <div className="db-card p-6 sm:p-10 lg:p-12 shadow-2xl bg-(--db-surface) w-full max-w-md border-(--db-border)">
             <LoginForm nextPath={nextPath} />
          </div>
        </div>

      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense 
      fallback={
        <div className="fixed inset-0 flex items-center justify-center bg-(--db-bg) z-50">
          <DeauBitLogo size={48} className="animate-pulse" />
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
