//components/RegisterForm.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, Mail, FileSignature, Check, Eye, EyeOff, AlertTriangle } from "lucide-react";

export default function RegisterForm() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [confirmPassword, setConfirmPassword] = useState(""); 
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>(""); 
  const router = useRouter();

  async function performRegister() {
    setLoading(true);
    setError(""); 

    if (!agreed) {
        setError("Agreements required.");
        setLoading(false);
        return;
    }

    if (formData.password !== confirmPassword) {
      setError("Password mismatch.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 8) {
        setError("Password too short (min 8).");
        setLoading(false);
        return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData }),
      });

      const data = await res.json();

      if (!res.ok) {
          throw new Error(data.error || "Registry failed.");
      }

      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "System error.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performRegister();
  }

  return (
    <div className="w-full flex flex-col">
        <div className="flex items-center gap-4 mb-10 border-b border-(--db-border)/30 pb-6">
           <div className="bg-(--db-primary)/10 p-3 rounded-2xl shrink-0">
              <FileSignature className="h-6 w-6 text-(--db-primary)"/>
           </div>
           <div>
              <h2 className="text-2xl nothing-title text-(--db-text)">REGISTER</h2>
              <p className="nothing-label">Initialize New Identity</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
              <label className="nothing-label block ml-1">Email Identifier</label>
              <div className="relative">
                  <input 
                      type="email" 
                      className="pl-12"
                      placeholder="NAME@DOMAIN.COM"
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      required 
                  />
                  <Mail className="absolute left-4 top-3.5 text-(--db-text-muted) h-5 w-5" />
              </div>
          </div>

          <div className="space-y-2">
              <label className="nothing-label block ml-1">Access Key</label>
              <div className="relative">
                  <input 
                      type={showPassword ? "text" : "password"} 
                      className="pr-12"
                      placeholder="••••••••"
                      value={formData.password} 
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                      required 
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-(--db-text-muted) hover:text-(--db-text)"
                  >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
              </div>
          </div>

          <div className="space-y-2">
              <label className="nothing-label block ml-1">Verify Key</label>
              <div className="relative">
                  <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      className={`pr-12 ${confirmPassword && formData.password !== confirmPassword ? "border-red-500/50" : ""}`}
                      placeholder="••••••••"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                  />
                  <div className="absolute right-4 top-3.5 flex items-center gap-2">
                      {confirmPassword && formData.password === confirmPassword && (
                          <Check className="text-green-500 h-5 w-5" />
                      )}
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-(--db-text-muted) hover:text-(--db-text)"
                      >
                          {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                  </div>
              </div>
          </div>

          <div className="flex items-start gap-3 py-2">
              <input 
                  type="checkbox" 
                  id="terms_agree_register" 
                  className="mt-1 w-4 h-4 rounded accent-(--db-primary) cursor-pointer" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="terms_agree_register" className="text-[10px] font-bold uppercase text-(--db-text-muted) leading-tight cursor-pointer">
                  I accept the <Link href="/terms" target="_blank" className="text-(--db-primary) hover:underline">Terms</Link> & <Link href="/privacy" target="_blank" className="text-(--db-primary) hover:underline">Privacy Protocol</Link>.
              </label>
          </div>
          
          <button 
              type="submit" 
              disabled={loading || !agreed} 
              className="btn-primary w-full py-4 text-sm tracking-widest"
          >
              {loading ? <Loader2 className="animate-spin h-6 w-6"/> : "CREATE_ACCOUNT"}
          </button>

          {error && (
            <div className="bg-red-500/10 text-red-500 font-bold p-4 rounded-2xl border border-red-500/20 text-[10px] animate-error-shake flex items-center gap-3 uppercase tracking-widest">
                <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
            </div>
          )}
        </form>

        <div className="mt-10 text-center pt-8 border-t border-(--db-border)/30">
            <span className="nothing-label mr-2">Authorized Already?</span>
            <Link href="/" className="nothing-label text-(--db-primary) font-black border-b-2 border-transparent hover:border-(--db-primary) transition-all">
                LOGIN_HERE
            </Link>
        </div>
    </div>
  );
}
