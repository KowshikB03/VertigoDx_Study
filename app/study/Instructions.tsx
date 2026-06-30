"use client";

import { MAX_REPLAYS } from "@/lib/options";
import { TOTAL_VIDEOS } from "@/lib/videos";

// Color highlights to match the spec:
//   blue   = nystagmus classification phrases
//   green  = otolith location
//   purple = treatment maneuver
const BLUE = "#1d4ed8";
const GREEN = "#15803d";
const PURPLE = "#7c3aed";

export default function Instructions() {
  const points: React.ReactNode[] = [
    <>There are {TOTAL_VIDEOS} video-based questions, shown one at a time.</>,
    <>Each video is displayed at a smartphone-sized viewing area.</>,
    <>The first viewing allows only one play-through.</>,
    <>After watching once, submit an <b style={{ color: BLUE }}>initial Nystagmus</b> classification <u>and a confidence score</u>.</>,
    <>After your initial answer, replay becomes available up to {MAX_REPLAYS} times.</>,
    <>You then submit a <b style={{ color: BLUE }}>final, refined Nystagmus</b> classification <u>and confidence score</u>.</>,
    <>Your first answer is stored permanently and is never overwritten.</>,
    <>For each video you will also answer the <b style={{ color: GREEN }}>Otolith location</b> and the appropriate <b style={{ color: PURPLE }}>Treatment maneuver</b>.</>,
    <>You will not advance to the next video until you choose to proceed.</>,
  ];

  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ maxWidth: 600, width: "100%", background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 12, padding: 40 }}>
        <div className="mono" style={{ fontSize: 13, letterSpacing: "0.06em", color: "#000", marginBottom: 14, fontWeight: 600 }}>
          SMARTVERTIGO™ · INSTRUCTIONS
        </div>
        <h1 style={{ fontSize: 22, marginBottom: 18, color: "#000" }}>Before you begin</h1>
        <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 13, marginBottom: 30 }}>
          {points.map((p, i) => (
            <li key={i} style={{ display: "flex", gap: 14, fontSize: 14.5, lineHeight: 1.5, color: "#000" }}>
              <span style={{ color: "#000", fontSize: 14, minWidth: 24, fontWeight: 600 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ol>

        <div style={{
          background: "rgba(13,148,136,0.08)",
          border: "1px solid var(--accent)",
          borderRadius: 10,
          padding: "14px 18px",
          marginBottom: 28,
        }}>
          <strong style={{ fontSize: 14.5, color: "#000", fontWeight: 700 }}>
            For each questionnaire, the timer starts once the video begins playing and runs until you submit each question.
          </strong>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <a href="/study/demo" style={{
            display: "inline-block", background: "var(--accent)", color: "#fff",
            border: "none", borderRadius: 8, padding: "13px 26px", fontSize: 15, fontWeight: 600, textDecoration: "none",
          }}>
            Start Demo →
          </a>
        </div>
      </div>
    </main>
  );
}