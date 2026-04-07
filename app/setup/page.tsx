//app/setup/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Server, KeyRound, RefreshCw, ChevronRight, Cpu } from "lucide-react";

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"form" | "otp">("form");
  const router = useRouter();

  const [formData, setFormData] = useState({ name: "Administrator", email: "", password: "" });
  const [otp, setOtp] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    fetch("/api/setup/status")
      .then((res) => res.json())
      .then((data) => {
        if (data.initialized) router.replace("/");
        else setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [router]);

  useEffect(() => {
    if (resendCooldown > 0) {
        const timer = setInterval(() => setResendCooldown(prev => prev - 1), 1000);
        return () => clearInterval(timer);
    }
  }, [resendCooldown]);

  async function handleSetup(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setStep("otp");
      setResendCooldown(60); 
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleVerify(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
      if (resendCooldown > 0) return;
      setResendLoading(true); setError("");
      try {
          const res = await fetch("/api/auth/resend-otp", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: formData.email })
          });
          if(!res.ok) throw new Error("Failed");
          setResendCooldown(60);
      } catch {
          setError("Failed to resend.");
      } finally {
          setResendLoading(false);
      }
  }

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-20 gap-6">
        <Cpu className="h-12 w-12 animate-spin text-(--db-primary)" />
        <p className="nothing-label animate-pulse">BOOTING_CORE_SYSTEM...</p>
    </div>
  );

  return (
    <div className="w-full">
        <div className="flex items-center gap-4 mb-10 border-b border-(--db-border)/30 pb-6">
            <div className="bg-(--db-primary)/10 p-3 rounded-2xl shrink-0">
                <Server className="h-6 w-6 text-(--db-primary)"/>
            </div>
            <div>
                <h1 className="text-2xl nothing-title text-(--db-text)">SYSTEM INIT</h1>
                <p className="nothing-label">Environment Configuration</p>
            </div>
        </div>

        {step === "form" ? (
            <form onSubmit={handleSetup} className="space-y-6">
                <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20 flex items-start gap-3">
                    <Server className="h-4 w-4 text-blue-500 mt-1 shrink-0" />
                    <p className="text-[10px] font-bold text-blue-600 uppercase leading-relaxed">
                        No administrator found. Create the root account to initialize the system database.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="nothing-label ml-1">Root Name</label>
                        <input className="font-bold" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Administrator" required />
                    </div>
                    <div className="space-y-1">
                        <label className="nothing-label ml-1">Root Email</label>
                        <input type="email" className="font-bold" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="admin@system.local" required />
                    </div>
                    <div className="space-y-1">
                        <label className="nothing-label ml-1">Root Password</label>
                        <input type="password" className="font-bold" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} placeholder="••••••••" required minLength={8} />
                    </div>
                </div>

                {error && (
                    <div className="bg-red-500/10 text-red-500 font-bold p-4 rounded-2xl border border-red-500/20 text-[10px] animate-error-shake uppercase tracking-widest">
                        ERROR: {error}
                    </div>
                )}

                <button type="submit" disabled={submitting} className="btn-primary w-full py-4 text-sm tracking-widest">
                    {submitting ? <Loader2 className="animate-spin h-5 w-5"/> : <>INITIALIZE_SYSTEM <ChevronRight className="h-4 w-4 ml-2"/></>}
                </button>
            </form>
        ) : (
            <form onSubmit={handleVerify} className="space-y-8 text-center">
                <div className="inline-block p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-3xl mb-2">
                    <KeyRound className="h-10 w-10" />
                </div>
                <div>
                    <h2 className="text-2xl nothing-title">VERIFY ACCESS</h2>
                    <p className="nothing-label mt-1">CODE SENT TO: {formData.email}</p>
                </div>
                
                <input 
                    className="text-center text-4xl font-dot tracking-[0.5em] py-6" 
                    placeholder="000000" maxLength={6} value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} autoFocus 
                />
                
                {error && <div className="bg-red-500/10 text-red-500 p-4 rounded-2xl border border-red-500/20 text-[10px] font-bold uppercase">{error}</div>}
                
                <button type="submit" disabled={submitting || otp.length < 6} className="btn-primary w-full py-4 text-sm tracking-widest">
                    {submitting ? <Loader2 className="animate-spin h-5 w-5"/> : "AUTHORIZE_&_LAUNCH"}
                </button>

                <button 
                    type="button" 
                    onClick={handleResend} 
                    disabled={resendCooldown > 0 || resendLoading}
                    className="nothing-label hover:text-(--db-text) flex items-center justify-center gap-2 mx-auto disabled:opacity-50 transition-colors"
                >
                    {resendLoading ? <Loader2 className="h-3 w-3 animate-spin"/> : <RefreshCw className={`h-3 w-3 ${resendCooldown === 0 ? "hover:rotate-180 transition-transform duration-700" : ""}`}/>}
                    {resendCooldown > 0 ? `RESEND_IN_${resendCooldown}S` : "RESEND_ACCESS_CODE"}
                </button>
            </form>
        )}
    </div>
  );
}
