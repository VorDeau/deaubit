// app/[slug]/page.tsx

import { prisma } from "@/lib/prisma";
import { getShortLink } from "@/lib/db/shortlink";
import Link from "next/link";
import SlugRedirector from "@/components/SlugRedirector";
import PasswordGuard from "@/components/PasswordGuard";
import { headers } from "next/headers";
import { UAParser } from "ua-parser-js";
import { lookup } from "fast-geoip";
import { AlertTriangle, ArrowLeft, Loader2, ShieldCheck, Activity } from "lucide-react";

export const dynamic = "force-dynamic";

interface ShortRedirectPageProps { params: Promise<{ slug: string }>; }

const BaseContainer = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen w-full flex items-center justify-center px-6 bg-(--db-bg)">
    <div className="w-full max-w-2xl db-card p-1 lg:p-1.5 animate-reveal relative border-(--db-primary)/20 overflow-hidden shadow-[0_0_80px_rgba(234,21,6,0.05)]">
        {/* Binary Stream Animation Background */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none overflow-hidden select-none">
            <div className="absolute top-0 left-0 w-full h-full font-dot text-[8px] leading-none break-all animate-pulse">
                {Array(15).fill("1010011010101101010100101010110").join(" ")}
            </div>
        </div>
        <div className="bg-(--db-surface) rounded-[24px] p-8 lg:p-12 relative z-10">
            {children}
        </div>
    </div>
  </div>
);

const ErrorCard = ({ title, msg }: { title: string, msg: string }) => (
  <BaseContainer>
    <div className="flex flex-col md:flex-row items-center gap-10">
        <div className="p-8 bg-(--db-primary)/10 text-(--db-primary) rounded-4xl shrink-0">
            <AlertTriangle className="h-12 w-12" />
        </div>
        <div className="flex-1 text-center md:text-left space-y-6">
            <div className="space-y-2">
                <h1 className="text-4xl nothing-title text-(--db-text)">{title}</h1>
                <p className="nothing-label text-red-500 font-bold tracking-widest">{msg}</p>
            </div>
            <Link href="/" className="btn-primary w-full md:w-fit px-10 py-4 text-xs tracking-widest">
                <ArrowLeft className="h-4 w-4 mr-2" /> BACK_TO_SYSTEM
            </Link>
        </div>
    </div>
  </BaseContainer>
);

export default async function ShortRedirectPage({ params }: ShortRedirectPageProps) {
  const { slug: rawSlug } = await params;
  const slug = decodeURIComponent(rawSlug);
  const link = await getShortLink(slug);

  if (!link) return <ErrorCard title="404" msg="RELATIONAL_NODE_NULL" />;
  if (link.expiresAt && new Date() > link.expiresAt) return <ErrorCard title="EXPIRED" msg="TEMPORARY_ID_NULLED" />;
  
  if (link.password) {
    return (
      <BaseContainer>
        <div className="flex flex-col md:flex-row items-center gap-10">
            <div className="flex flex-col items-center shrink-0 space-y-4">
                <div className="p-8 bg-(--db-primary)/10 text-(--db-primary) rounded-4xl relative">
                    <ShieldCheck className="h-12 w-12 animate-soft-pulse" />
                    <div className="absolute -top-1 -right-1 h-4 w-4 bg-(--db-primary) rounded-full border-2 border-(--db-surface)"></div>
                </div>
                <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-(--db-primary) animate-pulse" />
                    <span className="nothing-label text-[9px] text-(--db-primary) font-bold">LOCKED_NODE</span>
                </div>
            </div>
            <div className="flex-1 w-full space-y-6 text-center md:text-left">
                <div className="space-y-1">
                    <h3 className="text-3xl nothing-title text-(--db-text)">AUTHORIZE</h3>
                    <p className="nothing-label text-[10px] opacity-60">ACCESS_KEY_REQUIRED_FOR_VECTOR</p>
                </div>
                <PasswordGuard slug={link.slug} />
            </div>
        </div>
      </BaseContainer>
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
            browser: result.browser.name, os: result.os.name,
            device: result.device.type || "desktop",
            country: geo?.country, city: geo?.city,
            ip: realIp, referrer: referrer,
          },
        });
      } catch (e) { console.error("Analytics Error:", e); }
  })();

  return (
    <BaseContainer>
      <div className="flex flex-col md:flex-row items-center gap-10 lg:gap-16">
        {/* Left Side Visual */}
        <div className="flex flex-col items-center shrink-0 space-y-6">
            <div className="p-8 bg-(--db-primary)/10 text-(--db-primary) rounded-4xl">
                <Loader2 className="h-12 w-12 animate-spin" />
            </div>
            <div className="space-y-1 text-center">
                <div className="flex items-center justify-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></span>
                    <span className="nothing-label text-[9px] text-(--db-text) font-bold">NODE_ACTIVE</span>
                </div>
                <p className="nothing-label text-[8px] opacity-40 uppercase">vordeau_infra_v9</p>
            </div>
        </div>

        {/* Right Side Content */}
        <div className="flex-1 w-full space-y-8 text-center md:text-left">
            <div className="space-y-2">
                <h1 className="text-3xl lg:text-4xl nothing-title text-(--db-text)">REDIRECTING</h1>
                <p className="nothing-label text-[10px] tracking-[0.2em] opacity-60">SYNCHRONIZING_NODE_VECTOR</p>
            </div>

            <div className="bg-(--db-surface-hover) border border-(--db-border) p-6 rounded-3xl relative group">
                <div className="nothing-label text-[8px] absolute -top-2.5 left-6 bg-(--db-surface) px-2 text-(--db-primary) font-bold">DEST_TARGET</div>
                <p className="font-dot text-sm text-(--db-text) truncate opacity-50 tracking-tight">{link.targetUrl}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-center gap-6">
                <div className="flex-1 w-full">
                    <SlugRedirector target={link.targetUrl} delay={2} />
                </div>
                <Link href={link.targetUrl} className="btn-secondary w-full sm:w-fit px-8 py-4 text-[10px] tracking-widest opacity-100 hover:bg-(--db-text) hover:text-(--db-bg) transition-all whitespace-nowrap">
                    SKIP_SEQUENCE
                </Link>
            </div>
        </div>
      </div>
    </BaseContainer>
  );
}
