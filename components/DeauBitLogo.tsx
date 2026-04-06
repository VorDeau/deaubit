// components/DeauBitLogo.tsx

"use client";

import { useState, useEffect } from "react";

type DeauBitLogoProps = { size?: number; className?: string };

export default function DeauBitLogo({ size = 40, className = "" }: DeauBitLogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) return <div style={{ width: size, height: size }} className={className}></div>;

  return (
    <div style={{ width: size, height: size }} className={`relative group select-none ${className}`}>
      {/* Nothing OS Style Logo: Minimalist Circle + Dot */}
      <div className="absolute inset-0 rounded-full border-2 border-current opacity-20 group-hover:scale-110 transition-transform"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-2/3 h-2/3 rounded-full bg-current flex items-center justify-center">
            <span className="font-dot text-white leading-none mb-[1px]" style={{ fontSize: size * 0.4 }}>D</span>
        </div>
      </div>
      {/* Reactive Red Dot (Nothing Style) */}
      <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500 shadow-[0_0_8px_rgba(234,21,6,0.6)] animate-pulse"></div>
    </div>
  );
}
