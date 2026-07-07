"use client";

import { useRef, useState } from "react";

interface Props {
  src: string; // Cloudinary mp4 URL
  // Called the moment the very first play starts (to start Timer 1).
  onFirstPlayStart: () => void;
  // Whether replays are currently allowed (after initial answer submitted).
  replayEnabled: boolean;
  replayCount: number;
  maxReplays: number;
  onReplay: () => void;
  // Instructional caption shown before first play (differs for Ai vs Aii/B/C).
  captionText?: string;
}

export default function VideoPlayer({
  src,
  onFirstPlayStart,
  replayEnabled,
  replayCount,
  maxReplays,
  onReplay,
  captionText,
}: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [hasPlayedOnce, setHasPlayedOnce] = useState(false);
  const [playing, setPlaying] = useState(false);

  function firstPlay() {
    const v = ref.current;
    if (!v) return;
    setHasPlayedOnce(true);
    setPlaying(true);
    onFirstPlayStart();
    v.currentTime = 0;
    v.play();
  }

  function doReplay() {
    const v = ref.current;
    if (!v || !replayEnabled || playing || replayCount >= maxReplays) return;
    onReplay();
    v.currentTime = 0;
    setPlaying(true);
    v.play();
  }

  function stop() {
    setPlaying(false);
  }

  const replaysLeft = maxReplays - replayCount;
  const replayBlocked = playing || replayCount >= maxReplays;

  return (
    <div style={styles.wrap}>
      {/* Landscape. objectFit:contain shows the FULL clip at original length
          and aspect ratio (no cropping, no trimming). */}
      <div style={styles.frame}>
        <video
          ref={ref}
          src={src}
          onEnded={stop}
          onPause={stop}
          onPlay={() => setPlaying(true)}
          onContextMenu={(e) => e.preventDefault()}
          controlsList="nodownload noplaybackrate noremoteplayback"
          disablePictureInPicture
          playsInline
          muted
          preload="auto"
          // NO `controls` attribute = no scrub bar, no speed, no download UI.
          style={styles.video}
        />

        {hasPlayedOnce && (
          <div style={styles.overlay} onContextMenu={(e) => e.preventDefault()} />
        )}

        {!hasPlayedOnce && (
          <button onClick={firstPlay} style={styles.bigPlay} aria-label="Play video">
            <PlayIcon />
            <span style={{ fontSize: 13, marginTop: 8 }}>Play (one viewing)</span>
          </button>
        )}
      </div>

      <div style={styles.controls}>
        {!hasPlayedOnce ? (
          <span style={styles.hint}>
            {captionText || "The first viewing plays once. Replay unlocks after your initial answer."}
          </span>
        ) : !replayEnabled ? (
          <span style={styles.hint}>
            Submit your initial answer below to unlock replays.
          </span>
        ) : (
          <button
            onClick={doReplay}
            disabled={replayBlocked}
            style={{
              ...styles.replayBtn,
              opacity: replayBlocked ? 0.4 : 1,
              cursor: replayBlocked ? "not-allowed" : "pointer",
            }}
          >
            ↻ {playing ? "Playing…" : "Replay"}{" "}
            {replayCount >= maxReplays ? "(none left)" : `(${replaysLeft} left)`}
          </button>
        )}
      </div>
    </div>
  );
}

function PlayIcon() {
  return (
    <svg width="46" height="46" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="11" fill="rgba(13,148,136,0.12)" stroke="#0d9488" />
      <path d="M10 8l6 4-6 4V8z" fill="#0d9488" />
    </svg>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  frame: {
    position: "relative",
    width: "100%",
    maxWidth: 640,
    aspectRatio: "16 / 9",
    background: "#000",
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid var(--line)",
    boxShadow: "0 20px 60px -30px rgba(0,0,0,0.4)",
  },
  video: { width: "100%", height: "100%", objectFit: "contain", display: "block", background: "#000" },
  overlay: { position: "absolute", inset: 0, zIndex: 1 },
  bigPlay: {
    position: "absolute",
    inset: 0,
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.55)",
    border: "none",
    color: "#fff",
    width: "100%",
    height: "100%",
  },
  controls: { minHeight: 40, display: "flex", alignItems: "center" },
  hint: { fontSize: 13, color: "#000", textAlign: "center", maxWidth: 380 },
  replayBtn: {
    background: "transparent",
    border: "1px solid var(--accent)",
    color: "var(--accent)",
    borderRadius: 8,
    padding: "9px 18px",
    fontSize: 14,
    fontWeight: 500,
  },
};