import { DatabaseSync } from "node:sqlite";
import path from "path";
import fs from "fs";

// Uses Node's BUILT-IN SQLite (node:sqlite) — no native compile, no
// Visual Studio, no better-sqlite3. Requires Node 22.5+ (you have 24).
const dataDir = path.join(process.cwd(), "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const db = new DatabaseSync(path.join(dataDir, "study.db"));
db.exec("PRAGMA journal_mode = WAL;");

// One row per question answered. Each question saved independently.
// initial_* columns are written once and never updated (no-overwrite rule).
db.exec(`
  CREATE TABLE IF NOT EXISTS answers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    video_id INTEGER NOT NULL,
    video_position TEXT,

    initial_classification TEXT,
    initial_confidence_percent INTEGER,
    initial_response_time_seconds REAL,
    initial_submission_timestamp TEXT,

    replay_count INTEGER,
    final_classification TEXT,
    final_confidence_percent INTEGER,
    final_response_time_seconds REAL,
    total_classification_time_seconds REAL,
    final_submission_timestamp TEXT,
    uncertain_flag INTEGER DEFAULT 0,

    otolith_location_answer TEXT,
    otolith_confidence_percent INTEGER,
    otolith_response_time_seconds REAL,

    maneuver_answer TEXT,
    maneuver_confidence_percent INTEGER,
    maneuver_response_time_seconds REAL,

    created_at TEXT DEFAULT (datetime('now'))
  );
`);

export default db;

export interface AnswerRow {
  id: number;
  user_id: string;
  video_id: string;
  video_position: string | null;
  initial_classification: string | null;
  initial_confidence_percent: number | null;
  initial_response_time_seconds: number | null;
  initial_submission_timestamp: string | null;
  replay_count: number | null;
  final_classification: string | null;
  final_confidence_percent: number | null;
  final_response_time_seconds: number | null;
  total_classification_time_seconds: number | null;
  final_submission_timestamp: string | null;
  uncertain_flag: number;
  otolith_location_answer: string | null;
  otolith_confidence_percent: number | null;
  otolith_response_time_seconds: number | null;
  maneuver_answer: string | null;
  maneuver_confidence_percent: number | null;
  maneuver_response_time_seconds: number | null;
  created_at: string;
}

export function getAllAnswers(): AnswerRow[] {
  const rows = db
    .prepare("SELECT * FROM answers ORDER BY user_id, video_id")
    .all();
  // node:sqlite returns null-prototype objects, which Next.js refuses to pass
  // from a Server Component to a Client Component. Spread into plain objects.
  return rows.map((r) => ({ ...r })) as unknown as AnswerRow[];
}

// ---- Phase 2: write + progress helpers ----

export function getRow(userId: string, videoId: string): AnswerRow | undefined {
  const row = db
    .prepare("SELECT * FROM answers WHERE user_id = ? AND video_id = ?")
    .get(userId, videoId);
  return row ? ({ ...row } as unknown as AnswerRow) : undefined;
}

// Step 1 — initial answer. Creates the row ONCE. If a row already exists
// (initial already submitted), this is a no-op so the initial answer can
// never be overwritten.
export function saveInitial(p: {
  userId: string;
  videoId: string;
  videoPosition: string;
  classification: string;
  confidence: number;
  responseTime: number;
}) {
  const existing = getRow(p.userId, p.videoId);
  if (existing && existing.initial_classification) {
    return { ok: false, reason: "initial_already_submitted" as const };
  }
  db.prepare(
    `INSERT INTO answers
       (user_id, video_id, video_position,
        initial_classification, initial_confidence_percent,
        initial_response_time_seconds, initial_submission_timestamp)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`
  ).run(
    p.userId,
    p.videoId,
    p.videoPosition,
    p.classification,
    p.confidence,
    p.responseTime
  );
  return { ok: true as const };
}

// Step 2 — final answer + replay data. Updates the existing row but never
// touches the initial_* columns.
export function saveFinal(p: {
  userId: string;
  videoId: string;
  classification: string;
  confidence: number;
  replayCount: number;
  finalResponseTime: number;
  uncertain: boolean;
}) {
  const row = getRow(p.userId, p.videoId);
  if (!row || !row.initial_classification) {
    return { ok: false, reason: "no_initial" as const };
  }
  if (row.final_classification) {
    return { ok: false, reason: "final_already_submitted" as const };
  }
  const total =
    (row.initial_response_time_seconds || 0) + p.finalResponseTime;
  db.prepare(
    `UPDATE answers SET
       final_classification = ?,
       final_confidence_percent = ?,
       replay_count = ?,
       final_response_time_seconds = ?,
       total_classification_time_seconds = ?,
       uncertain_flag = ?,
       final_submission_timestamp = datetime('now')
     WHERE user_id = ? AND video_id = ?`
  ).run(
    p.classification,
    p.confidence,
    p.replayCount,
    p.finalResponseTime,
    total,
    p.uncertain ? 1 : 0,
    p.userId,
    p.videoId
  );
  return { ok: true as const };
}

// Step 3 — otolith (Q1b)
export function saveOtolith(p: {
  userId: string;
  videoId: string;
  answer: string;
  confidence: number;
  responseTime: number;
}) {
  db.prepare(
    `UPDATE answers SET
       otolith_location_answer = ?,
       otolith_confidence_percent = ?,
       otolith_response_time_seconds = ?
     WHERE user_id = ? AND video_id = ?`
  ).run(p.answer, p.confidence, p.responseTime, p.userId, p.videoId);
  return { ok: true as const };
}

// Step 4 — maneuver (Q1c). This completes the question set.
export function saveManeuver(p: {
  userId: string;
  videoId: string;
  answer: string;
  confidence: number;
  responseTime: number;
}) {
  db.prepare(
    `UPDATE answers SET
       maneuver_answer = ?,
       maneuver_confidence_percent = ?,
       maneuver_response_time_seconds = ?
     WHERE user_id = ? AND video_id = ?`
  ).run(p.answer, p.confidence, p.responseTime, p.userId, p.videoId);
  return { ok: true as const };
}

// Resume logic: the next video a tester should see is the first code in the
// configured order whose row is missing OR not fully complete (no maneuver).
export function nextUnansweredVideo(userId: string, order: string[]): string | null {
  const rows = db
    .prepare("SELECT video_id, maneuver_answer FROM answers WHERE user_id = ?")
    .all(userId) as { video_id: string; maneuver_answer: string | null }[];
  const complete = new Set(
    rows.filter((r) => r.maneuver_answer).map((r) => String(r.video_id))
  );
  for (const code of order) {
    if (!complete.has(code)) return code;
  }
  return null; // all done
}

// In-progress state for one video, so the UI knows which step to show.
export function videoState(userId: string, videoId: string) {
  const row = getRow(userId, videoId);
  return {
    hasInitial: !!row?.initial_classification,
    hasFinal: !!row?.final_classification,
    hasOtolith: !!row?.otolith_location_answer,
    hasManeuver: !!row?.maneuver_answer,
  };
}
// ---- Shuffle resume: among NOT-yet-completed videos, return them in a
// random order (seeded so a single page render is stable). Completed videos
// are excluded, so resume always continues with remaining videos only.
export function remainingShuffled(userId: string, order: string[], seed: number): string[] {
  const rows = db
    .prepare("SELECT video_id, maneuver_answer FROM answers WHERE user_id = ?")
    .all(userId) as { video_id: string; maneuver_answer: string | null }[];
  const complete = new Set(
    rows.filter((r) => r.maneuver_answer).map((r) => String(r.video_id))
  );
  const remaining = order.filter((c) => !complete.has(c));
  // Seeded Fisher-Yates so the same seed yields the same order within a login.
  let s = seed >>> 0 || 1;
  const rng = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  return remaining;
}

// Count of fully-completed videos for a user (for "X of N" progress).
export function completedCount(userId: string): number {
  const rows = db
    .prepare("SELECT video_id FROM answers WHERE user_id = ? AND maneuver_answer IS NOT NULL")
    .all(userId) as { video_id: string }[];
  return rows.length;
}