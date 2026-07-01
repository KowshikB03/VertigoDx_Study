// ============================================================
// ANSWER KEY — correct answers per video, from the study spreadsheet.
// Used by the admin table to color clinician answers green/red.
// Values match lib/options.ts exactly (leading numbers stripped).
// Note: 29UCC has no key entry, so its answers are shown uncolored.
// ============================================================

export interface AnswerKeyEntry {
  a: string;      // correct 1a classification
  b: string;      // correct 1b otolith location (primary)
  bMulti?: string[]; // OPTIONAL: when 1b accepts multiple answers (checkboxes), the full correct set
  c: string[];    // correct 1c maneuver(s), 1 or 2
}

// Videos whose 1b is answered with CHECKBOXES (max 2) instead of a single radio.
// Only these videos use the multi-select otolith UI + per-answer scoring.
export const OTOLITH_MULTI_VIDEOS = new Set<string>(["8D"]);
export const MAX_OTOLITH_MULTI = 2;

export const ANSWER_KEY: Record<string, AnswerKeyEntry> = {
  "16UC": { a: "Up-beating Torsional Clockwise", b: "Posterior Canal (PC): Left", c: ["Epley Maneuver Left", "Semont Maneuver Left"] },
  "27RHN": { a: "Right-beating", b: "Horizontal Canal (HC): Right", c: ["BBQ Roll (Lempert) Right", "Appiani Maneuver Right", "Casani Maneuver Right"] },
  "5D": { a: "Down-beating Torsional Counter Clockwise", b: "Anterior Canal (AC): Left", c: ["Yacovino Maneuver", "Reverse Semont Maneuver Left"] },
  "22LHN": { a: "Left-beating", b: "Horizontal Cupula (HC): Right", c: ["Gufoni Maneuver Right", "Kim Maneuver Right"] },
  "10UCC": { a: "Up-beating Torsional Counter Clockwise", b: "Posterior Canal (PC): Right", c: ["Epley Maneuver Right", "Semont Maneuver Right"] },
  "8D": { a: "Down-beating Torsional Clockwise", b: "Anterior Canal (AC): Right", bMulti: ["Anterior Canal (AC): Right", "Short Arm Posterior Canal (PC): Right"], c: ["Yacovino Maneuver", "Demi-Semont Right"] },
  "21LHN": { a: "Left-beating", b: "Horizontal Canal (HC): Left", c: ["BBQ Roll (Lempert) Left", "Appiani Maneuver Left", "Casani Maneuver Left"] },
  "28UCC": { a: "Up-beating Torsional Counter Clockwise", b: "Posterior Cupula (PC): Right", c: ["Semont Maneuver Right", "Head Shakes / Mastoid Vibration"] },
  "1D": { a: "Down-beating Non-Torsional", b: "Anterior Cupula (AC): Left", c: ["Yacovino Maneuver", "Reverse Semont Maneuver Left"] },
  "14UC": { a: "Up-beating Torsional Clockwise", b: "Posterior Cupula (PC): Left", c: ["Semont Maneuver Left", "Head Shakes / Mastoid Vibration"] },
  "17LHN": { a: "Left-beating", b: "Horizontal Canal (HC): Left", c: ["BBQ Roll (Lempert) Left", "Casani Maneuver Left"] },
  "8UCC": { a: "Up-beating Torsional Counter Clockwise", b: "Posterior Canal (PC): Right", c: ["Epley Maneuver Right", "Semont Maneuver Right"] },
  "2D": { a: "Down-beating Non-Torsional", b: "Anterior Cupula (AC): Left", c: ["Reverse Semont Maneuver Left", "Yacovino Maneuver"] },
  "23LHN": { a: "Right-beating", b: "Horizontal Cupula (HC): Left", c: ["Gufoni Maneuver Left", "Kim Maneuver Left"] },
  "3D": { a: "Down-beating Non-Torsional", b: "Anterior Cupula (AC): Right", c: ["Reverse Semont Maneuver Right", "Head Shakes / Mastoid Vibration"] },
  "13UC": { a: "Up-beating Torsional Clockwise", b: "Posterior Canal (PC): Left", c: ["Epley Maneuver Left", "Semont Maneuver Left"] },
  "20LHN": { a: "Left-beating", b: "Horizontal Canal (HC): Left", c: ["BBQ Roll (Lempert) Left"] },
  "7D": { a: "Down-beating Torsional Counter Clockwise", b: "Anterior Canal (AC): Left", c: ["Reverse Semont Maneuver Left", "Yacovino Maneuver"] },
  "24RHN": { a: "Right-beating", b: "Horizontal Cupula (HC): Right", c: ["Kim Maneuver Right", "Gufoni Maneuver Right"] },
  "15UC": { a: "Up-beating Torsional Clockwise", b: "Posterior Cupula (PC): Left", c: ["Reverse Semont Maneuver Left", "Head Shakes / Mastoid Vibration"] },
  "18LHN": { a: "Left-beating", b: "Horizontal Canal (HC): Left", c: ["BBQ Roll (Lempert) Left", "Casani Maneuver Left"] },
  "26RHN": { a: "Right-beating", b: "Horizontal Canal (HC): Right", c: ["BBQ Roll (Lempert) Right", "Appiani Maneuver Right", "Casani Maneuver Right"] },
  "32UCC": { a: "Up-beating Torsional Counter Clockwise", b: "Posterior Cupula (PC): Right", c: ["Semont Maneuver Right", "Head Shakes / Mastoid Vibration"] },
  "6D": { a: "Down-beating Non-Torsional", b: "Anterior Canal (AC): Right", c: ["Yacovino Maneuver", "Reverse Semont Maneuver Right"] },
  "29UCC": { a: "Up-beating Torsional Counter Clockwise ", b: "Posterior Canal (PC): Right", c: ["Epley Maneuver Right", "Semont Maneuver Right"] },
};
 
  // Strip a leading "N. " number so stored answers and key align.
  function norm(s: string | null | undefined): string {
    if (!s) return "";
    return s.replace(/^\d+\.\s*/, "").replace(/\u00a0/g, " ").trim().toLowerCase();
  }
  
  // 1a / 1b: simple single-value match.
  export function isCorrectSingle(videoId: string, field: "a" | "b", answer: string | null): boolean | null {
    const k = ANSWER_KEY[videoId];
    if (!k || !answer) return null; // no key or no answer -> uncolored
    return norm(answer) === norm(k[field]);
  }
  
  // 1c: clinician answer is a combined string like "Epley Maneuver Right; Semont Maneuver Left".
  // Correct only if the SET of selected maneuvers equals the SET of correct ones
  // (order-independent, and counts must match).
  export function isCorrectManeuver(videoId: string, answer: string | null): boolean | null {
    const k = ANSWER_KEY[videoId];
    if (!k || !answer) return null;
    const given = answer.split(";").map(norm).filter(Boolean).sort();
    const correct = k.c.map(norm).filter(Boolean).sort();
    if (given.length !== correct.length) return false;
    return given.every((g, i) => g === correct[i]);
  }
  // ---- POINT SCORING ----
  // 1a: 2 points if final classification correct, else 0.
  // 1b: 2 points if otolith correct, else 0.
  // 1c: 1 point per correctly-selected maneuver (max 2), no penalty for a wrong
  //     extra pick. Max for the question = number of correct answers in the key,
  //     but capped at 2.
  // If a video has no key entry, points are null (not scored).
 
  export function points1a(videoId: string, finalClassification: string | null): number | null {
    const r = isCorrectSingle(videoId, "a", finalClassification);
    if (r === null) return null;
    return r ? 2 : 0;
  }
 
  export function points1b(videoId: string, otolith: string | null): number | null {
    const k = ANSWER_KEY[videoId];
    if (!k) return null;
    // Multi-answer 1b (e.g. 8D): 1 point per correct otolith selected, max 2, no penalty.
    if (k.bMulti && OTOLITH_MULTI_VIDEOS.has(videoId)) {
      if (!otolith) return 0;
      const given = otolith.split(";").map(norm).filter(Boolean);
      const correct = new Set(k.bMulti.map(norm).filter(Boolean));
      const seen = new Set<string>();
      let pts = 0;
      for (const g of given) {
        if (correct.has(g) && !seen.has(g)) { pts += 1; seen.add(g); }
      }
      return Math.min(MAX_OTOLITH_MULTI, pts);
    }
    const r = isCorrectSingle(videoId, "b", otolith);
    if (r === null) return null;
    return r ? 2 : 0;
  }

  // Is a SINGLE otolith answer part of the correct set (for multi-answer 1b)?
  export function isOtolithInKey(videoId: string, oneOtolith: string): boolean | null {
    const k = ANSWER_KEY[videoId];
    if (!k || !k.bMulti) return null;
    const correct = new Set(k.bMulti.map(norm).filter(Boolean));
    return correct.has(norm(oneOtolith));
  }
 
  export function points1c(videoId: string, maneuverAnswer: string | null): number | null {
    const k = ANSWER_KEY[videoId];
    if (!k) return null;
    if (!maneuverAnswer) return 0;
    const given = maneuverAnswer.split(";").map(norm).filter(Boolean);
    const correct = new Set(k.c.map(norm).filter(Boolean));
    // 1 point for each given maneuver that is in the correct set (no double count).
    const seen = new Set<string>();
    let pts = 0;
    for (const g of given) {
      if (correct.has(g) && !seen.has(g)) {
        pts += 1;
        seen.add(g);
      }
    }
    return Math.min(2, pts); // max 2 points
  }
 
  // Max points available for a video (depends on how many correct answers exist).
  export function maxPoints(videoId: string): { a: number; b: number; c: number; total: number } | null {
    const k = ANSWER_KEY[videoId];
    if (!k) return null;
    const cMax = Math.min(2, k.c.length); // 1c max = number of correct maneuvers, capped 2
    const bMax = (k.bMulti && OTOLITH_MULTI_VIDEOS.has(videoId)) ? Math.min(2, k.bMulti.length) : 2;
    return { a: 2, b: bMax, c: cMax, total: 2 + bMax + cMax };
  }
 
  // Is a SINGLE maneuver (one of possibly two) part of the correct set?
  // Used to color each maneuver individually in the admin table.
  export function isManeuverInKey(videoId: string, oneManeuver: string): boolean | null {
    const k = ANSWER_KEY[videoId];
    if (!k) return null;
    const correct = new Set(k.c.map(norm).filter(Boolean));
    return correct.has(norm(oneManeuver));
  }