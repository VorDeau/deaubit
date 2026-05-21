
"use client";

import { useEffect, useState } from "react";

export default function SlugRedirector({ target, delay = 5 }: { target: string; delay?: number }) {
  const [timeLeft, setTimeLeft] = useState(delay);

  useEffect(() => {
    if (!target) return;
    if (timeLeft <= 0) { window.location.href = target; return; }
    const timer = setInterval(() => setTimeLeft((prev) => Math.max(0, prev - 0.1)), 100);
    return () => clearInterval(timer);
  }, [target, timeLeft]);

  const progressPercent = Math.min(100, Math.max(0, ((delay - timeLeft) / delay) * 100));

  return (
    <div className="w-full space-y-3">
      <div className="relative h-12 bg-(--db-surface-hover) rounded-2xl overflow-hidden border border-(--db-border)">
        <div
          className="absolute top-0 left-0 h-full bg-(--db-primary) rounded-2xl transition-all duration-100 ease-linear"
          style={{ width: `${progressPercent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <span className="font-dot font-black text-base text-(--db-text) mix-blend-hard-light tracking-widest">
            {Math.ceil(timeLeft)}s
          </span>
        </div>
      </div>
      <p className="nothing-label text-[8px] opacity-30 text-center normal-case tracking-normal">
        Redirect initiating in {Math.ceil(timeLeft)} second{Math.ceil(timeLeft) !== 1 ? "s" : ""}...
      </p>
    </div>
  );
}
