import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import DeauBitLogo from "@/components/DeauBitLogo";
import LoginForm from "@/components/LoginForm";
import PublicShortlinkForm from "@/components/PublicShortlinkForm";
import { CaretDown } from "@phosphor-icons/react";

export default function HomePage() {
  const [checkingSession, setCheckingSession] = useState(true);
  const [showScroll, setShowScroll] = useState(true);
  const brandingRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const nextPath = searchParams.get("next") || "/dash";

  useEffect(() => {
    const onScroll = () => setShowScroll(window.scrollY < 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const scrollToBranding = () =>
    brandingRef.current?.scrollIntoView({ behavior: "smooth" });

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const res = await fetch("/api/session", { method: "GET", credentials: "include" });
        const data = await res.json();
        if (!cancelled && data.authenticated) {
          navigate(nextPath, { replace: true });
          return;
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (!cancelled) setCheckingSession(false);
      }
    }

    init();
    return () => { cancelled = true; };
  }, [navigate, nextPath]);

  if (checkingSession) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-(--db-bg) z-60">
        <div className="flex flex-col items-center gap-8">
          <DeauBitLogo size={64} className="animate-pulse" />
          <div className="nothing-label tracking-[0.5em] animate-pulse">
            INITIALIZING_CORE_SYSTEM
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 flex flex-col items-center lg:justify-center animate-reveal">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-16 lg:items-center w-full">

        <div className="order-1 lg:order-2 lg:col-span-5 min-h-dvh lg:min-h-0 flex flex-col items-center justify-center relative py-10 lg:py-0 w-full">
          <div className="db-card p-6 sm:p-10 lg:p-12 shadow-2xl bg-(--db-surface) w-full max-w-md border-(--db-border)">
            <LoginForm nextPath={nextPath} />
          </div>

          <div className="lg:hidden absolute bottom-8 left-0 right-0 flex justify-center">
            <button
              onClick={scrollToBranding}
              className={`flex flex-col items-center gap-0.5 transition-all duration-500 ${showScroll ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"}`}
            >
              <span className="nothing-label text-[8px] opacity-30 mb-1">EXPLORE</span>
              <CaretDown size={15} style={{ animation: "caret-drift 1.3s ease-in-out infinite" }} />
              <CaretDown size={15} style={{ animation: "caret-drift 1.3s ease-in-out 0.22s infinite" }} className="opacity-40" />
              <CaretDown size={15} style={{ animation: "caret-drift 1.3s ease-in-out 0.44s infinite" }} className="opacity-20" />
            </button>
          </div>
        </div>

        <div
          ref={brandingRef}
          className="order-2 lg:order-1 lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8 lg:space-y-12 py-16 lg:py-0"
        >
          <div className="space-y-3">
            <h1 className="text-5xl sm:text-6xl lg:text-9xl nothing-title text-(--db-text) leading-none">DEAUBIT</h1>
            <div className="h-1.5 w-20 sm:w-32 bg-(--db-primary) rounded-full mx-auto lg:mx-0" />
          </div>

          <div className="space-y-3 sm:space-y-4">
            <p className="typewriter-text font-dot text-lg sm:text-xl md:text-2xl font-bold text-(--db-text) tracking-tight uppercase">
              Refined Link Infrastructure.
            </p>
            <p className="font-dot text-sm sm:text-base opacity-60 text-(--db-text) tracking-widest uppercase leading-relaxed">
              Minimalist. Private. Secure. Pure Utility.
            </p>
          </div>

          <div className="w-full max-w-xl">
            <PublicShortlinkForm />
          </div>

          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5 sm:gap-10 opacity-40">
            <Link to="/terms" className="nothing-label text-[9px] sm:text-[10px] hover:text-(--db-primary) transition-all font-bold">TERMS_OF_SERVICE</Link>
            <Link to="/privacy" className="nothing-label text-[9px] sm:text-[10px] hover:text-(--db-primary) transition-all font-bold">PRIVACY_PROTOCOL</Link>
            <Link to="/report" className="nothing-label text-[9px] sm:text-[10px] text-red-600 hover:text-red-500 transition-all font-bold">REPORT_ABUSE</Link>
          </div>
        </div>

      </div>
    </div>
  );
}
