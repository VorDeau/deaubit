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
      <div className="fixed inset-0 flex items-center justify-center bg-(--db-bg) z-50">
        <div className="flex flex-col items-center gap-6">
          <DeauBitLogo size={48} className="animate-pulse" />
          <div className="font-dot text-[10px] uppercase tracking-[0.5em] text-(--db-text-muted)">
            Initializing System
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-6 py-8 md:py-24 min-h-[calc(100vh-80px)] flex flex-col justify-center">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24 items-center">
        
        <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left order-2 lg:order-1">
            <div className="mb-10 lg:mb-16">
                <h1 className="text-6xl sm:text-7xl md:text-9xl font-dot tracking-[0.1em] text-(--db-text) leading-none mb-6">DEAUBIT</h1>
                <div className="h-1 w-24 bg-(--db-primary) rounded-full mx-auto lg:mx-0"></div>
            </div>
            
            <p className="text-xs md:text-sm font-black uppercase tracking-[0.4em] text-(--db-text-muted) mb-12 max-w-md leading-relaxed">
                Refined Link Infrastructure. <br className="hidden md:block" />
                Minimalist. Private. Secure.
            </p>

            <div className="w-full max-w-lg mb-12">
                <PublicShortlinkForm />
            </div>
            
            <div className="flex items-center gap-8 opacity-20 hidden lg:flex mt-4">
                <div className="flex flex-col">
                    <span className="text-[9px] font-dot tracking-widest uppercase">Privacy Layer</span>
                    <div className="h-[1px] w-full bg-(--db-text) mt-1"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-dot tracking-widest uppercase">No Cookies</span>
                    <div className="h-[1px] w-full bg-(--db-text) mt-1"></div>
                </div>
                <div className="flex flex-col">
                    <span className="text-[9px] font-dot tracking-widest uppercase">Open Engine</span>
                    <div className="h-[1px] w-full bg-(--db-text) mt-1"></div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-5 w-full order-1 lg:order-2">
          <div className="db-card p-2 shadow-2xl bg-(--db-surface)/30 backdrop-blur-2xl border-white/5 rounded-[40px]">
             <LoginForm nextPath={nextPath} />
          </div>
        </div>

      </div>

      {/* Landing Footer Links */}
      <div className="mt-24 pt-8 border-t border-(--db-border)/30 flex flex-wrap justify-center lg:justify-start gap-8 opacity-30">
          <Link href="/terms" className="text-[9px] font-black uppercase tracking-widest hover:text-(--db-primary) transition-colors">Terms of Service</Link>
          <Link href="/privacy" className="text-[9px] font-black uppercase tracking-widest hover:text-(--db-primary) transition-colors">Privacy Protocol</Link>
          <Link href="/report" className="text-[9px] font-black uppercase tracking-widest text-red-500 hover:text-red-400 transition-colors">Report Abuse</Link>
          <div className="ml-auto text-[9px] font-dot tracking-widest uppercase hidden md:block">
            Powered by VorDeau &copy; {new Date().getFullYear()}
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
