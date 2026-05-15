//app/admin/delete/page.tsx

"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Trash2, CheckCircle2, Loader2, XCircle, AlertTriangle } from "lucide-react";

function DeleteContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("slug");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"confirm" | "loading" | "success" | "error">("confirm");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleConfirm() {
    if (!slug || !token) return;
    setStatus("loading");
    try {
      const res = await fetch("/api/admin/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug, token }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to delete");
      setStatus("success");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err instanceof Error ? err.message : "Unknown error");
    }
  }

  if (!slug || !token) {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="p-5 bg-(--db-primary)/10 text-(--db-primary) rounded-3xl">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <p className="nothing-label text-(--db-primary) opacity-100">INVALID_PARAMETERS</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-center">
      {status === "confirm" && (
        <>
          <div className="inline-flex p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-3xl animate-soft-pulse">
            <Trash2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <p className="nothing-label text-(--db-primary) opacity-100">ABUSE_RESPONSE_MODULE</p>
            <h1 className="nothing-title text-2xl text-(--db-text)">CONFIRM_DELETION</h1>
          </div>
          <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px] leading-relaxed max-w-xs mx-auto">
            You are about to permanently terminate the link node{" "}
            <span className="font-dot text-(--db-primary) font-bold">/{slug}</span>{" "}
            based on an abuse report. This action is irreversible.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleConfirm}
              className="btn-primary w-full py-4 text-xs tracking-[0.2em] shadow-lg shadow-(--db-primary)/20"
            >
              <Trash2 className="h-4 w-4" /> CONFIRM_PURGE
            </button>
          </div>
        </>
      )}

      {status === "loading" && (
        <div className="flex flex-col items-center gap-6 py-8 opacity-60">
          <Loader2 className="h-12 w-12 animate-spin text-(--db-primary)" />
          <span className="nothing-label animate-pulse">EXECUTING_PURGE...</span>
        </div>
      )}

      {status === "success" && (
        <div className="animate-reveal space-y-6">
          <div className="inline-flex p-6 bg-green-500/10 text-green-500 rounded-3xl">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <p className="nothing-label text-green-500 opacity-100">OPERATION_COMPLETE</p>
            <h1 className="nothing-title text-2xl text-(--db-text)">NODE_TERMINATED</h1>
          </div>
          <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px]">
            The link has been permanently removed from database and cache.
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="animate-reveal space-y-6">
          <div className="inline-flex p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-3xl">
            <XCircle className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <p className="nothing-label text-(--db-primary) opacity-100">OPERATION_FAILED</p>
            <h1 className="nothing-title text-2xl text-(--db-text)">ERROR</h1>
          </div>
          <p className="text-sm font-bold text-(--db-primary)">{errorMsg}</p>
          <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px]">
            The link may have already been removed.
          </p>
        </div>
      )}
    </div>
  );
}

export default function AdminDeletePage() {
  return (
    <div className="min-h-dvh flex items-center justify-center px-4 py-12 bg-(--db-bg)">
      <div className="db-card w-full max-w-sm p-10 shadow-2xl animate-reveal border-(--db-border)">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-10 opacity-40">
              <Loader2 className="h-8 w-8 animate-spin text-(--db-primary)" />
            </div>
          }
        >
          <DeleteContent />
        </Suspense>
      </div>
    </div>
  );
}
