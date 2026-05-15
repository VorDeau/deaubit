//app/dash/settings/page.tsx

"use client";

import { useState, useEffect } from "react";
import { User, Lock, CircleNotch, Shield, Trash, Warning, X, Check, Eye, EyeSlash, ArrowClockwise } from "@phosphor-icons/react";

export default function SettingsPage() {

  const [name, setName] = useState("");
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [profileMessage, setProfileMessage] = useState("");
  const [profileError, setProfileError] = useState("");

  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loadingSecurity, setLoadingSecurity] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityError, setSecurityError] = useState("");

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deleteOtp, setDeleteOtp] = useState("");
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  useEffect(() => {
    fetch("/api/session").then(r => r.json()).then(data => {
      if (data.user?.name) setName(data.user.name);
    });
  }, []);

  useEffect(() => {
    if (resendCooldown > 0) {
      const t = setInterval(() => setResendCooldown(p => p - 1), 1000);
      return () => clearInterval(t);
    }
  }, [resendCooldown]);

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
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : "Update failed");
    } finally { setLoadingProfile(false); }
  }

  async function handleUpdateSecurity(e: React.FormEvent) {
    e.preventDefault();
    setLoadingSecurity(true); setSecurityMessage(""); setSecurityError("");
    if (!newPassword || !oldPassword) { setSecurityError("Fill in all fields."); setLoadingSecurity(false); return; }
    if (newPassword !== confirmNewPassword) { setSecurityError("Keys do not match."); setLoadingSecurity(false); return; }
    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");
      setSecurityMessage("KEYS_ROTATED");
      setOldPassword(""); setNewPassword(""); setConfirmNewPassword("");
    } catch (err) {
      setSecurityError(err instanceof Error ? err.message : "Update failed");
    } finally { setLoadingSecurity(false); }
  }

  async function handleDeleteAccount(e: React.FormEvent) {
    e.preventDefault();
    setDeleteLoading(true); setDeleteError("");
    try {
      const res = await fetch("/api/auth/delete-account", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: deletePassword, otp: showOtpInput ? deleteOtp : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      if (data.requireOtp) { setShowOtpInput(true); setDeleteLoading(false); setResendCooldown(60); return; }
      window.location.href = "/account-deleted";
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : "Error");
      setDeleteLoading(false);
    }
  }

  async function handleResendDeleteCode() {
    if (resendCooldown > 0) return;
    setResendLoading(true); setResendMessage("");
    try {
      const res = await fetch("/api/auth/resend-delete-code", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      setResendCooldown(60);
      setResendMessage("Code dispatched.");
    } catch { setDeleteError("Dispatch failed."); }
    finally { setResendLoading(false); }
  }

  const closeDeleteModal = () => {
    setShowDeleteModal(false); setShowOtpInput(false);
    setDeletePassword(""); setDeleteOtp(""); setDeleteError("");
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-5 sm:gap-6 pb-20">

      {/* ── Header ── */}
      <div className="space-y-2 px-1">
        <h1 className="text-4xl sm:text-5xl nothing-title">SETTINGS</h1>
        <p className="nothing-label normal-case tracking-normal opacity-40">Profile & security management</p>
      </div>

      {/* ── Identity ── */}
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

      {/* ── Security ── */}
      <div className="db-card overflow-hidden">
        <div className="flex items-center gap-3 px-6 py-5 border-b border-(--db-border)/50">
          <div className="p-2.5 bg-(--db-primary)/15 rounded-xl shrink-0">
            <Shield size={16} className="text-(--db-primary)" />
          </div>
          <div>
            <h2 className="nothing-title text-base text-(--db-text)">SECURITY_PROTOCOL</h2>
            <p className="nothing-label text-[9px] opacity-50 mt-0.5">Access key rotation</p>
          </div>
        </div>
        <form onSubmit={handleUpdateSecurity} className="p-6 space-y-5">
          <div className="space-y-2">
            <label className="nothing-label block ml-1">Current_Key</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--db-text-muted) z-10 pointer-events-none">
                <Lock size={15} />
              </div>
              <input
                type="password"
                className="db-input pl-10!"
                placeholder="••••••••"
                value={oldPassword}
                onChange={e => setOldPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="nothing-label block ml-1">New_Key</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--db-text-muted) z-10 pointer-events-none">
                  <Lock size={15} />
                </div>
                <input
                  type={showNewPassword ? "text" : "password"}
                  className="db-input pl-10! pr-10!"
                  placeholder="Min. 8 chars"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-(--db-text-muted) hover:text-(--db-text) transition-colors">
                  {showNewPassword ? <EyeSlash size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="nothing-label block ml-1">Confirm_New_Key</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-(--db-text-muted) z-10 pointer-events-none">
                  <Lock size={15} />
                </div>
                <input
                  type="password"
                  className={`db-input pl-10! pr-10! ${confirmNewPassword && newPassword !== confirmNewPassword ? "border-red-500/50!" : ""}`}
                  placeholder="Confirm key"
                  value={confirmNewPassword}
                  onChange={e => setConfirmNewPassword(e.target.value)}
                />
                {confirmNewPassword && newPassword === confirmNewPassword && (
                  <Check size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-(--db-primary) pointer-events-none" />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-h-5">
              {securityMessage && (
                <span className="text-(--db-primary) font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                  <Check size={13} /> {securityMessage}
                </span>
              )}
              {securityError && (
                <span className="text-red-500 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5 animate-error-shake">
                  <Warning size={13} weight="fill" /> {securityError}
                </span>
              )}
            </div>
            <button type="submit" disabled={loadingSecurity} className="btn-primary px-7 py-3 text-xs tracking-widest shrink-0 disabled:opacity-40">
              {loadingSecurity ? <CircleNotch size={15} className="animate-spin" /> : "ROTATE"}
            </button>
          </div>
        </form>
      </div>

      {/* ── Danger Zone ── */}
      <div className="mt-4 pt-8 border-t border-dashed border-(--db-danger)/20">
        <div className="flex items-center gap-2 mb-5 px-1">
          <Warning size={18} weight="fill" className="text-(--db-danger)" />
          <h2 className="nothing-title text-xl text-(--db-danger)">DANGER_ZONE</h2>
        </div>
        <div className="db-card border-(--db-danger)/15 p-6">
          <p className="nothing-label normal-case tracking-normal opacity-50 text-[10px] leading-relaxed mb-5 max-w-md">
            Terminating your account permanently removes all shortlinks, analytics, and data. This cannot be undone.
          </p>
          <button
            onClick={() => setShowDeleteModal(true)}
            className="btn-secondary border-(--db-danger)/30 text-(--db-danger) hover:bg-(--db-danger) hover:text-white hover:border-(--db-danger) px-7 py-3 text-xs tracking-widest"
          >
            <Trash size={14} /> TERMINATE_ACCOUNT
          </button>
        </div>
      </div>

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl animate-reveal">
          <div className="db-card w-full max-w-sm p-7 space-y-6 border-(--db-danger)/20 relative">
            <button onClick={closeDeleteModal} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-(--db-surface-hover) transition-colors opacity-40 hover:opacity-100">
              <X size={16} />
            </button>

            <div className="text-center space-y-2">
              <div className="inline-flex p-4 bg-(--db-danger)/10 text-(--db-danger) rounded-3xl">
                <Trash size={28} className="animate-soft-pulse" />
              </div>
              <h2 className="nothing-title text-2xl">{showOtpInput ? "CONFIRM" : "WARNING"}</h2>
              <p className="nothing-label text-(--db-danger)">ACCOUNT_DESTRUCTION</p>
              <p className="nothing-label normal-case tracking-normal opacity-40 text-[10px]">
                {showOtpInput ? "Enter the code sent to your email." : "Enter your password to proceed."}
              </p>
            </div>

            <form onSubmit={handleDeleteAccount} className="space-y-4">
              <input
                type="password"
                className="db-input text-center font-bold"
                placeholder="Your password"
                value={deletePassword}
                onChange={e => setDeletePassword(e.target.value)}
                disabled={showOtpInput}
                required
              />

              {showOtpInput && (
                <div className="space-y-4 animate-reveal">
                  <input
                    className="db-input text-center text-2xl! font-dot tracking-[0.5em] py-5!"
                    placeholder="000000"
                    value={deleteOtp}
                    onChange={e => setDeleteOtp(e.target.value.replace(/\D/g, ""))}
                    maxLength={6}
                    autoFocus
                    required
                  />
                  <div className="text-center">
                    <button type="button" onClick={handleResendDeleteCode} disabled={resendCooldown > 0 || resendLoading}
                      className="nothing-label hover:text-(--db-text) flex items-center justify-center gap-2 mx-auto disabled:opacity-40 transition-colors">
                      {resendLoading ? <CircleNotch size={12} className="animate-spin" /> : <ArrowClockwise size={12} />}
                      {resendCooldown > 0 ? `RESEND_IN_${resendCooldown}S` : "RESEND_CODE"}
                    </button>
                    {resendMessage && <p className="nothing-label text-(--db-primary) mt-1.5">{resendMessage}</p>}
                  </div>
                </div>
              )}

              {deleteError && (
                <div className="bg-red-500/10 text-red-500 p-3 rounded-2xl border border-red-500/20 text-[10px] text-center uppercase tracking-widest animate-error-shake">
                  {deleteError}
                </div>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={closeDeleteModal} className="flex-1 py-3 btn-secondary text-[10px] nothing-label opacity-100">ABORT</button>
                <button type="submit" disabled={deleteLoading} className="flex-1 py-3 btn-danger text-xs tracking-widest disabled:opacity-40">
                  {deleteLoading ? <CircleNotch size={16} className="animate-spin" /> : showOtpInput ? "TERMINATE" : "PROCEED"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
