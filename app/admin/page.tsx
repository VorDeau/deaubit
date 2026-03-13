// app/admin/page.tsx

"use client";

import { useEffect, useState } from "react";
import { 
    Users, Link2, AlertTriangle, 
    Trash2, ExternalLink, Loader2, RefreshCw, ShieldAlert 
} from "lucide-react";

interface AdminData {
    reports: {
        id: string;
        reason: string;
        details: string;
        shortLink: {
            slug: string;
            targetUrl: string;
        } | null;
    }[];
    publicLinks: {
        id: string;
        slug: string;
        targetUrl: string;
    }[];
    stats: {
        totalUsers: number;
        totalLinks: number;
        pendingReports: number;
    };
}

export default function AdminPage() {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"reports" | "public">("reports");
  
  const [deleteModal, setDeleteModal] = useState<{ show: boolean; slug: string | null }>({ show: false, slug: null });
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/data");
      if (!res.ok) throw new Error("Failed");
      const json = await res.json();
      setData(json);
    } catch { } finally {
      setLoading(false);
    }
  }

  function confirmDelete(slug: string) {
    setDeleteModal({ show: true, slug });
  }

  async function executeDelete() {
    if (!deleteModal.slug) return;
    setIsDeleting(true);
    try {
        const res = await fetch(`/api/links/${deleteModal.slug}`, { method: "DELETE" });
        if(res.ok) {
            setDeletingSlug(deleteModal.slug);
            setDeleteModal({ show: false, slug: null });
            await new Promise(resolve => setTimeout(resolve, 400));
            setDeletingSlug(null);
            fetchData();
        }
    } catch { } finally {
        setIsDeleting(false);
    }
  }

  return (
    <div className="space-y-8 animate-page-in">
      
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b-4 border-(--db-border) pb-6">
          <div>
              <div className="flex items-center gap-2 text-red-500 mb-1">
                  <ShieldAlert className="h-5 w-5" />
                  <span className="text-xs font-black uppercase tracking-[0.2em]">Security Protocol Active</span>
              </div>
              <h1 className="text-4xl font-black uppercase tracking-tighter text-(--db-text)">Command Center</h1>
          </div>
          <button 
              onClick={fetchData} 
              className="flex items-center gap-2 px-4 py-2 border-2 border-(--db-border) bg-(--db-surface) hover:bg-(--db-bg) transition-all shadow-[4px_4px_0px_0px_var(--db-border)] active:translate-y-0.5 active:shadow-none font-black text-xs uppercase"
          >
              <RefreshCw className={`h-3 w-3 ${loading ? "animate-spin" : ""}`} />
              Refresh Data
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="db-card-admin relative p-6 overflow-hidden group">
              <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-(--db-text-muted) mb-1">Registered Users</p>
                  <p className="text-4xl font-black text-(--db-text)">{data?.stats.totalUsers || 0}</p>
              </div>
              <Users className="absolute -right-4 -bottom-4 h-20 w-20 text-(--db-border) opacity-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="db-card-admin relative p-6 overflow-hidden group">
              <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-(--db-text-muted) mb-1">Active Links</p>
                  <p className="text-4xl font-black text-(--db-text)">{data?.stats.totalLinks || 0}</p>
              </div>
              <Link2 className="absolute -right-4 -bottom-4 h-20 w-20 text-(--db-border) opacity-10 group-hover:scale-110 transition-transform duration-500" />
          </div>
          <div className="db-card-admin relative bg-red-500 p-6 overflow-hidden group border-red-700 shadow-[8px_8px_0px_0px_#991b1b]">
              <div className="relative z-10">
                  <p className="text-[10px] font-black uppercase tracking-widest text-red-100 mb-1">Abuse Reports</p>
                  <p className="text-4xl font-black text-white">{data?.stats.pendingReports || 0}</p>
              </div>
              <AlertTriangle className="absolute -right-4 -bottom-4 h-20 w-20 text-black opacity-20 group-hover:scale-110 transition-transform duration-500" />
          </div>
      </div>

      <div className="db-card-admin flex flex-col min-h-150 overflow-hidden">
          <div className="flex border-b-4 border-(--db-border)">
              <button 
                  onClick={() => setActiveTab("reports")}
                  className={`flex-1 py-4 font-black uppercase text-xs flex items-center justify-center gap-2 transition-all border-r-4 border-(--db-border) ${activeTab === "reports" ? "bg-red-50 text-red-600" : "bg-(--db-surface) hover:bg-(--db-bg)"}`}
              >
                  <AlertTriangle className="h-4 w-4"/> 
                  Reports ({data?.reports.length || 0})
              </button>
              <button 
                  onClick={() => setActiveTab("public")}
                  className={`flex-1 py-4 font-black uppercase text-xs flex items-center justify-center gap-2 transition-all ${activeTab === "public" ? "bg-blue-50 text-blue-600" : "bg-(--db-surface) hover:bg-(--db-bg)"}`}
              >
                  <Link2 className="h-4 w-4"/> 
                  Public ({data?.publicLinks.length || 0})
              </button>
          </div>

          <div className="flex-1 overflow-x-auto bg-(--db-bg) p-4">
              {loading && !data ? (
                  <div className="h-full flex flex-col items-center justify-center p-10">
                      <Loader2 className="h-8 w-8 animate-spin text-(--db-primary) mb-2"/>
                      <p className="font-black text-[10px] uppercase tracking-widest opacity-50">Syncing database...</p>
                  </div>
              ) : (
                  <table className="w-full text-left border-collapse border-2 border-(--db-border) bg-(--db-surface) min-w-[700px]">
                      <thead className="bg-(--db-text) text-(--db-bg)">
                          <tr>
                              <th className="p-4 text-[10px] font-black uppercase border-b-4 border-r-2 border-(--db-border)">Identity</th>
                              <th className="p-4 text-[10px] font-black uppercase border-b-4 border-r-2 border-(--db-border)">Destination</th>
                              {activeTab === "reports" && <th className="p-4 text-[10px] font-black uppercase border-b-4 border-r-2 border-(--db-border)">Reason</th>}
                              <th className="p-4 text-[10px] font-black uppercase border-b-4 border-(--db-border) text-right">Action</th>
                          </tr>
                      </thead>
                      <tbody className="divide-y-2 divide-(--db-border)">
                          {activeTab === "reports" ? (
                              data?.reports.map((report) => (
                                  <tr key={report.id} className={`hover:bg-red-50/50 transition-colors ${report.shortLink?.slug === deletingSlug ? "animate-shrink-out pointer-events-none" : ""}`}>
                                      <td className="p-4 border-r-2 border-(--db-border) font-mono text-xs font-bold text-red-600">
                                          {report.shortLink ? `/${report.shortLink.slug}` : "GONE"}
                                      </td>
                                      <td className="p-4 border-r-2 border-(--db-border)">
                                          <div className="text-[10px] font-bold truncate max-w-[250px] font-mono opacity-60">
                                              {report.shortLink?.targetUrl || "-"}
                                          </div>
                                      </td>
                                      <td className="p-4 border-r-2 border-(--db-border)">
                                          <div className="flex flex-col gap-1">
                                              <span className="bg-red-500 text-white text-[8px] font-black px-1.5 py-0.5 uppercase w-fit">{report.reason}</span>
                                              <span className="text-[10px] text-(--db-text-muted) italic truncate max-w-[200px]">{report.details}</span>
                                          </div>
                                      </td>
                                      <td className="p-4 text-right">
                                          {report.shortLink && (
                                              <button onClick={() => confirmDelete(report.shortLink!.slug)} className="bg-red-500 text-white p-2 border-2 border-black shadow-[2px_2px_0px_0px_black] hover:translate-y-0.5 hover:shadow-none transition-all">
                                                  <Trash2 className="h-3 w-3"/>
                                              </button>
                                          )}
                                      </td>
                                  </tr>
                              ))
                          ) : (
                              data?.publicLinks.map((link) => (
                                  <tr key={link.id} className={`hover:bg-blue-50/50 transition-colors ${link.slug === deletingSlug ? "animate-shrink-out pointer-events-none" : ""}`}>
                                      <td className="p-4 border-r-2 border-(--db-border) font-mono text-xs font-bold text-blue-600">
                                          /{link.slug}
                                      </td>
                                      <td className="p-4 border-r-2 border-(--db-border)">
                                          <a href={link.targetUrl} target="_blank" className="text-[10px] font-bold hover:underline flex items-center gap-1 opacity-60">
                                              {link.targetUrl} <ExternalLink className="h-2 w-2"/>
                                          </a>
                                      </td>
                                      <td className="p-4 text-right">
                                          <button onClick={() => confirmDelete(link.slug)} className="p-2 border-2 border-(--db-border) bg-(--db-surface) hover:bg-red-500 hover:text-white transition-all shadow-[2px_2px_0px_0px_var(--db-border)]">
                                              <Trash2 className="h-3 w-3"/>
                                          </button>
                                      </td>
                                  </tr>
                              ))
                          )}
                      </tbody>
                  </table>
              )}
          </div>
      </div>

      {deleteModal.show && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
           <div className="db-card w-full max-w-sm p-1 bg-red-500 border-white shadow-[0_0_50px_rgba(239,68,68,0.4)] animate-success-pop">
              <div className="bg-(--db-surface) border-4 border-(--db-border) p-8 text-center">
                  <div className="flex justify-center mb-4">
                     <div className="bg-red-500 text-white p-4 border-4 border-(--db-border) animate-warning-glow">
                        <Trash2 className="h-8 w-8" />
                     </div>
                  </div>
                  <h2 className="text-2xl font-black uppercase tracking-tighter text-(--db-text) mb-2">Terminate Data?</h2>
                  <p className="text-[10px] font-bold text-(--db-text-muted) uppercase mb-6">Security authorization required</p>
                  
                  <div className="flex flex-col gap-3">
                     <button onClick={executeDelete} disabled={isDeleting} className="w-full py-4 font-black bg-red-500 text-white border-4 border-(--db-border) shadow-[4px_4px_0px_0px_var(--db-border)] hover:translate-y-1 hover:shadow-none transition-all uppercase text-sm">
                        {isDeleting ? "Processing..." : "Purge Link"}
                     </button>
                     <button onClick={() => setDeleteModal({ show: false, slug: null })} className="w-full py-3 font-black text-xs uppercase border-2 border-(--db-border) hover:bg-(--db-bg)">Cancel</button>
                  </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
