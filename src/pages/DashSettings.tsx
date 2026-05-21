import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Trash, Warning, X, Check, CircleNotch } from "@phosphor-icons/react";

export default function SettingsPage() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => {
    fetch("/api/session").then(r => r.json()).then(data => {
      if (data.user?.name) setName(data.user.name);
    });
  }, []);

  async function handleUpdateProfile(e: React.FormEvent) {
    e.preventDefault();
    setLoadingProfile(true); setProfileMessage(""); setProfileError("");
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setProfileMessage("NAME_UPDATED");
      window.dispatchEvent(new CustomEvent("db:profile-updated", { detail: { name } }));
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Update failed");
    } finally { setLoadingProfile(false); }
  }

  async function handleDeleteData(e: React.FormEvent) {
    e.preventDefault();
    setDeleteLoading(true); setDeleteError("");
    try {
      const res = await fetch("/api/auth/delete-data", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      navigate("/data-deleted", { replace: true });
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error");
      setDeleteLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 sm:gap-6 pb-20">

      <div className="space-y-2 px-1">
        <h1 className="text-4xl sm:text-5xl nothing-title">SETTINGS</h1>
        <p className="nothing-label normal-case tracking-normal opacity-40">Profile management</p>
      </div>

      <div className="db-card overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-(--db-border)/50">
          <div className="p-2.5 bg-(--db-accent) rounded-xl shrink-0">
            <User size={16} className="text-(--db-accent-fg)" />
          </div>
          <div>
            <h2 className="nothing-title text-base text-(--db-text)">IDENTITY_CORE</h2>
            <p className="nothing-label text-[9px] opacity-50 mt-0.5">Display name configuration</p>
          </div>
        </div>
        <form onSubmit={handleUpdateProfile} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="nothing-label block ml-1">Assigned_Name</label>
            <input
              className="db-input"
              placeholder="User Identity"
              value={name}
              onChange={e => setName(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="min-h-5">
              {profileMessage && (
                <span className="text-(--db-primary) font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                  <Check size={13} /> {profileMessage}
                </span>
              )}
              {profileError && (
                <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 animate-error-shake">
                  <Warning size={13} weight="fill" /> {profileError}
                </span>
              )}
            </div>
            <button type="submit" disabled={loadingProfile} className="btn-primary px-7 py-3 text-xs tracking-widest shrink-0 disabled:opacity-40">
              {loadingProfile ? <CircleNotch size={15} className="animate-spin" /> : "SAVE"}
            </button>
          </div>
        </form>
      </div>

      <div className="mt-4 pt-8 border-t border-dashed border-(--db-danger)/20">
        <div className="flex items-center gap-2 mb-5 px-1">
          <Warning size={18} weight="fill" className="text-(--db-danger)" />
          <h2 className="nothing-title text-xl text-(--db-danger)">DANGER_ZONE</h2>
          <span className="nothing-label text-[8px] opacity-40 normal-case tracking-normal ml-1">DeauBit data only</span>
        </div>
        <div className="db-card border-(--db-danger)/15 p-6">
          <p className="nothing-label normal-case tracking-normal opacity-50 text-[10px] leading-relaxed mb-5 max-w-md">
            Permanently removes all your shortlinks, analytics, and data from DeauBit. Your main account remains intact.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-secondary border-(--db-danger)/30 text-(--db-danger) hover:bg-(--db-danger) hover:text-white hover:border-(--db-danger) px-7 py-3 text-xs tracking-widest"
          >
            <Trash size={14} /> DELETE_DATA
          </button>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-reveal">
          <div className="db-card w-full max-w-sm p-7 space-y-6 border-(--db-danger)/20 relative">
            <button onClick={() => setShowDeleteModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-(--db-surface-hover) transition-colors opacity-40 hover:opacity-100">
              <X size={16} />
            </button>
            <div className="text-center space-y-2">
              <div className="inline-flex p-4 bg-(--db-danger)/10 text-(--db-danger) rounded-3xl">
                <Trash size={28} className="animate-soft-pulse" />
              </div>
              <h2 className="nothing-title text-2xl">WARNING</h2>
              <p className="nothing-label text-(--db-danger)">DATA_DESTRUCTION</p>
              <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px]">
                All your DeauBit data will be permanently deleted. Your main account is unaffected.
              </p>
            </div>
            <form onSubmit={handleDeleteData} className="space-y-4">
              {deleteError && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl border border-red-500/20 text-[10px] text-center uppercase tracking-widest animate-error-shake">
                  {deleteError}
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowDeleteModal(false)} className="flex-1 py-3 btn-secondary text-[10px] nothing-label opacity-100">ABORT</button>
                <button type="submit" disabled={deleteLoading} className="flex-1 py-3 btn-danger text-xs tracking-widest disabled:opacity-40">
                  {deleteLoading ? <CircleNotch size={16} className="animate-spin" /> : "TERMINATE"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
