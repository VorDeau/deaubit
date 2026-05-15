//app/report/page.tsx

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, Send, Loader2, CheckCircle2, ArrowLeft, ChevronDown } from "lucide-react";

export default function ReportPage() {
  const [formData, setFormData] = useState({
    linkUrl: "",
    reason: "phishing",
    details: "",
    contact: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const [placeholder, setPlaceholder] = useState("https://...");

  useEffect(() => {
    const protocol = process.env.NEXT_PUBLIC_PROTOCOL || "https";
    const host = process.env.NEXT_PUBLIC_SHORT_HOST || process.env.NEXT_PUBLIC_APP_HOST;
    if (host) {
      setPlaceholder(`${protocol}://${host}/...`);
    } else if (typeof window !== "undefined") {
      setPlaceholder(`${window.location.origin}/...`);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit report.");
      }
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "SUBMIT_FAILED");
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] px-4">
        <div className="db-card w-full max-w-md p-10 text-center animate-reveal shadow-2xl border-(--db-border)">
          <div className="inline-flex p-6 bg-green-500/10 text-green-500 rounded-3xl mb-8">
            <CheckCircle2 className="h-12 w-12" />
          </div>
          <div className="space-y-3 mb-10">
            <p className="nothing-label text-green-500 opacity-100">REPORT_TRANSMITTED</p>
            <h2 className="nothing-title text-2xl text-(--db-text)">FILED_SUCCESSFULLY</h2>
            <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px] leading-relaxed max-w-xs mx-auto">
              Your report has been logged. Our team will review the flagged node immediately.
            </p>
          </div>
          <Link href="/" className="btn-primary w-full py-4 text-xs tracking-[0.2em] shadow-lg shadow-(--db-primary)/20">
            RETURN_TO_SYSTEM
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-10 pb-20 max-w-2xl">

      <section className="space-y-3 px-2">
        <Link href="/" className="btn-secondary w-fit px-5 py-2 text-[10px] nothing-label opacity-100 hover:bg-(--db-text) hover:text-(--db-bg) transition-all">
          <ArrowLeft className="h-3.5 w-3.5" /> BACK_TO_SYSTEM
        </Link>
        <div className="flex items-center gap-2 text-(--db-primary)">
          <AlertTriangle className="h-3.5 w-3.5" />
          <span className="nothing-label tracking-widest text-(--db-primary)">Security_Report_Module</span>
        </div>
        <h1 className="text-4xl nothing-title text-(--db-text)">REPORT_ABUSE</h1>
        <p className="nothing-label normal-case tracking-normal opacity-40">Flag malicious or prohibited shortlinks to our security team.</p>
      </section>

      <div className="db-card p-8 lg:p-10 shadow-xl">
        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="space-y-2">
            <label className="nothing-label block ml-1">Suspicious_Link_URL</label>
            <input
              type="url"
              className="db-input"
              placeholder={placeholder}
              value={formData.linkUrl}
              onChange={(e) => setFormData({ ...formData, linkUrl: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="nothing-label block ml-1">Violation_Category</label>
            <div className="relative">
              <select
                className="db-input appearance-none cursor-pointer pr-10!"
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              >
                <option value="phishing">Phishing / Scam</option>
                <option value="malware">Malware / Virus</option>
                <option value="spam">Spam / Advertising</option>
                <option value="violence">Violence / Hate Speech</option>
                <option value="other">Other</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-(--db-text-muted) pointer-events-none" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="nothing-label block ml-1">Additional_Details <span className="opacity-40">(Optional)</span></label>
            <textarea
              className="db-input min-h-28 resize-y"
              placeholder="Describe the violation in detail..."
              value={formData.details}
              onChange={(e) => setFormData({ ...formData, details: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="nothing-label block ml-1">Contact_Email <span className="opacity-40">(Optional)</span></label>
            <input
              type="email"
              className="db-input"
              placeholder="For follow-up correspondence"
              value={formData.contact}
              onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
            />
          </div>

          {error && (
            <div className="bg-red-500/10 text-red-500 font-bold p-4 rounded-2xl border border-red-500/20 text-[10px] animate-error-shake flex items-center gap-3 uppercase tracking-widest">
              <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-5 text-sm tracking-[0.25em] shadow-lg shadow-(--db-primary)/20"
          >
            {loading ? (
              <Loader2 className="animate-spin h-5 w-5" />
            ) : (
              <><Send className="h-4 w-4" /> SUBMIT_REPORT</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
