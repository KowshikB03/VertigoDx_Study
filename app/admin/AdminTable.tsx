"use client";

import { useState, Fragment } from "react";
import type { AnswerRow } from "@/lib/db";
import { VIDEO_ORDER } from "@/lib/videos";
import { isCorrectSingle, points1a, points1b, points1c, maxPoints, isManeuverInKey, isOtolithInKey, OTOLITH_MULTI_VIDEOS } from "@/lib/answerKey";
import { FEEDBACK_QUESTIONS } from "@/lib/feedback";

interface VideoLibItem { id: string; url: string; position: string; duration: string | null; answerA: string | null; answerB: string | null; answerC: string | null; }

const COLS: { key: keyof AnswerRow; label: string }[] = [
  { key: "video_id", label: "Video ID" },
  { key: "video_position", label: "Position" },
  { key: "initial_classification", label: "Initial Class" },
  { key: "initial_confidence_percent", label: "Init Conf%" },
  { key: "initial_response_time_seconds", label: "Init Time(s)" },
  { key: "replay_count", label: "Replays" },
  { key: "final_classification", label: "Final Class" },
  { key: "final_confidence_percent", label: "Final Conf%" },
  { key: "final_response_time_seconds", label: "Final Time(s)" },
  { key: "total_classification_time_seconds", label: "Total Time(s)" },
  { key: "otolith_location_answer", label: "Otolith" },
  { key: "otolith_confidence_percent", label: "Oto Conf%" },
  { key: "maneuver_answer", label: "Maneuver" },
  { key: "maneuver_confidence_percent", label: "Man Conf%" },
  { key: "final_submission_timestamp", label: "Submitted" },
];

