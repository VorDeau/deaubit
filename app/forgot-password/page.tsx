//app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, KeyRound, CheckCircle2, AlertCircle } from "lucide-react";
import DeauBitLogo from "@/components/DeauBitLogo";
import ChallengeModal from "@/components/ChallengeModal";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showChallenge, setShowChallenge] = useState(false);
  const [pendingAction, setPendingAction] = useState<((token: string) => void) | null>(null);

  async function performReset(token?: string) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cfTurnstile: token }),
      });

      const data = await res.json();
      if (!res.ok) {
          if (res.status === 400 && data.error?.includes("Security")) {
              setPendingAction(() => (t: string) => performReset(t));
              setShowChallenge(true);
              return;
          }
          throw new Error(data.error || "Request failed");
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performReset();
  }

  const handleChallengeSuccess = (token: string) => {
    setShowChallenge(false);
    if (pendingAction) {
        pendingAction(token);
        setPendingAction(null);
    }
  };

  if (success) {
      return (
        <div className="min-h-screen bg-(--db-bg) flex items-center justify-center p-4">
             <div className="w-full max-w-md bg-(--db-surface) border-4 border-(--db-border) p-8 shadow-[8px_8px_0px_0px_var(--db-border)] text-center">
                <div className="inline-flex p-4 bg-(--db-success) border-4 border-(--db-border) rounded-full mb-6 shadow-[4px_4px_0px_0px_var(--db-border)]">
                    <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-2xl font-black uppercase text-(--db-text) mb-2">CHECK YOUR INBOX</h2>
                <p className="text-sm font-bold text-(--db-text-muted) mb-8">
                    If an account exists for {email}, we have sent password reset instructions.
                </p>
                <Link href="/" className="block w-full bg-(--db-text) text-(--db-bg) py-4 font-black uppercase border-2 border-(--db-border) hover:shadow-[6px_6px_0px_0px_var(--db-border)] hover:-translate-y-1 transition-all">
                    BACK TO LOGIN
                </Link>
             </div>
        </div>
      );
  }

  return (
    <div className="min-h-screen bg-(--db-bg) flex flex-col items-center justify-center p-4">
      {showChallenge && (
          <ChallengeModal 
              onSuccess={handleChallengeSuccess}
              onClose={() => setShowChallenge(false)}
          />
      )}
      <div className="mb-8">
           <DeauBitLogo size={60} />
      </div>
      
      <div className="w-full max-w-md bg-(--db-surface) border-4 border-(--db-border) p-8 shadow-[12px_12px_0px_0px_var(--db-border)]">
        
        <div className="flex items-center gap-4 mb-8 border-b-4 border-(--db-border) pb-4">
            <div className="bg-(--db-accent) p-3 border-2 border-(--db-border)">
                <KeyRound className="h-6 w-6 text-(--db-accent-fg)" />
            </div>
            <div>
                <h1 className="text-xl font-black uppercase tracking-tighter text-(--db-text)">RESET PASSWORD</h1>
                <p className="text-xs font-bold text-(--db-text-muted) uppercase">Recover Access</p>
            </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div>
                <label className="font-black text-xs uppercase tracking-wider mb-2 block text-(--db-text)">Email Address</label>
                <div className="relative">
                    <input 
                        type="email" 
                        required 
                        className="w-full bg-(--db-bg) border-2 border-(--db-border) px-4 py-3 text-sm font-bold text-(--db-text) focus:outline-none focus:shadow-[4px_4px_0px_0px_var(--db-border)] transition-all placeholder:font-normal"
                        placeholder="user@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute right-4 top-3 text-(--db-text-muted) h-5 w-5" />
                </div>
            </div>

            {error && (
                <div className="bg-(--db-danger) text-white text-xs font-bold p-3 border-2 border-(--db-border) flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2">
                    <AlertCircle className="h-4 w-4"/> {error}
                </div>
            )}

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-(--db-primary) text-(--db-primary-fg) border-2 border-(--db-border) py-4 font-black uppercase tracking-widest shadow-[4px_4px_0px_0px_var(--db-border)] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_var(--db-border)] active:translate-y-0 active:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? <Loader2 className="animate-spin mx-auto h-5 w-5"/> : "SEND RESET LINK"}
            </button>
        </form>

        <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold text-(--db-text-muted) hover:text-(--db-text) transition-colors">
                <ArrowLeft className="h-3 w-3" /> Back to Login
            </Link>
        </div>
      </div>
    </div>
  );
}
