//app/verify/page.tsx

import VerifyForm from "@/components/VerifyForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function VerifyPage() {
  return (
    <div className="w-full space-y-8">
      <VerifyForm />
      <div className="text-center pt-4">
        <Link href="/register" className="nothing-label hover:text-(--db-text) flex items-center justify-center gap-2">
          <ArrowLeft className="h-3 w-3" /> <span className="underline">INCORRECT_EMAIL?_BACK</span>
        </Link>
      </div>
    </div>
  );
}
