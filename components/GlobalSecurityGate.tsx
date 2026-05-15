// components/GlobalSecurityGate.tsx

"use client";

import { useState, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { CircleNotch, Warning, ArrowClockwise } from "@phosphor-icons/react";
import DeauBitLogo from "./DeauBitLogo";

export default function GlobalSecurityGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "verified" | "error">("checking");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // Check cached verification (30 min TTL)
    const last = localStorage.getItem("db_human_verified");
    if (last && Date.now() - parseInt(last) < 1800000) {
      setStatus("verified");
    }
    // Otherwise, invisible Turnstile auto-executes on render
  }, []);

  const handleSuccess = async (token: string) => {
    try {
      const res = await fetch("/api/auth/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        localStorage.setItem("db_human_verified", Date.now().toString());
        setStatus("verified");
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const handleRetry = () => {
    setStatus("checking");
  };

  if (status === "verified") return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-(--db-bg) animate-reveal">
      <div className="flex flex-col items-center gap-8 text-center p-8 max-w-sm w-full">

        <DeauBitLogo size={56} />

        {status === "checking" && (
          <>
            {/* Invisible Turnstile — auto-executes, no visible iframe */}
            {siteKey && (
              <Turnstile
                siteKey={siteKey}
                onSuccess={handleSuccess}
                onError={() => setStatus("error")}
                options={{ theme: "dark", size: "invisible" }}
              />
            )}
            <div className="flex flex-col items-center gap-4">
              <CircleNotch size={28} className="animate-spin text-(--db-primary)" />
              <div className="space-y-1">
                <p className="nothing-title text-lg text-(--db-text)">DEAUBIT</p>
                <p className="nothing-label animate-pulse">Initializing secure connection...</p>
              </div>
            </div>
          </>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-5">
            <div className="p-4 bg-red-500/10 text-red-500 rounded-3xl">
              <Warning size={32} weight="fill" />
            </div>
            <div className="space-y-1">
              <p className="nothing-title text-lg text-red-500">VERIFICATION_FAILED</p>
              <p className="nothing-label normal-case tracking-normal opacity-50">
                Could not verify your connection. Please retry.
              </p>
            </div>
            <button onClick={handleRetry} className="btn-primary px-8 py-3 text-xs tracking-widest">
              <ArrowClockwise size={15} /> RETRY
            </button>
          </div>
        )}

        <p className="nothing-label text-[8px] opacity-15 normal-case tracking-normal absolute bottom-6">
          Protected by Cloudflare Turnstile
        </p>
      </div>
    </div>
  );
}
