"use client";

interface DeauBitLogoProps {
  size?: number;
  className?: string;
}

export default function DeauBitLogo({ size = 48, className = "" }: DeauBitLogoProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={`shrink-0 select-none ${className}`}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        {/* Lime chip — primary brand color as background */}
        <rect width="100" height="100" rx="22" fill="#a3e635" />

        {/* Bold D */}
        <text
          x="50"
          y="74"
          textAnchor="middle"
          fill="#0a0a0a"
          style={{
            fontSize: "64px",
            fontFamily: "'Courier New', Courier, monospace",
            fontWeight: 900,
          }}
        >
          D
        </text>
      </svg>
    </div>
  );
}
