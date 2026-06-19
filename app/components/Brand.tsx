"use client";

import { useState, useEffect } from "react";

// ===== LOGO =====
// IN-PAGE LOGO: uses  public/logo.png  (falls back to a text wordmark).
export function Logo({ height = 32 }: { height?: number }) {
  const [broken, setBroken] = useState(false);
  if (broken) {
    return (
      <span className="mono" style={{ fontSize: 14, letterSpacing: "0.14em", color: "var(--ink-dim)", fontWeight: 600 }}>
        SMARTVERTIGO™
      </span>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.png"
      alt="VertigoDx"
      style={{ height, width: "auto", display: "block" }}
      onError={() => setBroken(true)}
    />
  );
}

// ===== LAPTOPS-ONLY NOTICE =====
// Big, vertical, light-blue notice shown ONCE per ~8-hour session (via cookie).
// Dismissing it (or just seeing it) sets a cookie so it won't show again until
// the cookie expires (next day / new session).
const BANNER_COOKIE = "sv_laptop_notice";
const BANNER_HOURS = 8;

function hasBannerCookie(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split(";").some((c) => c.trim().startsWith(`${BANNER_COOKIE}=`));
}

function setBannerCookie() {
  const maxAge = BANNER_HOURS * 60 * 60; // seconds
  document.cookie = `${BANNER_COOKIE}=1; path=/; max-age=${maxAge}; samesite=lax`;
}

export function LaptopBanner() {
  // Start hidden; after mount, show only if the cookie isn't already set.
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (!hasBannerCookie()) {
      setShow(true);
      setBannerCookie(); // mark seen for this session
    }
  }, []);

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(15,30,50,0.45)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div
        style={{
          background: "#dbeafe", // light blue
          color: "#0f2747",
          borderRadius: 16,
          padding: "48px 40px",
          maxWidth: 520,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 30px 80px -30px rgba(0,0,0,0.5)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 28,
        }}
      >
        <div style={{ fontSize: 44, lineHeight: 1 }}>💻</div>
        <p style={{ fontSize: 24, lineHeight: 1.4, fontWeight: 400, margin: 0 }}>
          Please complete this questionnaire on a laptop or desktop computer only.
          Mobile devices are not supported.
        </p>
        <button
          onClick={() => setShow(false)}
          style={{
            background: "#2563eb",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "14px 40px",
            fontSize: 16,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          I understand
        </button>
      </div>
    </div>
  );
}