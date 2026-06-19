"use client";

import { useState } from "react";
import { Logo } from "../components/Brand";

export default function LoginPage() {
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, password }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.error || "Login failed.");
        setLoading(false);
        return;
      }
      window.location.href = data.redirect;
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <main style={styles.wrap}>
      <div style={styles.panel}>
        <div style={styles.brandRow}>
          <Logo height={36} />
        </div>

        <h1 style={styles.title}>Clinician Video Review</h1>
        <p style={styles.sub}>
          Nystagmus classification study. Sign in with the credentials provided
          to you.
        </p>

        <form onSubmit={submit} style={styles.form}>
          <label style={styles.label}>
            Participant ID
            <input
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g. clinician1"
              autoComplete="username"
              autoFocus
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? "Signing in…" : "Enter Study"}
          </button>
        </form>

        <div style={styles.foot}>
          <span className="mono" style={{ fontSize: 11, color: "var(--ink-faint)" }}>
            25 VIDEO-BASED QUESTIONS · ONE PLAY-THROUGH FIRST
          </span>
        </div>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
  },
  panel: {
    width: "100%",
    maxWidth: 420,
    background: "var(--bg-card)",
    border: "1px solid var(--line)",
    borderRadius: "var(--radius)",
    padding: "40px 36px",
    boxShadow: "0 30px 80px -40px rgba(0,0,0,0.8)",
  },
  brandRow: { display: "flex", alignItems: "center", gap: 8, marginBottom: 28 },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    background: "var(--accent)",
    boxShadow: "0 0 12px var(--accent)",
  },
  brandMono: {
    fontFamily: "var(--font-mono), monospace",
    fontSize: 12,
    letterSpacing: "0.18em",
    color: "var(--ink-dim)",
  },
  title: { fontSize: 28, lineHeight: 1.15, marginBottom: 10 },
  sub: { color: "var(--ink-dim)", fontSize: 14, lineHeight: 1.5, marginBottom: 28 },
  form: { display: "flex", flexDirection: "column", gap: 18 },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    fontSize: 13,
    color: "var(--ink-dim)",
    fontWeight: 500,
  },
  error: {
    background: "rgba(248,113,113,0.1)",
    border: "1px solid rgba(248,113,113,0.3)",
    color: "var(--danger)",
    padding: "10px 12px",
    borderRadius: 8,
    fontSize: 13,
  },
  btn: {
    marginTop: 4,
    background: "var(--accent)",
    color: "#04211d",
    border: "none",
    borderRadius: 8,
    padding: "13px 16px",
    fontSize: 15,
    fontWeight: 600,
    letterSpacing: "0.01em",
  },
  foot: {
    marginTop: 28,
    paddingTop: 18,
    borderTop: "1px solid var(--line-soft)",
    textAlign: "center",
  },
};