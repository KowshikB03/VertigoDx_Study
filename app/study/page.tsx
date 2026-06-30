import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { remainingShuffled, videoState, getRow, completedCount, hasFeedback } from "@/lib/db";
import { getVideo, videoUrl, TOTAL_VIDEOS, VIDEO_ORDER } from "@/lib/videos";
import { getDetails } from "@/lib/videoDetails";
import StudyFlow from "./StudyFlow";
import FeedbackForm from "./FeedbackForm";
import Instructions from "./Instructions";
import LogoutButton from "../admin/LogoutButton";

export const dynamic = "force-dynamic";

// Per-session shuffle seed WITHOUT writing a cookie (pages can't set cookies).
// Derived from the user id + the calendar date, so the remaining-video order
// is stable through a day's session and reshuffles the next day.
function makeSeed(userId: string): number {
  const day = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const str = `${userId}|${day}`;
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) || 1;
}

export default async function StudyPage({
  searchParams,
}: {
  searchParams: Promise<{ start?: string }>;
}) {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "tester") redirect("/admin");

  const sp = await searchParams;
  const seed = makeSeed(user.id);
  const remaining = await remainingShuffled(user.id, VIDEO_ORDER, seed);
  const next = remaining.length > 0 ? remaining[0] : null;

  // All videos complete -> require feedback, then show completion screen.
  if (next === null) {
    const feedbackDone = await hasFeedback(user.id);
    if (!feedbackDone) {
      return <FeedbackForm participantId={user.id} />;
    }
    return (
      <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
        <div style={{ maxWidth: 460, textAlign: "center", background: "var(--bg-card)", border: "1px solid var(--line)", borderRadius: 12, padding: 44 }}>
          <div className="mono" style={{ fontSize: 11, letterSpacing: "0.18em", color: "var(--ink-faint)", marginBottom: 14 }}>SMARTVERTIGO™ · COMPLETE</div>
          <h1 style={{ fontSize: 26, marginBottom: 12 }}>All {TOTAL_VIDEOS} questions complete</h1>
          <p style={{ color: "var(--ink-dim)", fontSize: 14, lineHeight: 1.6, marginBottom: 26 }}>
            Thank you, {user.name || user.id}. Your responses have been recorded. You may sign out.
          </p>
          <LogoutButton />
        </div>
      </main>
    );
  }

  // Show instructions before the very first video (nothing answered yet) unless ?start=1.
  const done = await completedCount(user.id);
  const startingFresh = done === 0 && !(await videoState(user.id, next)).hasInitial;
  if (startingFresh && sp.start !== "1") {
    return <Instructions />;
  }

  const video = getVideo(next)!;
  const st = await videoState(user.id, next);
  // Determine resume step within this video.
  let startStep: "initial" | "final" | "otolith" | "maneuver" = "initial";
  if (st.hasOtolith) startStep = "maneuver";
  else if (st.hasFinal) startStep = "otolith";
  else if (st.hasInitial) startStep = "final";

  // Progress counter: completed-so-far + 1 (this video), out of total.
  const seq = done + 1;
  const row = await getRow(user.id, next);
  const prior = {
    initialClassification: row?.initial_classification ?? null,
    finalClassification: row?.final_classification ?? null,
    otolithAnswer: row?.otolith_location_answer ?? null,
  };

  return (
    <main style={{ minHeight: "100vh" }}>
      <StudyFlow
        videoId={video.id}
        videoUrl={videoUrl(video.cloudinaryId)}
        position={video.position}
        sequenceNumber={seq}
        totalVideos={TOTAL_VIDEOS}
        participantId={user.id}
        startStep={startStep}
        prior={prior}
        details={getDetails(video.id) ?? null}
      />
    </main>
  );
}