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
        setError("You must agree to the Terms & Privacy Policy.");
        setLoading(false);
        return;
    }

    if (formData.password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
        setError("Password must be at least 6 characters.");
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
          throw new Error(data.error || "Registration failed.");
      }

      router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await performRegister();
  }

  return (
    <div className="flex items-center justify-center min-h-full w-full py-8">
      <div className="db-card w-full max-w-lg p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        
        <div className="flex items-center gap-4 mb-8 border-b border-(--db-border)/30 pb-6">
           <div className="bg-(--db-primary)/10 p-3 rounded-2xl">
              <FileSignature className="h-6 w-6 text-(--db-primary)"/>
           </div>
           <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-(--db-text)">REGISTER</h2>
              <p className="text-[10px] font-bold text-(--db-text-muted) uppercase tracking-widest">Join the Club</p>
           </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          
          <div>
              <label className="font-black text-[10px] uppercase tracking-widest mb-2 block text-(--db-text-muted)">Email</label>
              <div className="relative">
                  <input 
                      type="email" 
                      name="email"
                      autoComplete="username email"
                      className="w-full bg-(--db-bg) border border-(--db-border)/50 rounded-xl px-4 py-3 text-base font-bold text-(--db-text) placeholder:font-normal placeholder:text-(--db-text-muted) focus:ring-2 focus:ring-(--db-primary)/50 focus:border-(--db-primary) outline-none transition-all" 
                      placeholder="name@example.com"
                      value={formData.email} 
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })} 
                      required 
                  />
                  <Mail className="absolute right-4 top-3.5 text-(--db-text-muted) w-5 h-5" />
              </div>
          </div>

          <div>
              <label className="font-black text-[10px] uppercase tracking-widest mb-2 block text-(--db-text-muted)">Password</label>
              <div className="relative">
                  <input 
                      type={showPassword ? "text" : "password"} 
                      name="password"
                      autoComplete="new-password"
                      className="w-full bg-(--db-bg) border border-(--db-border)/50 rounded-xl px-4 py-3 text-base font-bold text-(--db-text) placeholder:font-normal placeholder:text-(--db-text-muted) focus:ring-2 focus:ring-(--db-primary)/50 focus:border-(--db-primary) outline-none transition-all pr-12" 
                      placeholder="••••••••"
                      value={formData.password} 
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                      required 
                  />
                  <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-3.5 text-(--db-text-muted) hover:text-(--db-text) transition-all cursor-pointer"
                  >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
              </div>
          </div>

          <div>
              <label className="font-black text-[10px] uppercase tracking-widest mb-2 block text-(--db-text-muted)">Re-enter Password</label>
              <div className="relative">
                  <input 
                      type={showConfirmPassword ? "text" : "password"} 
                      name="confirmPassword"
                      autoComplete="new-password"
                      className={`w-full bg-(--db-bg) border border-(--db-border)/50 rounded-xl px-4 py-3 text-base font-bold text-(--db-text) placeholder:font-normal placeholder:text-(--db-text-muted) focus:ring-2 focus:ring-(--db-primary)/50 focus:border-(--db-primary) outline-none transition-all pr-16 ${
                          confirmPassword && formData.password !== confirmPassword ? "border-red-500/50 ring-2 ring-red-500/10" : ""
                      }`}
                      placeholder="••••••••"
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      required 
                  />
                  
                  <div className="absolute right-4 top-3.5 flex items-center gap-3">
                      {confirmPassword && formData.password === confirmPassword && (
                          <Check className="text-green-500 w-5 h-5" />
                      )}
                      <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="text-(--db-text-muted) hover:text-(--db-text) transition-all cursor-pointer"
                      >
                          {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                  </div>
              </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
              <input 
                  type="checkbox" 
                  id="terms_agree_register" 
                  className="w-5 h-5 rounded-lg accent-(--db-primary) cursor-pointer shrink-0" 
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
              />
              <label htmlFor="terms_agree_register" className="text-[10px] font-black uppercase tracking-widest text-(--db-text-muted) cursor-pointer select-none leading-relaxed">
                  I agree to the <Link href="/terms" target="_blank" className="underline text-(--db-primary) hover:text-(--db-primary)/80 transition-colors">Terms of Service</Link> & <Link href="/privacy" target="_blank" className="underline text-(--db-primary) hover:text-(--db-primary)/80 transition-colors">Privacy Policy</Link>.
              </label>
          </div>
          
          <div className="min-h-16 flex items-center">
             {error && (
                <div className="bg-red-500/10 text-red-500 font-bold p-4 rounded-xl border border-red-500/20 text-xs w-full animate-error-shake flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 shrink-0" /> {error}
                </div>
             )}
          </div>
          
          <button 
              type="submit" 
              disabled={loading || !agreed} 
              className="w-full bg-(--db-primary) text-white rounded-full py-4 font-black uppercase tracking-widest shadow-lg shadow-(--db-primary)/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 text-sm disabled:cursor-not-allowed"
          >
              {loading ? <Loader2 className="animate-spin mx-auto w-6 h-6"/> : "CREATE ACCOUNT"}
          </button>
        </form>
      </div>
    </div>
  );
}
