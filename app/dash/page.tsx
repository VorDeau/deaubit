// app/dash/page.tsx

"use client";

import { useEffect, useState } from "react";
import { ExistingShortlinksCard, ShortLink } from "@/components/ExistingShortlinksCard";
import { CreateShortlinkCard } from "@/components/CreateShortlinkCard";
import AnalyticsModal from "@/components/AnalyticsModal";
import QrCodeModal from "@/components/QrCodeModal";
import EditShortlinkModal from "@/components/EditShortlinkModal"; 
import { Trash2, Zap, Activity } from "lucide-react";

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
    <div className="flex flex-col gap-10">
      
      {/* Top Welcome Widget Area */}
      <section className="grid grid-cols-1 md:grid-cols-[1fr_auto] items-center gap-6">
          <div className="space-y-1">
              <h2 className="text-4xl font-black uppercase tracking-tighter">DASHBOARD</h2>
              <div className="flex items-center gap-3 opacity-50">
                  <span className="font-dot text-[10px] tracking-nothing uppercase">System Online</span>
                  <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="h-[1px] w-8 bg-var(--db-text) opacity-20"></span>
                  <span className="font-dot text-[10px] tracking-nothing uppercase">{totalItems} active shortlinks</span>
              </div>
          </div>
          <div className="flex gap-2">
              <div className="db-card px-6 py-3 flex items-center gap-3">
                  <Activity className="h-4 w-4 text-var(--db-primary)" />
                  <div className="flex flex-col">
                      <span className="text-[10px] font-dot tracking-nothing uppercase leading-none opacity-40">Total Usage</span>
                      <span className="text-sm font-black leading-tight">{totalItems} LINKS</span>
                  </div>
              </div>
          </div>
      </section>

      {/* Main Grid: Create Area & List Area */}
      <div className="grid grid-cols-1 gap-8">
        
        {/* Create Shortlink - Now a prominent horizontal widget */}
        <div className="w-full">
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

        {/* Links Explorer */}
        <div className="w-full">
            <div className="flex items-center gap-3 mb-4 pl-4">
                <Zap className="h-4 w-4" />
                <h3 className="font-dot text-xs tracking-nothing uppercase">Shortlink Explorer</h3>
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
      
      {/* Nothing Styled Confirmation Overlay */}
      {pendingDeleteSlugs.length > 0 && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-var(--db-bg)/90 backdrop-blur-xl animate-in fade-in">
          <div className="db-card w-full max-w-sm p-8 space-y-6">
            <div className="flex flex-col items-center gap-4 text-center">
                <div className="p-4 rounded-full bg-var(--db-primary)/10 text-var(--db-primary) animate-soft-pulse">
                    <Trash2 className="h-10 w-10"/>
                </div>
                <div>
                    <h3 className="font-dot text-xl tracking-widest uppercase">Terminate</h3>
                    <p className="text-xs font-bold text-var(--db-text-muted) uppercase">Destroying {pendingDeleteSlugs.length} link record(s)</p>
                </div>
            </div>
            <div className="flex flex-col gap-2 pt-4">
                <button onClick={confirmDelete} disabled={deleteLoading} className="btn-primary w-full py-4 text-sm">
                    {deleteLoading ? "Terminating..." : "CONFIRM PURGE"}
                </button>
                <button onClick={() => { setPendingDeleteSlugs([]); }} className="btn-secondary w-full py-3 text-xs">ABORT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
