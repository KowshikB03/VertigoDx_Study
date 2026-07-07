import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { DEMO_VIDEO, videoUrl, TOTAL_VIDEOS } from "@/lib/videos";
import StudyFlow from "../StudyFlow";
import { getDetails } from "@/lib/videoDetails";

export const dynamic = "force-dynamic";

export default async function DemoPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "tester") redirect("/admin");

  // Fixed demo video (31UCC) — never one of the real test videos.
  const pick = DEMO_VIDEO;

  return (
    <main style={{ minHeight: "100vh" }}>
      <div style={{
        maxWidth: 820, margin: "0 auto", padding: "16px 28px 0",
      }}>
        <div style={{
          background: "rgba(13,148,136,0.08)", border: "1px solid var(--accent)",
          borderRadius: 10, padding: "12px 16px", fontSize: 13.5, color: "var(--ink)",
        }}>
          <strong>Demo questionnaire.</strong> This is a practice run so you can explore
          how it works. Your answers here are <strong>not recorded</strong>. The real
          study begins after you complete it.
        </div>
      </div>
      <StudyFlow
        videoId={pick.id}
        videoUrl={videoUrl(pick.cloudinaryId)}
        position={pick.position}
        details={getDetails(pick.id) ?? null}
        sequenceNumber={1}
        totalVideos={TOTAL_VIDEOS}
        participantId={user.id}
        startStep="initial"
        prior={{ initialClassification: null, finalClassification: null, otolithAnswer: null }}
        demo
      />
    </main>
  );
}