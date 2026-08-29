import React from 'react';

export function Logo({ size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="rs-bg-grad" x1="2" y1="2" x2="30" y2="30" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#0284C7" />
        </linearGradient>
        <linearGradient id="rs-radar-grad" x1="16" y1="16" x2="28" y2="28" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Rounded squircle base */}
      <rect x="2" y="2" width="28" height="28" rx="7" fill="url(#rs-bg-grad)" />

      {/* Radar scanning rings */}
      <circle cx="23" cy="23" r="5" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" strokeDasharray="2 2" fill="none" />
      <circle cx="23" cy="23" r="9" stroke="rgba(255,255,255,0.15)" strokeWidth="1.2" fill="none" />
      <circle cx="23" cy="23" r="2" fill="#38BDF8" />

      {/* Curved redirect arrow */}
      <path
        d="M9 22V16C9 12.134 12.134 9 16 9H23"
        stroke="#FFFFFF"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Arrow head pointing right */}
      <path
        d="M20 5.5L24 9L20 12.5"
        stroke="#FFFFFF"
        strokeWidth="2.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
