// app/account-deleted/page.tsx

"use client";

import DeauBitLogo from "@/components/DeauBitLogo";
import Link from "next/link";
import { UserX, ArrowRight, ShieldOff } from "lucide-react";

export default function AccountDeletedPage() {
  return (
    <div className="db-card w-full max-w-md p-10 text-center animate-reveal shadow-2xl border-(--db-border)">

      <div className="flex justify-center mb-8">
        <DeauBitLogo size={52} />
      </div>

      <div className="inline-flex p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-3xl mb-8">
        <ShieldOff className="h-10 w-10 animate-soft-pulse" />
      </div>

      <div className="space-y-3 mb-10">
        <h1 className="nothing-title text-3xl text-(--db-text)">ACCOUNT_TERMINATED</h1>
        <div className="flex items-center justify-center gap-2 mt-2">
          <UserX className="h-3 w-3 text-(--db-primary)" />
          <span className="nothing-label text-(--db-primary) text-[9px] opacity-100">Identity_Purged_Successfully</span>
        </div>
        <p className="nothing-label normal-case tracking-normal opacity-50 text-[10px] leading-relaxed max-w-xs mx-auto pt-2">
          All associated data, shortlink mappings, and analytics records have been permanently removed from the system.
        </p>
      </div>

      <div className="space-y-3">
        <Link
          href="/"
          className="btn-primary w-full py-4 text-xs tracking-[0.2em] shadow-lg shadow-(--db-primary)/20"
        >
          RETURN_TO_SYSTEM <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/register"
          className="btn-secondary w-full py-3 text-[10px] nothing-label opacity-100"
        >
          INITIALIZE_NEW_IDENTITY
        </Link>
      </div>
    </div>
  );
}
