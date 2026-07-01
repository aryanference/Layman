import React from "react";

function IconWrapper({
  children,
  bg,
}: {
  children: React.ReactNode;
  bg?: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "50%",
        background: bg || "rgba(255,255,255,0.85)",
        boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
        border: "1px solid rgba(0,0,0,0.06)",
      }}
    >
      {children}
    </div>
  );
}

export function OpenAIIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper>
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.896zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z"
          fill="#1a1a2e"
        />
      </svg>
    </IconWrapper>
  );
}

export function AnthropicIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M17.304 3.541h-3.672l6.696 16.918h3.672zm-12.304 0L0 12l2.609 6.459h3.672L3.672 3.541zm5.87 0L8.87 20.459h3.674l1.826-8.918z"
          fill="#1a1a2e"
        />
      </svg>
    </IconWrapper>
  );
}

export function GeminiIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z" fill="#1a1a2e" />
      </svg>
    </IconWrapper>
  );
}

export function MetaIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"
          fill="#1a1a2e"
        />
      </svg>
    </IconWrapper>
  );
}

export function MistralIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <rect x="2" y="6" width="4" height="12" rx="1" fill="#1a1a2e" />
        <rect x="8" y="4" width="4" height="16" rx="1" fill="#1a1a2e" />
        <rect x="14" y="8" width="4" height="8" rx="1" fill="#1a1a2e" />
        <rect x="20" y="6" width="2" height="12" rx="1" fill="#1a1a2e" />
      </svg>
    </IconWrapper>
  );
}

export function DeepSeekIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="3" fill="#1a1a2e" />
        <circle cx="12" cy="4" r="2" fill="#1a1a2e" />
        <circle cx="12" cy="20" r="2" fill="#1a1a2e" />
        <circle cx="4" cy="12" r="2" fill="#1a1a2e" />
        <circle cx="20" cy="12" r="2" fill="#1a1a2e" />
      </svg>
    </IconWrapper>
  );
}

export function GroqIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path d="M12 2L4 7v10l8 5 8-5V7z" fill="#1a1a2e" />
      </svg>
    </IconWrapper>
  );
}

export function CohereIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="8" cy="12" r="5" fill="#1a1a2e" />
        <circle cx="16" cy="12" r="3" fill="#1a1a2e" opacity="0.5" />
      </svg>
    </IconWrapper>
  );
}

export function PerplexityIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L2 22h20L12 2zm0 4l7 14H5l7-14z"
          fill="#1a1a2e"
        />
      </svg>
    </IconWrapper>
  );
}

export function TogetherIcon({ size = 20 }: { size?: number }) {
  return (
    <IconWrapper bg="#fff">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="6" r="3" fill="#1a1a2e" />
        <circle cx="6" cy="16" r="3" fill="#1a1a2e" />
        <circle cx="18" cy="16" r="3" fill="#1a1a2e" />
      </svg>
    </IconWrapper>
  );
}
