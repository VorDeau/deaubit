//app/terms/page.tsx

import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-10 pb-20 max-w-3xl">

      <section className="space-y-3 px-2">
        <Link href="/" className="btn-secondary w-fit px-5 py-2 text-[10px] nothing-label opacity-100 hover:bg-(--db-text) hover:text-(--db-bg) transition-all">
          <ArrowLeft className="h-3.5 w-3.5" /> BACK_TO_SYSTEM
        </Link>
        <div className="flex items-center gap-2 text-(--db-text-muted)">
          <FileText className="h-3.5 w-3.5" />
          <span className="nothing-label tracking-widest">Legal_Framework</span>
        </div>
        <h1 className="text-4xl nothing-title text-(--db-text)">TERMS_OF_SERVICE</h1>
        <p className="nothing-label normal-case tracking-normal opacity-40">Last updated: December 2025</p>
      </section>

      <div className="db-card p-8 lg:p-12 space-y-10 shadow-xl">

        <div className="space-y-4">
          <h2 className="nothing-title text-lg text-(--db-text) border-b border-(--db-border)/30 pb-4">1. ACCEPTANCE_OF_TERMS</h2>
          <p className="text-sm text-(--db-text-muted) leading-relaxed font-medium">
            By accessing and using DeauBit, you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please discontinue use of the service.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="nothing-title text-lg text-(--db-text) border-b border-(--db-border)/30 pb-4">2. USE_LICENSE</h2>
          <p className="text-sm text-(--db-text-muted) leading-relaxed font-medium">
            Permission is granted to temporarily use the materials on DeauBit for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
          </p>
        </div>

        <div className="space-y-4">
          <h2 className="nothing-title text-lg text-(--db-text) border-b border-(--db-border)/30 pb-4">3. PROHIBITED_CONTENT</h2>
          <p className="text-sm text-(--db-text-muted) leading-relaxed font-medium mb-3">
            You agree not to use the Service to shorten links to:
          </p>
          <ul className="space-y-2 pl-4">
            {["Malware, viruses, or phishing sites.", "Content that is illegal, harmful, or promotes violence.", "Spam or unsolicited advertising."].map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-(--db-text-muted) font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-(--db-primary) mt-2 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
          <div className="bg-(--db-primary)/5 border border-(--db-primary)/20 rounded-2xl p-4 mt-4">
            <p className="text-[10px] font-bold text-(--db-primary) uppercase tracking-widest">
              Violation of these terms will result in immediate permanent ban and deletion of associated links.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="nothing-title text-lg text-(--db-text) border-b border-(--db-border)/30 pb-4">4. DISCLAIMER</h2>
          <p className="text-sm text-(--db-text-muted) leading-relaxed font-medium">
            The materials on DeauBit are provided &quot;as is&quot;. DeauBit makes no warranties, expressed or implied, and hereby disclaims all other warranties including merchantability, fitness for a particular purpose, or non-infringement of intellectual property.
          </p>
        </div>

      </div>
    </div>
  );
}
