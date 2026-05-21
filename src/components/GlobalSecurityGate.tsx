// components/GlobalSecurityGate.tsx

"use client";

import { useState, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Warning, ArrowClockwise } from "@phosphor-icons/react";
import DeauBitLogo from "./DeauBitLogo";

export default function GlobalSecurityGate({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<"checking" | "verified" | "error">("checking");
  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  useEffect(() => {
    const last = localStorage.getItem("db_human_verified");
    if (last && Date.now() - parseInt(last) < 1800000) {
      setStatus("verified");
    }
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
      <div className="flex flex-col items-center gap-10 text-center p-8 max-w-sm w-full">

        {status === "checking" && (
          <>
            {siteKey && (
              <Turnstile
                siteKey={siteKey}
                onSuccess={handleSuccess}
                onError={() => setStatus("error")}
                options={{ theme: "dark", size: "invisible" }}
              />
            )}

            <div className="relative flex items-center justify-center" style={{ width: 140, height: 140 }}>
              <svg
                viewBox="0 0 100 100"
                width={140} height={140}
                className="absolute inset-0"
                style={{ animation: "ring-rotate-slow 4s linear infinite", transformOrigin: "50% 50%" }}
              >
                <circle
                  cx="50" cy="50" r="46"
                  fill="none"
                  stroke="#a3e635"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeDasharray="289"
                  style={{ animation: "ring-flow-slow 4s ease-in-out infinite", transformOrigin: "50% 50%" }}
                />
              </svg>

              <svg
                viewBox="0 0 100 100"
                width={110} height={110}
                className="absolute"
                style={{ animation: "ring-rotate 1.8s linear infinite", transformOrigin: "50% 50%" }}
              >
                <circle
                  cx="50" cy="50" r="39"
                  fill="none"
                  stroke="#a3e635"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  strokeDasharray="245"
                  style={{ animation: "ring-flow 1.8s cubic-bezier(0.4,0,0.2,1) infinite", transformOrigin: "50% 50%" }}
                />
              </svg>

              <DeauBitLogo size={44} />
            </div>

            <div className="space-y-1.5">
              <p className="nothing-title text-base text-(--db-text)">DEAUBIT</p>
              <p className="nothing-label animate-pulse opacity-40">Initializing secure connection...</p>
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
