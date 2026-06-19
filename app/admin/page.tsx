import { redirect } from "next/navigation";
import { currentUser } from "@/lib/session";
import { getAllAnswers } from "@/lib/db";
import { VIDEOS, videoUrl } from "@/lib/videos";
import AdminTable from "./AdminTable";
import LogoutButton from "./LogoutButton";
import { Logo } from "../components/Brand";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const user = await currentUser();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/study");

  const rows = getAllAnswers();

  const testers = new Set(rows.map((r) => r.user_id)).size;
  const completedVideos = rows.filter((r) => r.final_submission_timestamp).length;

  // Video reference library: id -> playable URL + position.
  const videoLibrary = VIDEOS.map((v) => ({
    id: v.id,
    url: videoUrl(v.cloudinaryId),
    position: v.position,
  }));

  return (
    <main style={{ minHeight: "100vh", padding: "28px 32px" }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 28,
          paddingBottom: 20,
          borderBottom: "1px solid var(--line)",
        }}
      >
        <div>
          <div style={{ marginBottom: 10 }}>
            <Logo height={30} />
          </div>
          <div
            className="mono"
            style={{
              fontSize: 11,
              letterSpacing: "0.18em",
              color: "var(--ink-faint)",
              marginBottom: 6,
            }}
          >
            ADMIN
          </div>
          <h1 style={{ fontSize: 26 }}>Submitted Answers</h1>
        </div>
        <LogoutButton />
      </header>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <Stat label="Test takers" value={testers} />
        <Stat label="Completed Q-sets" value={completedVideos} />
      </div>

      <AdminTable rows={rows} videoLibrary={videoLibrary} />
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        background: "var(--bg-card)",
        border: "1px solid var(--line)",
        borderRadius: 10,
        padding: "16px 22px",
        minWidth: 140,
      }}
    >
      <div
        className="mono"
        style={{ fontSize: 28, color: "var(--accent)", fontWeight: 500 }}
      >
        {value}
      </div>
      <div style={{ fontSize: 12, color: "var(--ink-dim)", marginTop: 4 }}>
        {label}
      </div>
    </div>
  );
}