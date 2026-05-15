//app/error.tsx

"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-dvh flex items-center justify-center bg-(--db-bg) p-4 sm:p-6">
      <div className="db-card w-full max-w-md p-10 shadow-2xl text-center animate-reveal border-(--db-primary)/20">

        <div className="inline-flex p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-3xl mb-8 animate-soft-pulse">
          <AlertTriangle className="h-12 w-12" />
        </div>

        <div className="space-y-3 mb-8">
          <p className="nothing-label text-(--db-primary) opacity-100">SYSTEM_CRITICAL</p>
          <h2 className="nothing-title text-3xl text-(--db-text)">CORE_ERROR</h2>
          <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px] leading-relaxed">
            An unexpected fault occurred in the core matrix. Initiating recovery protocol.
          </p>
        </div>

        {error.message && (
          <div className="bg-(--db-surface-hover) border border-(--db-border) rounded-2xl p-4 mb-8 text-left overflow-auto max-h-28">
            <code className="font-dot text-[9px] text-(--db-text-muted) break-all leading-relaxed">
              {error.message}
            </code>
          </div>
        )}

        <button
          onClick={() => reset()}
          className="btn-primary w-full py-4 text-xs tracking-[0.2em] shadow-lg shadow-(--db-primary)/20"
        >
          <RefreshCw className="h-4 w-4" /> REBOOT_SYSTEM
        </button>
      </div>
    </div>
  );
}
