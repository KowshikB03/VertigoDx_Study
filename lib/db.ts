import { createClient } from "@libsql/client";

// ============================================================
// DATABASE — Turso (hosted libSQL / SQLite).
// Set these in your environment (.env.local for dev, Netlify env vars for prod):
//   TURSO_DATABASE_URL = libsql://your-db-name-you.turso.io
//   TURSO_AUTH_TOKEN   = (token from `turso db tokens create ...`)
// All functions are ASYNC (network calls), so callers must await them.
// ============================================================

const db = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!,
});

// Create the table on first use (id-once guard so we only run it once per process).
let initDone: Promise<void> | null = null;
function ensureTable(): Promise<void> {
  if (!initDone) {
    initDone = db
      .execute(`
        CREATE TABLE IF NOT EXISTS answers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id TEXT NOT NULL,
          video_id TEXT NOT NULL,
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
      `)
      .then(() => undefined);
  }
  return initDone;
}

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

// libSQL returns rows as plain objects already; cast through unknown for types.
function asRows(rows: unknown[]): AnswerRow[] {
  return rows as unknown as AnswerRow[];
}

export async function getAllAnswers(): Promise<AnswerRow[]> {
  await ensureTable();
  const res = await db.execute("SELECT * FROM answers ORDER BY user_id, video_id");
  return asRows(res.rows);
}

export async function getRow(userId: string, videoId: string): Promise<AnswerRow | undefined> {
  await ensureTable();
  const res = await db.execute({
    sql: "SELECT * FROM answers WHERE user_id = ? AND video_id = ?",
    args: [userId, videoId],
  });
  return res.rows.length ? (res.rows[0] as unknown as AnswerRow) : undefined;
}

export async function saveInitial(p: {
  userId: string; videoId: string; videoPosition: string;
  classification: string; confidence: number; responseTime: number;
}) {
  const existing = await getRow(p.userId, p.videoId);
  if (existing && existing.initial_classification) {
    return { ok: false, reason: "initial_already_submitted" as const };
  }
  await db.execute({
    sql: `INSERT INTO answers
       (user_id, video_id, video_position,
        initial_classification, initial_confidence_percent,
        initial_response_time_seconds, initial_submission_timestamp)
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    args: [p.userId, p.videoId, p.videoPosition, p.classification, p.confidence, p.responseTime],
  });
  return { ok: true as const };
}

export async function saveFinal(p: {
  userId: string; videoId: string; classification: string; confidence: number;
  replayCount: number; finalResponseTime: number; uncertain: boolean;
}) {
  const row = await getRow(p.userId, p.videoId);
  if (!row || !row.initial_classification) return { ok: false, reason: "no_initial" as const };
  if (row.final_classification) return { ok: false, reason: "final_already_submitted" as const };
  const total = (row.initial_response_time_seconds || 0) + p.finalResponseTime;
  await db.execute({
    sql: `UPDATE answers SET
       final_classification = ?, final_confidence_percent = ?, replay_count = ?,
       final_response_time_seconds = ?, total_classification_time_seconds = ?,
       uncertain_flag = ?, final_submission_timestamp = datetime('now')
     WHERE user_id = ? AND video_id = ?`,
    args: [p.classification, p.confidence, p.replayCount, p.finalResponseTime, total,
           p.uncertain ? 1 : 0, p.userId, p.videoId],
  });
  return { ok: true as const };
}

export async function saveOtolith(p: {
  userId: string; videoId: string; answer: string; confidence: number; responseTime: number;
}) {
  await db.execute({
    sql: `UPDATE answers SET
       otolith_location_answer = ?, otolith_confidence_percent = ?, otolith_response_time_seconds = ?
     WHERE user_id = ? AND video_id = ?`,
    args: [p.answer, p.confidence, p.responseTime, p.userId, p.videoId],
  });
  return { ok: true as const };
}

export async function saveManeuver(p: {
  userId: string; videoId: string; answer: string; confidence: number; responseTime: number;
}) {
  await db.execute({
    sql: `UPDATE answers SET
       maneuver_answer = ?, maneuver_confidence_percent = ?, maneuver_response_time_seconds = ?
     WHERE user_id = ? AND video_id = ?`,
    args: [p.answer, p.confidence, p.responseTime, p.userId, p.videoId],
  });
  return { ok: true as const };
}

export async function nextUnansweredVideo(userId: string, order: string[]): Promise<string | null> {
  await ensureTable();
  const res = await db.execute({
    sql: "SELECT video_id, maneuver_answer FROM answers WHERE user_id = ?",
    args: [userId],
  });
  const complete = new Set(
    (res.rows as unknown as { video_id: string; maneuver_answer: string | null }[])
      .filter((r) => r.maneuver_answer)
      .map((r) => String(r.video_id))
  );
  for (const code of order) if (!complete.has(code)) return code;
  return null;
}

export async function videoState(userId: string, videoId: string) {
  const row = await getRow(userId, videoId);
  return {
    hasInitial: !!row?.initial_classification,
    hasFinal: !!row?.final_classification,
    hasOtolith: !!row?.otolith_location_answer,
    hasManeuver: !!row?.maneuver_answer,
  };
}

// Remaining (not-yet-completed) videos, shuffled by seed.
export async function remainingShuffled(userId: string, order: string[], seed: number): Promise<string[]> {
  await ensureTable();
  const res = await db.execute({
    sql: "SELECT video_id, maneuver_answer FROM answers WHERE user_id = ?",
    args: [userId],
  });
  const complete = new Set(
    (res.rows as unknown as { video_id: string; maneuver_answer: string | null }[])
      .filter((r) => r.maneuver_answer)
      .map((r) => String(r.video_id))
  );
  const remaining = order.filter((c) => !complete.has(c));
  let s = seed >>> 0 || 1;
  const rng = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let i = remaining.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
  }
  return remaining;
}

export async function completedCount(userId: string): Promise<number> {
  await ensureTable();
  const res = await db.execute({
    sql: "SELECT video_id FROM answers WHERE user_id = ? AND maneuver_answer IS NOT NULL",
    args: [userId],
  });
  return res.rows.length;
}