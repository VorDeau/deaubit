//app/forgot-password/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, Mail, ArrowLeft, KeyRound, CheckCircle2, AlertTriangle } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function performReset() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
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

  if (success) {
    return (
      <div className="db-card w-full max-w-md p-10 text-center animate-reveal shadow-2xl border-(--db-border)">
        <div className="inline-flex p-6 bg-green-500/10 text-green-500 rounded-3xl mb-8">
          <CheckCircle2 className="h-12 w-12" />
        </div>
        <h2 className="nothing-title text-2xl text-(--db-text) mb-3">DISPATCH_SENT</h2>
        <p className="nothing-label normal-case tracking-normal opacity-50 text-[10px] leading-relaxed mb-2">
          Sent to: {email}
        </p>
        <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px] leading-relaxed mb-10">
          If that email exists in our system, reset instructions have been dispatched.
        </p>
        <Link
          href="/"
          className="btn-primary w-full py-4 text-xs tracking-[0.2em] shadow-lg shadow-(--db-primary)/20"
        >
          RETURN_TO_SYSTEM
        </Link>
      </div>
    );
  }

  return (
    <div className="db-card w-full max-w-md p-8 sm:p-10 shadow-2xl animate-reveal border-(--db-border)">

      <div className="flex items-center gap-4 mb-8 border-b border-(--db-border)/30 pb-6">
        <div className="bg-(--db-primary)/10 p-3 rounded-2xl shrink-0">
          <KeyRound className="h-6 w-6 text-(--db-primary)" />
        </div>
        <div>
          <h1 className="nothing-title text-xl text-(--db-text)">RECOVER_ACCESS</h1>
          <p className="nothing-label text-[9px] opacity-60">Reset_Key_Protocol</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <label className="nothing-label block ml-1 text-[9px]">Identity_Email</label>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-14 flex items-center justify-center text-(--db-text) opacity-40 z-10 pointer-events-none">
              <Mail className="h-5 w-5" />
            </div>
            <input
              type="email"
              required
              className="db-input"
              style={{ paddingLeft: "4rem" }}
              placeholder="USER@SYSTEM.NET"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoFocus
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 text-red-500 font-bold p-3 rounded-2xl border border-red-500/20 text-[10px] animate-error-shake flex items-center gap-3 uppercase tracking-widest">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-4 text-xs tracking-[0.2em] shadow-lg shadow-(--db-primary)/20 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto h-5 w-5" /> : "DISPATCH_RESET_LINK"}
        </button>
      </form>

      <div className="mt-8 text-center pt-6 border-t border-(--db-border)/30">
        <Link
          href="/"
          className="nothing-label text-[10px] hover:text-(--db-primary) flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> BACK_TO_SYSTEM
        </Link>
      </div>
    </div>
  );
}
