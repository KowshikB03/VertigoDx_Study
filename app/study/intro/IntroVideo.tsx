"use client";

import { Logo } from "../../components/Brand";

// Full-screen intro: a centered video with normal controls (play/pause/seek/
// volume), and a button underneath to continue to the demo questionnaire.
export default function IntroVideo({ src }: { src: string }) {
  return (
    <main style={styles.page}>
      <div style={styles.top}>
        <Logo height={28} />
      </div>

      <div style={styles.center}>
        <video
          src={src}
          controls
          controlsList="nodownload"
          playsInline
          style={styles.video}
        />

        <a href="/study/demo" style={styles.button}>
          Continue to Demo →
        </a>
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    background: "var(--bg)",
  },
  top: {
    padding: "18px 24px",
    borderBottom: "1px solid var(--line)",
  },
  center: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 24,
    padding: "24px",
  },
  video: {
    width: "100%",
    maxWidth: 900,
    maxHeight: "70vh",
    borderRadius: 12,
    background: "#000",
    display: "block",
  },
  button: {
    display: "inline-block",
    background: "var(--accent)",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "14px 30px",
    fontSize: 16,
    fontWeight: 600,
    textDecoration: "none",
    cursor: "pointer",
  },
};