import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { saveFeedback } from "@/lib/db";
import { FEEDBACK_QUESTIONS, FEEDBACK_SCALE_MIN, FEEDBACK_SCALE_MAX } from "@/lib/feedback";

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user || user.role !== "tester") {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }
  const body = await req.json();
  const scores = body.scores;
  // Validate: array, one per question, each within scale.
  if (!Array.isArray(scores) || scores.length !== FEEDBACK_QUESTIONS.length) {
    return NextResponse.json({ ok: false, error: "Please answer all questions." }, { status: 400 });
  }
  for (const s of scores) {
    const n = Number(s);
    if (Number.isNaN(n) || n < FEEDBACK_SCALE_MIN || n > FEEDBACK_SCALE_MAX) {
      return NextResponse.json({ ok: false, error: "Invalid score." }, { status: 400 });
    }
  }
  await saveFeedback(user.id, scores.map((s: unknown) => Number(s)));
  return NextResponse.json({ ok: true });
}