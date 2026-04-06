// components/GlobalSecurityGate.tsx

"use client";

import { useState, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Loader2 } from "lucide-react";

export default function GlobalSecurityGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean>(true); // Default to true for SSR
  const [mounted, setMounted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    
    const checkStatus = () => {
        // Use a flag in localStorage for instant client-side check
        const lastVerified = localStorage.getItem("db_human_verified");
        if (lastVerified) {
            const age = Date.now() - parseInt(lastVerified);
            if (age < 1800000) { // 30 minutes
                setIsVerified(true);
                return;
            }
        }
        
        if (siteKey) {
            setIsVerified(false);
        }
    };

    checkStatus();
  }, [siteKey]);

  const handleSuccess = async (token: string) => {
    setVerifying(true);
    try {
      const res = await fetch("/api/auth/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      if (res.ok) {
        // Success: Set local flag and verified state
        localStorage.setItem("db_human_verified", Date.now().toString());
        setTimeout(() => {
          setIsVerified(true);
        }, 500);
      } else {
        setVerifying(false);
      }
    } catch {
      setVerifying(false);
    }
  };

  // If SSR or already verified, render children normally
  if (!mounted || isVerified) {
    return <>{children}</>;
  }

  // The Nothing OS Interstitial Gate
  return (
    <div className="fixed inset-0 z-9999 flex flex-col items-center justify-center bg-(--db-bg) text-(--db-text) animate-in fade-in duration-500">
      <div className="w-full max-w-md p-8 flex flex-col items-center justify-center space-y-8 text-center">
        
        {/* Nothing OS Styling: Minimalist dot-matrix headers */}
        <div className="space-y-2">
          <h1 className="font-dot text-4xl tracking-widest text-(--db-primary)">SYS.CHECK</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-(--db-text-muted)">
            Verifying connection securely
          </p>
        </div>

        <div className="h-32 flex items-center justify-center w-full">
          {verifying ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
              <Loader2 className="h-12 w-12 animate-spin text-(--db-primary)" />
              <span className="font-dot text-xl tracking-widest animate-pulse text-(--db-text)">VERIFIED.</span>
            </div>
          ) : (
            <div className="border border-(--db-border) p-2 rounded-3xl bg-(--db-surface) shadow-[0_8px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.4)] overflow-hidden transition-all duration-500">
              <Turnstile 
                siteKey={siteKey || ""} 
                onSuccess={handleSuccess}
                options={{ theme: 'auto', size: 'normal' }}
              />
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-(--db-border) w-full opacity-50">
          <p className="text-[10px] font-bold uppercase tracking-widest">
            {siteKey ? "Automated defense protocol active." : "Missing Security Configuration."}
          </p>
        </div>

      </div>
    </div>
  );
}
