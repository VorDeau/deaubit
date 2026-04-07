// app/dash/page.tsx

"use client";

import { useEffect, useState } from "react";
import { ExistingShortlinksCard, ShortLink } from "@/components/ExistingShortlinksCard";
import { CreateShortlinkCard } from "@/components/CreateShortlinkCard";
import AnalyticsModal from "@/components/AnalyticsModal";
import QrCodeModal from "@/components/QrCodeModal";
import EditShortlinkModal from "@/components/EditShortlinkModal"; 
import { Trash2, Zap, Activity, Cpu } from "lucide-react";

export default function DashboardPage() {
  const [links, setLinks] = useState<ShortLink[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [targetUrl, setTargetUrl] = useState("");
  const [slug, setSlug] = useState("");
  const [password, setPassword] = useState(""); 
  const [expiresAt, setExpiresAt] = useState("");

  const [loading, setLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [analyticsSlug, setAnalyticsSlug] = useState<string | null>(null);
  const [qrSlug, setQrSlug] = useState<string | null>(null); 
  const [editingLink, setEditingLink] = useState<ShortLink | null>(null);

  const [pendingDeleteSlugs, setPendingDeleteSlugs] = useState<string[]>([]);
  const [deletingSlugs, setDeletingSlugs] = useState<string[]>([]);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    fetchLinks(1);
  }, []);

  async function fetchLinks(page = 1) {
    setLoadingTable(true);
    try {
      const res = await fetch(`/api/links?page=${page}&limit=10`);
      const data = await res.json();
      if (data.data) {
          setLinks(data.data);
          setTotalPages(data.meta.totalPages);
          setTotalItems(data.meta.total);
          setCurrentPage(data.meta.page);
      } else { setLinks([]); }
    } catch { setLinks([]); } finally { setLoadingTable(false); }
  }

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/links", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl, slug: slug || undefined, password: password || undefined, expiresAt: expiresAt || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setTargetUrl(""); setSlug(""); setPassword(""); setExpiresAt("");
      fetchLinks(1);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error");
    } finally { setLoading(false); }
  }

  async function confirmDelete() {
    if (pendingDeleteSlugs.length === 0) return;
    setDeleteLoading(true);
    try {
        await Promise.all(pendingDeleteSlugs.map(slug => fetch(`/api/links/${slug}`, { method: "DELETE" })));
        setDeletingSlugs(pendingDeleteSlugs);
        await new Promise(resolve => setTimeout(resolve, 400));
        setPendingDeleteSlugs([]);
        setDeletingSlugs([]);
        fetchLinks(currentPage); 
    } catch { } finally { setDeleteLoading(false); }
  }

  const shortHost = process.env.NEXT_PUBLIC_SHORT_HOST || process.env.NEXT_PUBLIC_APP_HOST;
  const protocol = process.env.NEXT_PUBLIC_PROTOCOL || "https";
  const baseUrl = shortHost ? `${protocol}://${shortHost}` : (typeof window !== "undefined" ? window.location.origin : "");
  const getDomainLabel = (url: string) => { try { return new URL(url).hostname; } catch { return url; } };

  return (
    <div className="flex flex-col gap-8 sm:gap-12 lg:gap-16">
      
      <section className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
          <div className="space-y-3">
              <div className="flex items-center gap-2 text-(--db-primary)">
                  <Cpu className="h-4 w-4" />
                  <span className="nothing-label tracking-widest text-(--db-primary)">Node_Active_01</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl nothing-title text-(--db-text)">DASHBOARD</h2>
              <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="nothing-label normal-case tracking-normal opacity-40">{totalItems} Verified_Records</span>
              </div>
          </div>
          
          <div className="db-card px-6 py-4 sm:px-8 sm:py-5 flex items-center gap-4 bg-(--db-surface)/50 backdrop-blur-md w-full md:w-auto self-start md:self-auto">
              <Activity className="h-5 w-5 text-(--db-primary)" />
              <div className="flex flex-col">
                  <span className="nothing-label leading-none mb-1 opacity-40">System_Usage</span>
                  <span className="text-lg sm:text-xl font-black leading-tight uppercase tracking-tighter">{totalItems} Slugs_Deployed</span>
              </div>
          </div>
      </section>

      <div className="grid grid-cols-1 gap-10 lg:gap-16">
        
        <div className="w-full max-w-4xl">
            <CreateShortlinkCard
              targetUrl={targetUrl}
              slug={slug}
              password={password}
              expiresAt={expiresAt}
              loading={loading}
              error={error}
              onSubmit={handleCreate}
              onChangeTarget={setTargetUrl}
              onChangeSlug={setSlug}
              onChangePassword={setPassword}
              onChangeExpiresAt={setExpiresAt}
            />
        </div>

        <div className="w-full space-y-6">
            <div className="flex items-center gap-3 px-4">
                <Zap className="h-4 w-4 text-(--db-primary)" />
                <h3 className="nothing-label text-(--db-text) opacity-100 font-bold">Shortlink_Explorer_v2</h3>
            </div>
            <ExistingShortlinksCard
              links={links}
              loadingTable={loadingTable}
              baseUrl={baseUrl}
              getDomainLabel={getDomainLabel}
              onDelete={(slugs) => setPendingDeleteSlugs(slugs)}
              deletingSlugs={deletingSlugs}
              onEdit={(link) => setEditingLink(link)}
              onViewStats={(slug) => setAnalyticsSlug(slug)}
              onViewQr={(slug) => setQrSlug(slug)}
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalItems}
              onPageChange={(p) => setCurrentPage(p)}
            />
        </div>
      </div>

      {analyticsSlug && <AnalyticsModal slug={analyticsSlug} onClose={() => setAnalyticsSlug(null)} />}
      {qrSlug && <QrCodeModal slug={qrSlug} shortUrl={`${baseUrl}/${qrSlug}`} onClose={() => setQrSlug(null)} />}
      {editingLink && <EditShortlinkModal link={editingLink} onClose={() => setEditingLink(null)} onUpdate={() => fetchLinks(currentPage)} />}
      
      {pendingDeleteSlugs.length > 0 && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 sm:p-6 bg-(--db-bg)/90 backdrop-blur-2xl animate-reveal">
          <div className="db-card w-full max-w-sm p-8 sm:p-10 space-y-8 text-center border-(--db-primary)/20">
            <div className="flex flex-col items-center gap-6">
                <div className="p-6 rounded-4xl bg-(--db-primary)/10 text-(--db-primary)">
                    <Trash2 className="h-10 w-10 animate-soft-pulse"/>
                </div>
                <div className="space-y-2">
                    <h3 className="nothing-title text-2xl">TERMINATE</h3>
                    <p className="nothing-label text-(--db-primary) font-bold">AUTH_REQUIRED</p>
                </div>
                <p className="nothing-label normal-case tracking-normal opacity-60 text-[10px] sm:text-[11px] leading-relaxed">
                    Initiating core data purge for {pendingDeleteSlugs.length} record(s). This operation is irreversible.
                </p>
            </div>
            <div className="flex flex-col gap-3">
                <button onClick={confirmDelete} disabled={deleteLoading} className="btn-primary w-full py-4 text-xs tracking-widest border-none">
                    {deleteLoading ? "EXECUTING..." : "CONFIRM_PURGE"}
                </button>
                <button onClick={() => { setPendingDeleteSlugs([]); }} className="btn-secondary w-full py-3 text-[10px] nothing-label opacity-100">ABORT_MISSION</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