export default function AdminTable({
  rows,
  videoLibrary,
  feedback,
}: {
  rows: AnswerRow[];
  videoLibrary: VideoLibItem[];
  feedback: { user_id: string; scores: number[] }[];
}) {
  const [tab, setTab] = useState<"answers" | "videos">("answers");
  const [filter, setFilter] = useState("");

  // Quick lookup: user_id -> their feedback scores.
  const feedbackByUser = new Map<string, number[]>();
  for (const f of feedback) feedbackByUser.set(f.user_id, f.scores);

  return (
    <div>
      {/* Tabs + search bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 4, background: "var(--bg-elev)", padding: 4, borderRadius: 10, border: "1px solid var(--line)" }}>
          <TabBtn active={tab === "answers"} onClick={() => setTab("answers")}>Answers</TabBtn>
          <TabBtn active={tab === "videos"} onClick={() => setTab("videos")}>Video Library</TabBtn>
        </div>
        {tab === "answers" && (
          <>
            <input
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Search by Video ID…"
              style={{ maxWidth: 260 }}
            />
            <button
              onClick={() => downloadCsv(rows)}
              disabled={rows.length === 0}
              style={{
                background: "var(--accent)", color: "#fff", border: "none",
                borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 500,
                opacity: rows.length === 0 ? 0.5 : 1,
                cursor: rows.length === 0 ? "not-allowed" : "pointer",
                marginLeft: "auto",
              }}
            >
              ↓ Download CSV
            </button>
          </>
        )}
      </div>

      {tab === "answers" ? (
        <AnswersView rows={rows} filter={filter} feedbackByUser={feedbackByUser} />
      ) : (
        <VideoLibraryView items={videoLibrary} />
      )}
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: active ? "var(--accent)" : "transparent",
        color: active ? "#fff" : "var(--ink-dim)",
        border: "none", borderRadius: 7, padding: "8px 16px",
        fontSize: 13.5, fontWeight: 500,
      }}
    >
      {children}
    </button>
  );
}

// ---- ANSWERS TAB ----
function AnswersView({ rows, filter, feedbackByUser }: { rows: AnswerRow[]; filter: string; feedbackByUser: Map<string, number[]> }) {
  if (rows.length === 0) {
    return (
      <div style={{ background: "var(--bg-card)", border: "1px dashed var(--line)", borderRadius: 10, padding: 48, textAlign: "center", color: "var(--ink-dim)" }}>
        No answers submitted yet. Rows will appear here as test takers complete questions.
      </div>
    );
  }

  const byUser = new Map<string, AnswerRow[]>();
  for (const r of rows) {
    if (!byUser.has(r.user_id)) byUser.set(r.user_id, []);
    byUser.get(r.user_id)!.push(r);
  }
  const users = Array.from(byUser.keys()).sort();

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
      {users.map((user) => {
        const userRows = byUser
          .get(user)!
          .filter((r) => (filter ? String(r.video_id).toLowerCase().includes(filter.trim().toLowerCase()) : true))
          .sort((a, b) => {
            const ia = VIDEO_ORDER.indexOf(String(a.video_id));
            const ib = VIDEO_ORDER.indexOf(String(b.video_id));
            return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
          });

        const totals = userTotals(byUser.get(user)!);

        return (
          <section key={user}>
            <h2 style={{ fontSize: 18, marginBottom: 12, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <span>
                {user}{" "}
                <span style={{ color: "var(--ink-dim)", fontSize: 13, fontWeight: 400 }}>
                  ({byUser.get(user)!.length} video{byUser.get(user)!.length === 1 ? "" : "s"})
                </span>
              </span>
              {totals.any && (
                <span style={{
                  background: "rgba(13,148,136,0.12)", color: "var(--accent)",
                  border: "1px solid var(--accent)", borderRadius: 7,
                  padding: "4px 12px", fontSize: 13.5, fontWeight: 700,
                  fontFamily: "var(--font-mono), monospace",
                }}>
                  {totals.earned}/{totals.max} points
                </span>
              )}
              {/^tester\d+$/.test(user) && (
                <button
                  onClick={async () => {
                    if (!confirm(`Delete ALL data for ${user}? This cannot be undone.`)) return;
                    const res = await fetch("/api/admin/delete-user-data", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId: user }),
                    });
                    if ((await res.json()).ok) window.location.reload();
                  }}
                  style={{
                    background: "transparent", color: "var(--danger)",
                    border: "1px solid var(--danger)", borderRadius: 7,
                    padding: "5px 12px", fontSize: 12.5, fontWeight: 500,
                  }}
                >
                  Delete {user} data
                </button>
              )}
            </h2>

            {userRows.length === 0 ? (
              <div style={{ color: "var(--ink-faint)", fontSize: 13, padding: "8px 2px" }}>
                No video matches that ID for this clinician.
              </div>
            ) : (
              <div style={{ overflowX: "auto", border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg-card)" }}>
                <table className="mono" style={{ borderCollapse: "collapse", width: "100%", fontSize: 12.5, whiteSpace: "nowrap" }}>
                  <thead>
                    <tr>
                      {COLS.map((c) => (
                        <th key={c.key} style={{ textAlign: "left", padding: "12px 14px", color: "var(--ink-dim)", borderBottom: "1px solid var(--line)", background: "var(--bg-elev)", fontWeight: 500, letterSpacing: "0.03em" }}>
                          {c.label}
                        </th>
                      ))}
                      {["1a pts", "1b pts", "1c pts", "Q total"].map((l) => (
                        <th key={l} style={{ textAlign: "left", padding: "12px 14px", color: "var(--accent)", borderBottom: "1px solid var(--line)", background: "var(--bg-elev)", fontWeight: 600, letterSpacing: "0.03em" }}>
                          {l}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {userRows.map((r, i) => {
                      const p = rowPoints(r);
                      return (
                      <tr key={r.id} style={{ background: i % 2 ? "transparent" : "rgba(0,0,0,0.02)" }}>
                        {COLS.map((c) => (
                          <td key={c.key} style={{ padding: "10px 14px", borderBottom: "1px solid var(--line-soft)", color: cellColor(c.key, r) }}>
                            {c.key === "maneuver_answer"
                              ? <ManeuverCell videoId={String(r.video_id)} answer={r.maneuver_answer} />
                              : c.key === "otolith_location_answer" && OTOLITH_MULTI_VIDEOS.has(String(r.video_id))
                              ? <OtolithMultiCell videoId={String(r.video_id)} answer={r.otolith_location_answer} />
                              : formatCell(c.key, r[c.key])}
                          </td>
                        ))}
                        <td style={ptTd}>{ptCell(p.a)}</td>
                        <td style={ptTd}>{ptCell(p.b)}</td>
                        <td style={ptTd}>{ptCell(p.c)}</td>
                        <td style={{ ...ptTd, fontWeight: 700, color: "var(--accent)" }}>
                          {p.scored && p.total !== null ? `${p.earned}/${p.total}` : "—"}
                        </td>
                      </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
            <FeedbackDisplay scores={feedbackByUser.get(user)} />
          </section>
        );
      })}
    </div>
  );
}

// ---- VIDEO LIBRARY TAB ----
function VideoLibraryView({ items }: { items: VideoLibItem[] }) {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div style={{ border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg-card)", overflow: "auto" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", fontSize: 13.5, whiteSpace: "nowrap" }}>
        <thead>
          <tr>
            <th style={thLib}>Video ID</th>
            <th style={thLib}>Answer A (1a)</th>
            <th style={thLib}>Duration</th>
            <th style={thLib}>Position</th>
            <th style={thLib}>Answer B (1b)</th>
            <th style={thLib}>Answer C (1c)</th>
            <th style={thLib}>Video</th>
          </tr>
        </thead>
        <tbody>
          {items.map((v) => (
            <Fragment key={v.id}>
              <tr>
                <td style={{ ...tdLib, color: "var(--accent)", fontFamily: "var(--font-mono), monospace", fontWeight: 600 }}>{v.id}</td>
                <td style={{ ...tdLib, color: "#000", fontSize: 13 }}>{v.answerA ?? "—"}</td>
                <td style={{ ...tdLib, color: "#000", fontSize: 13 }}>{v.duration ? `${v.duration} sec` : "—"}</td>
                <td style={{ ...tdLib, color: "#000", fontSize: 13 }}>{v.position}</td>
                <td style={{ ...tdLib, color: "#000", fontSize: 13 }}>{v.answerB ?? "—"}</td>
                <td style={{ ...tdLib, color: "#000", fontSize: 13 }}>{v.answerC ?? "—"}</td>
                <td style={tdLib}>
                  {v.url ? (
                    <button
                      onClick={() => setOpen(open === v.id ? null : v.id)}
                      style={{ background: open === v.id ? "var(--accent)" : "transparent", color: open === v.id ? "#fff" : "var(--accent)", border: "1px solid var(--accent)", borderRadius: 7, padding: "6px 14px", fontSize: 13, fontWeight: 500 }}
                    >
                      {open === v.id ? "Hide" : "▶ Play"}
                    </button>
                  ) : (
                    <span style={{ color: "#000", fontSize: 13 }}>No video yet</span>
                  )}
                </td>
              </tr>
              {open === v.id && v.url && (
                <tr>
                  <td colSpan={7} style={{ padding: "0 14px 18px", borderBottom: "1px solid var(--line-soft)" }}>
                    <video src={v.url} controls style={{ width: "100%", maxWidth: 640, borderRadius: 10, background: "#000", display: "block" }} />
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const thLib: React.CSSProperties = { textAlign: "left", padding: "13px 14px", color: "var(--ink-dim)", borderBottom: "1px solid var(--line)", background: "var(--bg-elev)", fontWeight: 500, fontSize: 13 };
const tdLib: React.CSSProperties = { padding: "12px 14px", borderBottom: "1px solid var(--line-soft)", verticalAlign: "middle" };
const ptTd: React.CSSProperties = { padding: "10px 14px", borderBottom: "1px solid var(--line-soft)", color: "var(--ink)", textAlign: "left" };

// Shows a clinician's end-of-study feedback scores (0-5 each), or nothing if
// they haven't submitted feedback yet.
function FeedbackDisplay({ scores }: { scores: number[] | undefined }) {
  if (!scores || scores.length === 0) return null;
  return (
    <div style={{ marginTop: 16, border: "1px solid var(--line)", borderRadius: 10, background: "var(--bg-card)", padding: "16px 20px" }}>
      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12, color: "var(--accent)" }}>
        Feedback responses (0–5)
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {FEEDBACK_QUESTIONS.map((q, i) => (
          <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 10, fontSize: 13.5 }}>
            <span className="mono" style={{ color: "var(--accent)", fontWeight: 700, minWidth: 24 }}>
              {scores[i] ?? "—"}
            </span>
            <span style={{ color: "var(--ink-dim)" }}>{i + 1}. {q.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Renders a multi-select otolith answer (e.g. 8D) with EACH answer colored
// individually: green if correct, red if not.
function OtolithMultiCell({ videoId, answer }: { videoId: string; answer: string | null }) {
  if (!answer) return <>—</>;
  const parts = answer.split(";").map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {parts.map((m, i) => {
        const ok = isOtolithInKey(videoId, m);
        const color = ok === null ? "var(--ink)" : ok ? "#16a34a" : "#dc2626";
        return (
          <span key={i} style={{ color }}>
            {m}{i < parts.length - 1 ? "; " : ""}
          </span>
        );
      })}
    </>
  );
}

// Renders the maneuver answer with EACH maneuver colored individually:
// green if it's a correct maneuver for this video, red if not. So when a
// clinician gets 1 of 2 right, only the wrong one shows red.
function ManeuverCell({ videoId, answer }: { videoId: string; answer: string | null }) {
  if (!answer) return <>—</>;
  const parts = answer.split(";").map((p) => p.trim()).filter(Boolean);
  return (
    <>
      {parts.map((m, i) => {
        const ok = isManeuverInKey(videoId, m);
        const color = ok === null ? "var(--ink)" : ok ? "#16a34a" : "#dc2626";
        return (
          <span key={i} style={{ color }}>
            {m}{i < parts.length - 1 ? "; " : ""}
          </span>
        );
      })}
    </>
  );
}

// Determines the text color of a cell. Greens/reds the graded answer cells
// (final 1a classification, 1b otolith, 1c maneuver); leaves others default.
function cellColor(key: keyof AnswerRow, r: AnswerRow): string {
  const vid = String(r.video_id);
  let correct: boolean | null = null;
  if (key === "final_classification") correct = isCorrectSingle(vid, "a", r.final_classification);
  else if (key === "otolith_location_answer") correct = isCorrectSingle(vid, "b", r.otolith_location_answer);
  // maneuver_answer is colored per-maneuver by <ManeuverCell>, so leave default here.
  else return key === "video_id" ? "var(--accent)" : "var(--ink)";

  if (correct === null) return "var(--ink)"; // no key / no answer -> default
  return correct ? "#16a34a" : "#dc2626";    // green : red
}

function formatCell(key: keyof AnswerRow, val: unknown): string {
  if (val === null || val === undefined || val === "") return "—";
  if (typeof val === "number" && key.includes("time")) return val.toFixed(1);
  // Submission timestamps are stored as UTC ("YYYY-MM-DD HH:MM:SS"); show them in
  // US Eastern time (America/New_York handles EST/EDT daylight saving automatically).
  if (key === "final_submission_timestamp" || key === "initial_submission_timestamp") {
    return toEastern(String(val));
  }
  return String(val);
}

// Convert a UTC datetime string from SQLite into a readable US Eastern timestamp.
function toEastern(utc: string): string {
  // SQLite gives "2026-06-19 20:52:39" (UTC, no zone). Append 'Z' so it parses as UTC.
  const iso = utc.includes("T") ? utc : utc.replace(" ", "T") + "Z";
  const d = new Date(iso);
  if (isNaN(d.getTime())) return utc; // fall back to raw string if unparseable
  return d.toLocaleString("en-US", {
    timeZone: "America/New_York",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
    hour12: false,
  }) + " ET";
}

// Per-row points for 1a (final), 1b, 1c, and their per-question total.
function rowPoints(r: AnswerRow) {
  const vid = String(r.video_id);
  const a = points1a(vid, r.final_classification);
  const b = points1b(vid, r.otolith_location_answer);
  const c = points1c(vid, r.maneuver_answer);
  const mp = maxPoints(vid);
  const earned =
    (a ?? 0) + (b ?? 0) + (c ?? 0);
  const total = mp ? mp.total : null; // max for this video
  const scored = a !== null || b !== null || c !== null;
  return { a, b, c, earned, total, scored };
}

// Sum a user's earned and max points across all their completed videos.
function userTotals(rows: AnswerRow[]) {
  let earned = 0;
  let max = 0;
  let any = false;
  for (const r of rows) {
    const p = rowPoints(r);
    if (p.scored && p.total !== null) {
      earned += p.earned;
      max += p.total;
      any = true;
    }
  }
  return { earned, max, any };
}

function ptCell(v: number | null): string {
  return v === null ? "—" : String(v);
}

// Builds and downloads a CSV of ALL answer rows, organised like the admin
// table (User first, then the same columns, sorted by user then video order).
function downloadCsv(rows: AnswerRow[]) {
  const csvCols: { key: keyof AnswerRow; label: string }[] = [
    { key: "user_id", label: "User" },
    ...COLS,
  ];

  const sorted = [...rows].sort((a, b) => {
    if (a.user_id !== b.user_id) return a.user_id.localeCompare(b.user_id);
    const ia = VIDEO_ORDER.indexOf(String(a.video_id));
    const ib = VIDEO_ORDER.indexOf(String(b.video_id));
    return (ia === -1 ? 9999 : ia) - (ib === -1 ? 9999 : ib);
  });

  const esc = (v: unknown): string => {
    if (v === null || v === undefined) return "";
    const s = String(v);
    // Quote if it contains comma, quote, or newline.
    if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };

  const header = csvCols.map((c) => esc(c.label)).join(",");
  const lines = sorted.map((r) =>
    csvCols.map((c) => {
      const isTs = c.key === "final_submission_timestamp" || c.key === "initial_submission_timestamp";
      const raw = r[c.key];
      return esc(isTs && raw ? toEastern(String(raw)) : raw);
    }).join(",")
  );
  const csv = [header, ...lines].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  const stamp = new Date().toISOString().slice(0, 10);
  a.href = url;
  a.download = `smartvertigo_results_${stamp}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}