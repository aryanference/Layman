"use client";

import React from "react";

interface LogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 40, showText = true, className = "" }: LogoProps) {
  return (
    <div
      className={className}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: showText ? "12px" : "0",
      }}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="48" height="48" rx="12" fill="#1a1a2e" />
        <path
          d="M24 8L27.5 20.5L40 24L27.5 27.5L24 40L20.5 27.5L8 24L20.5 20.5L24 8Z"
          fill="white"
        />
      </svg>
      {showText && (
        <span
          style={{
            fontSize: size * 0.55,
            fontWeight: 800,
            color: "var(--text-hero)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            fontFamily: "var(--font-display)",
          }}
        >
          Layman
        </span>
      )}
    </div>
  );
}
