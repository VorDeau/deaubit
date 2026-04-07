//components/VerifyForm.tsx

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, ShieldCheck, CheckCircle2, RefreshCw, AlertCircle, Mail, KeyRound } from "lucide-react";

function VerifyContent() {
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [emailConfirmed, setEmailConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [cooldown, setCooldown] = useState(0); 

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
      setEmailConfirmed(true);
    }
  }, [searchParams]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Verification failed");

      setSuccess(true); 
      
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (cooldown > 0) return;
    
    setResendLoading(true);
    setResendMessage("");
    setError(null);

    try {
      const res = await fetch("/api/auth/resend-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to resend");

      setResendMessage("New code sent! Check inbox.");
      setCooldown(60); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setResendLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center animate-reveal w-full">
         <div className="inline-flex p-6 bg-green-500/10 text-green-500 rounded-3xl mb-8">
             <CheckCircle2 className="h-12 w-12" />
         </div>
         <h2 className="text-3xl nothing-title text-(--db-text) mb-4">VERIFIED</h2>
         <p className="nothing-label mb-10 normal-case tracking-normal">
            Your identity has been confirmed. Access granted.
         </p>
         
         <button 
            onClick={() => router.push("/")}
            className="btn-primary w-full py-4 text-sm tracking-widest"
         >
            CONTINUE_TO_LOGIN
         </button>
      </div>
    );
  }

  if (!emailConfirmed) {
    return (
      <div className="w-full">
        <div className="flex items-center gap-4 mb-10 border-b border-(--db-border)/30 pb-6">
            <div className="bg-(--db-primary)/10 p-3 rounded-2xl shrink-0">
                <ShieldCheck className="h-6 w-6 text-(--db-primary)"/>
            </div>
            <div>
                <h2 className="text-2xl nothing-title text-(--db-text)">VERIFY</h2>
                <p className="nothing-label">Identity Validation</p>
            </div>
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) setEmailConfirmed(true);
          }}
          className="space-y-6"
        >
          <div className="space-y-2">
            <label className="nothing-label block ml-1">Email for Verification</label>
            <div className="relative">
                <input
                    type="email"
                    required
                    className="pl-12"
                    placeholder="USER@DOMAIN.COM"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoFocus
                />
                <Mail className="absolute left-4 top-3.5 text-(--db-text-muted) h-5 w-5" />
            </div>
          </div>
          <button
            type="submit"
            disabled={!email}
            className="btn-primary w-full py-4 text-sm tracking-widest"
          >
            REQUEST_CODE
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-4 mb-10 border-b border-(--db-border)/30 pb-6">
          <div className="bg-(--db-primary)/10 p-3 rounded-2xl shrink-0">
              <KeyRound className="h-6 w-6 text-(--db-primary)"/>
          </div>
          <div>
              <h2 className="text-2xl nothing-title text-(--db-text)">AUTHORIZE</h2>
              <p className="nothing-label">Code sent to {email.split('@')[0]}...</p>
          </div>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <input 
            className="w-full text-center text-4xl font-dot tracking-[0.5em] py-6 bg-(--db-surface-hover) border border-(--db-border) rounded-2xl focus:outline-none focus:border-(--db-text) transition-all" 
            placeholder="000000" 
            maxLength={6} 
            value={otp} 
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} 
            autoFocus 
        />
        
        <div className="min-h-12 flex items-center justify-center">
            {error ? (
                <div className="text-red-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2 animate-error-shake">
                   <AlertCircle className="h-4 w-4 shrink-0" /> {error}
                </div>
            ) : resendMessage ? (
                <div className="text-green-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-2">
                   <CheckCircle2 className="h-4 w-4 shrink-0" /> {resendMessage}
                </div>
            ) : null}
        </div>
        
        <button 
            type="submit" 
            disabled={loading || otp.length < 6} 
            className="btn-primary w-full py-4 text-sm tracking-widest"
        >
            {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto"/> : "CONFIRM_IDENTITY"}
        </button>

        <div className="text-center">
            <button
                type="button"
                onClick={handleResend}
                disabled={cooldown > 0 || resendLoading}
                className="nothing-label hover:text-(--db-text) flex items-center justify-center gap-2 mx-auto transition-colors disabled:opacity-50"
            >
                {resendLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                    <RefreshCw className={`h-3 w-3 ${cooldown > 0 ? "" : "hover:rotate-180 transition-transform duration-700"}`} />
                )}
                {cooldown > 0 
                    ? `RESEND_AVAILABLE_IN_${cooldown}S` 
                    : "RESEND_ACCESS_CODE"}
            </button>
        </div>

      </form>
    </div>
  );
}

export default function VerifyForm() { 
  return (
    <Suspense fallback={<div className="text-center p-10 nothing-label animate-pulse">BOOTING_VALIDATOR...</div>}>
        <VerifyContent/>
    </Suspense>
  ); 
}
