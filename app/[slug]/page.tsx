// app/[slug]/page.tsx

import { prisma } from "@/lib/prisma";
import { getShortLink } from "@/lib/db/shortlink";
import Link from "next/link";
import SlugRedirector from "@/components/SlugRedirector";
import PasswordGuard from "@/components/PasswordGuard";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { lookup } from "fast-geoip";
import { AlertTriangle, ArrowLeft, Loader2, ShieldCheck } from "lucide-react";

export const dynamic = "force-dynamic";

interface ShortRedirectPageProps { params: Promise<{ slug: string }>; }

const ErrorCard = ({ title, msg }: { title: string, msg: string }) => (
  <div className="min-h-screen w-full flex items-center justify-center px-6">
    <div className="w-full max-w-sm db-card p-10 text-center space-y-8 animate-reveal">
      <div className="inline-flex p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-4xl">
          <AlertTriangle className="h-12 w-12" />
      </div>
      <div className="space-y-2">
          <h1 className="text-4xl nothing-title text-(--db-text)">{title}</h1>
          <p className="nothing-label text-red-500 font-bold tracking-widest">{msg}</p>
      </div>
      <Link href="/" className="btn-primary w-full py-4 text-xs tracking-widest">
          <ArrowLeft className="h-4 w-4 mr-2" /> BACK_TO_SYSTEM
      </Link>
    </div>
  </div>
);

export default async function ShortRedirectPage({ params }: ShortRedirectPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  
  const link = await getShortLink(slug);

  if (!link) return <ErrorCard title="404" msg="RELATIONAL_NODE_NULL" />;
  if (link.expiresAt && new Date() > link.expiresAt) return <ErrorCard title="EXPIRED" msg="TEMPORARY_ID_NULLED" />;
  
  if (link.password) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center px-6">
        <div className="w-full max-w-sm db-card p-10 space-y-8 animate-reveal">
            <div className="flex flex-col items-center text-center gap-6">
                <div className="p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-4xl">
                    <ShieldCheck className="h-10 w-10 animate-soft-pulse" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl nothing-title text-(--db-text)">LOCKED_NODE</h3>
                    <p className="nothing-label text-[10px] tracking-widest">AUTHORIZATION_KEY_REQUIRED</p>
                </div>
            </div>
            <PasswordGuard slug={link.slug} />
        </div>
      </div>
    );
  }

  // Analytics logging (detached)
  (async () => {
      try {
        const headersList = await headers();
        const userAgent = headersList.get("user-agent") || "";
        const ip = headersList.get("x-real-ip") || headersList.get("x-forwarded-for") || "127.0.0.1";
        const realIp = Array.isArray(ip) ? ip[0] : ip.split(',')[0];
        const referrer = headersList.get("referer") || "Direct"; 

        const parser = new UAParser(userAgent);
        const result = parser.getResult();
        const geo = await lookup(realIp);
        
        await prisma.click.create({
          data: {
            shortLinkId: link.id,
            browser: result.browser.name,
            os: result.os.name,
            device: result.device.type || "desktop",
            country: geo?.country,
            city: geo?.city,
            ip: realIp,
            referrer: referrer,
          },
        });
      } catch (e) { console.error("Analytics Error:", e); }
  })();

  return (
    <div className="min-h-screen w-full flex items-center justify-center px-6">
      <div className="w-full max-w-sm db-card p-10 text-center space-y-10 animate-reveal">
        <div className="flex flex-col items-center gap-6">
            <div className="p-6 bg-(--db-primary)/10 text-(--db-primary) rounded-4xl">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
            <div className="space-y-2">
                <h1 className="text-2xl nothing-title text-(--db-text)">REDIRECTING</h1>
                <p className="nothing-label text-[9px] tracking-[0.3em] opacity-60">SYNCHRONIZING_NODE_VECTOR</p>
            </div>
        </div>

        <div className="bg-(--db-surface-hover) border border-(--db-border) p-5 rounded-2xl relative">
            <div className="nothing-label text-[7px] absolute -top-2 left-4 bg-(--db-surface) px-2">DEST_TARGET</div>
            <p className="font-dot text-xs text-(--db-text) truncate opacity-40 italic">{link.targetUrl}</p>
        </div>
        
        <SlugRedirector target={link.targetUrl} delay={2} />
        
        <div className="pt-4">
            <Link href={link.targetUrl} className="btn-secondary w-full py-3 text-[10px] tracking-widest opacity-100 hover:bg-(--db-text) hover:text-(--db-bg) transition-all">
                SKIP_WAIT_SEQUENCE
            </Link>
        </div>

        <div className="pt-6 border-t border-(--db-border)/30">
            <p className="nothing-label text-[7px] opacity-20 uppercase tracking-[0.4em]">Vordeau_Link_Infrastructure_v9.2</p>
        </div>
      </div>
    </div>
  );
}
