"use client";

import { useState } from "react";
import { Logo } from "../components/Brand";
import { FEEDBACK_QUESTIONS, FEEDBACK_SCALE_MIN, FEEDBACK_SCALE_MAX } from "@/lib/feedback";

export default function FeedbackForm({ participantId }: { participantId: string }) {
  const [scores, setScores] = useState<(number | null)[]>(
    FEEDBACK_QUESTIONS.map(() => null)
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  function setScore(i: number, v: number) {
    setScores((cur) => cur.map((s, idx) => (idx === i ? v : s)));
  }

  async function submit() {
    if (scores.some((s) => s === null)) {
      setErr("Please answer every question before submitting.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErr(data.error || "Could not submit. Try again.");
        setBusy(false);
        return;
      }
      window.location.href = "/study"; // -> completion screen
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
    }
  }

  const scale: number[] = [];
  for (let v = FEEDBACK_SCALE_MIN; v <= FEEDBACK_SCALE_MAX; v++) scale.push(v);

  return (
    <main style={{ minHeight: "100vh", padding: "28px 24px" }}>
      <div style={{ maxWidth: 800, margin: "0 auto" }}>
        <div style={{ marginBottom: 18 }}><Logo height={30} /></div>
        <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "#000", marginBottom: 8 }}>
          PARTICIPANT: {participantId} · FINAL STEP
        </div>
        <h1 style={{ fontSize: 26, marginBottom: 8 }}>Feedback</h1>
        <p style={{ color: "#000", fontSize: 14.5, lineHeight: 1.5, marginBottom: 6 }}>
          How much do you agree with the following statements:
        </p>
        <p style={{ color: "#000", fontSize: 13, marginBottom: 26 }}>
          (0 = Strongly Disagree / Very Poor; 5 = Strongly Agree / Excellent)
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {FEEDBACK_QUESTIONS.map((q, i) => (
            <div key={i} style={{
              border: "1px solid var(--line)", borderRadius: 12, padding: "20px 22px",
              background: "var(--bg-card)",
            }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 6 }}>
                <span style={{ color: "var(--accent)", fontWeight: 700 }}>{i + 1}.</span>
                <span style={{ fontWeight: 700, fontSize: 15 }}>{q.title}</span>
              </div>
              <p style={{ color: "#000", fontSize: 13.5, lineHeight: 1.5, marginBottom: 16 }}>
                {q.text}
              </p>
              <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {scale.map((v) => {
                  const selected = scores[i] === v;
                  return (
                    <button
                      key={v}
                      onClick={() => setScore(i, v)}
                      style={{
                        width: 46, height: 46, borderRadius: 10,
                        border: `1px solid ${selected ? "var(--accent)" : "var(--line)"}`,
                        background: selected ? "var(--accent)" : "var(--bg)",
                        color: selected ? "#fff" : "var(--ink)",
                        fontSize: 16, fontWeight: 600, cursor: "pointer",
                      }}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {err && <div style={{ color: "var(--danger)", fontSize: 13.5, marginTop: 16 }}>{err}</div>}

        <button
          onClick={submit}
          disabled={busy}
          style={{
            marginTop: 24, background: "var(--accent)", color: "#fff", border: "none",
            borderRadius: 8, padding: "14px 28px", fontSize: 15, fontWeight: 600,
            opacity: busy ? 0.6 : 1, cursor: busy ? "wait" : "pointer",
          }}
        >
          {busy ? "Submitting…" : "Submit Feedback & Finish"}
        </button>
      </div>
    </main>
  );
}