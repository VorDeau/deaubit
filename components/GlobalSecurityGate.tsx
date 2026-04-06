// components/GlobalSecurityGate.tsx

"use client";

import { useState, useEffect } from "react";
import { Turnstile } from "@marsidev/react-turnstile";
import { Loader2, AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalSecurityGate({ children }: { children: React.ReactNode }) {
  const [isVerified, setIsVerified] = useState<boolean | null>(null); // Use null for initial check
  const [mounted, setMounted] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  useEffect(() => {
    setMounted(true);
    const lastVerified = localStorage.getItem("db_human_verified");
    if (lastVerified) {
        const age = Date.now() - parseInt(lastVerified);
        if (age < 1800000) { // 30 minutes
            console.log("✅ [Gate] Human verified recently (via localStorage)");
            setIsVerified(true);
            return;
        }
    }
    console.log("🔒 [Gate] Verification required");
    setIsVerified(false);
  }, [siteKey]);

  const handleSuccess = async (token: string) => {
    setVerifying(true);
    setError(null);
    console.log("📡 [Gate] Token received, verifying with backend...");
    
    try {
      const res = await fetch("/api/auth/verify-turnstile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      
      const data = await res.json();

      if (res.ok) {
        console.log("🎉 [Gate] Backend verified successfully");
        localStorage.setItem("db_human_verified", Date.now().toString());
        setTimeout(() => {
          setIsVerified(true);
        }, 500);
      } else {
        console.error("❌ [Gate] Backend rejected verification:", data.error);
        setError(data.error || "Verification failed");
        setVerifying(false);
      }
    } catch (err) {
      console.error("❌ [Gate] Network error during verification");
      setError("Network error. Please check your connection.");
      setVerifying(false);
    }
  };

  if (!mounted || isVerified === null) return null;
  if (isVerified) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-(--db-bg) text-(--db-text) animate-in fade-in duration-500">
      <div className="w-full max-w-md p-8 flex flex-col items-center justify-center space-y-8 text-center">
        
        <div className="space-y-2">
          <h1 className="font-dot text-4xl tracking-nothing text-(--db-primary)">SYS.CHECK</h1>
          <p className="text-sm font-bold uppercase tracking-widest text-(--db-text-muted)">
            Security protocol initialization
          </p>
        </div>

        <div className="min-h-32 flex flex-col items-center justify-center w-full">
          {verifying ? (
            <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
              <Loader2 className="h-12 w-12 animate-spin text-(--db-primary)" />
              <span className="font-dot text-xl tracking-widest animate-pulse">VALIDATING...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center gap-4 animate-in shake duration-300">
              <div className="bg-red-500/10 p-4 rounded-full text-red-500">
                <AlertTriangle className="h-10 w-10" />
              </div>
              <p className="text-xs font-black text-red-500 uppercase">{error}</p>
              <button 
                onClick={() => { setError(null); }}
                className="flex items-center gap-2 px-6 py-2 bg-var(--db-text) text-var(--db-bg) rounded-full font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all"
              >
                <RefreshCw className="h-3 w-3" /> RETRY_OPS
              </button>
            </div>
          ) : (
            <div className="border border-(--db-border) p-2 rounded-3xl bg-white shadow-xl overflow-hidden transition-all duration-500">
              <Turnstile 
                siteKey={siteKey || ""} 
                onSuccess={handleSuccess}
                onError={() => { 
                    console.error("❌ [Turnstile] Widget error");
                    setError("Security widget failed to load."); 
                }}
                options={{ theme: 'light', size: 'normal' }}
              />
            </div>
          )}
        </div>

        <div className="pt-8 border-t border-(--db-border) w-full opacity-30">
          <p className="text-[9px] font-black uppercase tracking-nothing">
            Verifying your connection to bit.vordeau.net
          </p>
        </div>

      </div>
    </div>
  );
}
