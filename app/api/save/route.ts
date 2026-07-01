import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@/lib/session";
import { saveInitial, saveFinal, saveOtolith, saveManeuver } from "@/lib/db";
import { getVideo } from "@/lib/videos";
import { NYSTAGMUS_OPTIONS, OTOLITH_OPTIONS, MANEUVER_OPTIONS, MAX_REPLAYS } from "@/lib/options";

function clampConf(n: unknown): number {
  const v = Math.round(Number(n) / 5) * 5; // snap to nearest 5
  if (Number.isNaN(v)) return 0;
  return Math.min(100, Math.max(0, v));
}

export async function POST(req: NextRequest) {
  const user = await currentUser();
  if (!user || user.role !== "tester") {
    return NextResponse.json({ ok: false, error: "Not authorized." }, { status: 401 });
  }

  const body = await req.json();
  const { step, videoId } = body;
  const vid = String(videoId);
  const video = getVideo(vid);
  if (!video) {
    return NextResponse.json({ ok: false, error: "Unknown video." }, { status: 400 });
  }

  const elapsed = (startedAt: unknown): number => {
    const start = Number(startedAt);
    if (!start || Number.isNaN(start)) return 0;
    return Math.max(0, (Date.now() - start) / 1000);
  };

  if (step === "initial") {
    if (!NYSTAGMUS_OPTIONS.includes(body.classification)) {
      return NextResponse.json({ ok: false, error: "Invalid classification." }, { status: 400 });
    }
    const r = await saveInitial({
      userId: user.id, videoId: vid, videoPosition: video.position,
      classification: body.classification, confidence: clampConf(body.confidence),
      responseTime: elapsed(body.startedAt),
    });
    return NextResponse.json(r);
  }

  if (step === "final") {
    if (!NYSTAGMUS_OPTIONS.includes(body.classification)) {
      return NextResponse.json({ ok: false, error: "Invalid classification." }, { status: 400 });
    }
    const replays = Math.min(MAX_REPLAYS, Math.max(0, Number(body.replayCount) || 0));
    const r = await saveFinal({
      userId: user.id, videoId: vid, classification: body.classification,
      confidence: clampConf(body.confidence), replayCount: replays,
      finalResponseTime: elapsed(body.startedAt), uncertain: !!body.uncertain,
    });
    return NextResponse.json(r);
  }

  if (step === "otolith") {
    // Multi-select 1b videos (e.g. 8D) submit a "; " joined string of up to 2 answers.
    const otoParts = String(body.answer || "").split(";").map((p: string) => p.trim()).filter(Boolean);
    const otoValid = otoParts.length >= 1 && otoParts.length <= 2 &&
      otoParts.every((p: string) => OTOLITH_OPTIONS.includes(p));
    if (!otoValid) {
      return NextResponse.json({ ok: false, error: "Invalid otolith answer." }, { status: 400 });
    }
    const r = await saveOtolith({
      userId: user.id, videoId: vid, answer: otoParts.join("; "),
      confidence: clampConf(body.confidence), responseTime: elapsed(body.startedAt),
    });
    return NextResponse.json(r);
  }

  if (step === "maneuver") {
    const parts = String(body.answer || "").split(";").map((p: string) => p.trim()).filter(Boolean);
    const valid = parts.length === 2 &&
      parts.every((p: string) => MANEUVER_OPTIONS.includes(p));
    if (!valid) {
      return NextResponse.json({ ok: false, error: "Invalid maneuver answer." }, { status: 400 });
    }
    const r = await saveManeuver({
      userId: user.id, videoId: vid, answer: parts.join("; "),
      confidence: clampConf(body.confidence), responseTime: elapsed(body.startedAt),
    });
    return NextResponse.json(r);
  }

  return NextResponse.json({ ok: false, error: "Unknown step." }, { status: 400 });
}