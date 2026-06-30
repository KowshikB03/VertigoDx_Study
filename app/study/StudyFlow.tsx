"use client";

import { useEffect, useRef, useState } from "react";
import VideoPlayer from "./VideoPlayer";
import { RadioGroup, ConfidenceSlider } from "./FormBits";
import LogoutButton from "../admin/LogoutButton";
import { Logo } from "../components/Brand";
import type { VideoDetails } from "@/lib/videoDetails";
import { positionLine } from "@/lib/videoDetails";
import {
  NYSTAGMUS_OPTIONS,
  OTOLITH_OPTIONS,
  MANEUVER_OPTIONS,
  MAX_REPLAYS,
} from "@/lib/options";
import { OTOLITH_MULTI_VIDEOS, MAX_OTOLITH_MULTI } from "@/lib/answerKey";

type Step = "initial" | "final" | "otolith" | "maneuver";

interface Prior {
  initialClassification: string | null;
  finalClassification: string | null;
  otolithAnswer: string | null;
}

interface Props {
  videoId: string;
  videoUrl: string;
  position: string;
  sequenceNumber: number;
  totalVideos: number;
  participantId: string;
  startStep: Step;
  prior: Prior;
  details?: VideoDetails | null; // per-video clinical info for 1b/1c
  demo?: boolean; // demo mode: nothing saves; different final button + redirect
}

const MAX_MANEUVERS = 2;

export default function StudyFlow({
  videoId,
  videoUrl,
  position,
  sequenceNumber,
  totalVideos,
  participantId,
  startStep,
  prior,
  details = null,
  demo = false,
}: Props) {
  const [step, setStep] = useState<Step>(startStep);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  // Locks Sign Out from the moment they hit Play on 1a until 1c is submitted.
  // If they resume mid-video (startStep is past 'initial'), it's already locked.
  const [videoLocked, setVideoLocked] = useState(startStep !== "initial");

  // timers (client-held start; server computes elapsed from these)
  const timer1Start = useRef<number | null>(null); // 1a initial — starts on PLAY
  const stepStart = useRef<number | null>(null);    // final/otolith/maneuver — starts on step open

  // replay tracking
  const [replayCount, setReplayCount] = useState(0);
  const [replayEnabled, setReplayEnabled] = useState(false);

  // answers (seed from prior saved answers so summaries survive a resume)
  const [initClass, setInitClass] = useState<string | null>(prior.initialClassification);
  const [initConf, setInitConf] = useState(50);
  const [finalClass, setFinalClass] = useState<string | null>(
    prior.finalClassification ?? prior.initialClassification
  );
  const [finalConf, setFinalConf] = useState(50);
  const [otolith, setOtolith] = useState<string | null>(prior.otolithAnswer);
  const [otolithConf, setOtolithConf] = useState(50);
  // 8D-style multi-select 1b: seed from prior (stored as "; " joined string).
  const isMultiOtolith = OTOLITH_MULTI_VIDEOS.has(videoId);
  const [otolithMulti, setOtolithMulti] = useState<string[]>(
    prior.otolithAnswer && isMultiOtolith
      ? prior.otolithAnswer.split(";").map((x) => x.trim()).filter(Boolean)
      : []
  );
  const [maneuvers, setManeuvers] = useState<string[]>([]); // up to 2
  const [maneuverConf, setManeuverConf] = useState(50);

  // Start the step timer when a non-initial step opens (including on resume).
  // The "initial" step is special: its timer starts only when the user plays.
  useEffect(() => {
    if (step !== "initial") {
      stepStart.current = Date.now();
    }
    if (step === "final") setReplayEnabled(true);
  }, [step]);

  async function post(payload: Record<string, unknown>) {
    if (demo) return true; // demo mode never persists anything
    setBusy(true);
    setErr("");
    try {
      const res = await fetch("/api/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoId, ...payload }),
      });
      const data = await res.json();
      if (!data.ok) {
        setErr(data.error || data.reason || "Could not save. Try again.");
        setBusy(false);
        return false;
      }
      setBusy(false);
      return true;
    } catch {
      setErr("Network error. Try again.");
      setBusy(false);
      return false;
    }
  }

  // ---- Timer for 1a initial: starts only on play ----
  function onFirstPlayStart() {
    timer1Start.current = Date.now();
    setVideoLocked(true); // lock Sign Out until 1c is submitted
  }

  async function submitInitial() {
    if (!initClass) { setErr("Select a classification."); return; }
    if (timer1Start.current === null) { setErr("Please play the video before answering."); return; }
    const ok = await post({
      step: "initial",
      classification: initClass,
      confidence: initConf,
      startedAt: timer1Start.current,
    });
    if (ok) {
      setErr("");
      setFinalClass(initClass);
      setFinalConf(initConf);
      setStep("final"); // useEffect starts its timer + enables replay
    }
  }

  function onReplay() {
    setReplayCount((c) => Math.min(MAX_REPLAYS, c + 1));
  }

  async function submitFinal() {
    if (!finalClass) { setErr("Select a final classification."); return; }
    const ok = await post({
      step: "final",
      classification: finalClass,
      confidence: finalConf,
      replayCount,
      uncertain: false,
      startedAt: stepStart.current,
    });
    if (ok) { setErr(""); setStep("otolith"); }
  }

  function toggleOtolithMulti(opt: string) {
    setOtolithMulti((cur) => {
      if (cur.includes(opt)) return cur.filter((m) => m !== opt);
      if (cur.length >= MAX_OTOLITH_MULTI) return cur; // cap at 2
      return [...cur, opt];
    });
  }

  async function submitOtolith() {
    const answer = isMultiOtolith ? otolithMulti.join("; ") : otolith;
    if (isMultiOtolith) {
      if (otolithMulti.length === 0) { setErr("Select at least one otolith location."); return; }
    } else {
      if (!otolith) { setErr("Select an otolith location."); return; }
    }
    const ok = await post({
      step: "otolith",
      answer,
      confidence: otolithConf,
      startedAt: stepStart.current,
    });
    if (ok) { setErr(""); setStep("maneuver"); }
  }

  function toggleManeuver(opt: string) {
    setManeuvers((cur) => {
      if (cur.includes(opt)) return cur.filter((m) => m !== opt);
      if (cur.length >= MAX_MANEUVERS) return cur; // cap at 2
      return [...cur, opt];
    });
  }

  async function submitManeuver() {
    if (maneuvers.length === 0) { setErr("Select at least one treatment maneuver."); return; }
    const ok = await post({
      step: "maneuver",
      answer: maneuvers.join("; "), // combined string, max 2
      confidence: maneuverConf,
      startedAt: stepStart.current,
    });
    if (ok) window.location.href = demo ? "/study?start=1" : "/study";
  }

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Logo height={28} />
          <span className="mono" style={s.pid}>PARTICIPANT: {participantId}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div className="mono" style={s.counter}>
            {demo ? "Demo video" : `Video ${sequenceNumber} of ${totalVideos}`}
          </div>
          <LogoutButton locked={videoLocked} />
        </div>
      </header>

      <div style={s.grid}>
        {/* Video */}
        <div style={s.left}>
          <VideoPlayer
            src={videoUrl}
            onFirstPlayStart={onFirstPlayStart}
            replayEnabled={replayEnabled && step === "final"}
            replayCount={replayCount}
            maxReplays={MAX_REPLAYS}
            onReplay={onReplay}
          />
          {/* Clinical info revealed only from 1b onward */}
          {(step === "otolith" || step === "maneuver") && (
            <ClinicalInfo details={details} fallbackPosition={position} />
          )}
        </div>

        {/* Summary of prior answers (below video, above questionnaire) */}
        <PriorSummary step={step} initClass={initClass} finalClass={finalClass} otolith={otolith} />

        {/* Questions */}
        <div style={s.right}>
          <StepDots step={step} />

          {step === "initial" && (
            <Section title="Initial Classification" subtitle="Watch the video once, then submit your first impression. Replays unlock afterward.">
              <RadioGroup name="init" options={NYSTAGMUS_OPTIONS} value={initClass} onChange={setInitClass} />
              <ConfidenceSlider value={initConf} onChange={setInitConf} />
              <ErrLine err={err} />
              <PrimaryBtn busy={busy} onClick={submitInitial}>Submit Initial Answer</PrimaryBtn>
            </Section>
          )}

          {step === "final" && (
            <Section title="Final Classification" subtitle={`You may replay up to ${MAX_REPLAYS} times, then confirm or revise.`}>
              <RadioGroup name="final" options={NYSTAGMUS_OPTIONS} value={finalClass} onChange={setFinalClass} />
              <ConfidenceSlider value={finalConf} onChange={setFinalConf} />
              <ErrLine err={err} />
              <PrimaryBtn busy={busy} onClick={submitFinal}>Submit and Proceed to Next Question</PrimaryBtn>
            </Section>
          )}

          {step === "otolith" && (
            <Section title="Otolith Location" subtitle={`Based on the classification of the video and the test position - ${position}, where is the otolith most likely located?${isMultiOtolith ? " You may select up to two." : ""}`}>
              {isMultiOtolith ? (
                <CheckGroup
                  name="oto"
                  options={OTOLITH_OPTIONS}
                  selected={otolithMulti}
                  onToggle={toggleOtolithMulti}
                  max={MAX_OTOLITH_MULTI}
                />
              ) : (
                <RadioGroup name="oto" options={OTOLITH_OPTIONS} value={otolith} onChange={setOtolith} />
              )}
              <ConfidenceSlider value={otolithConf} onChange={setOtolithConf} />
              <ErrLine err={err} />
              <PrimaryBtn busy={busy} onClick={submitOtolith}>Submit Otolith Location</PrimaryBtn>
            </Section>
          )}

          {step === "maneuver" && (
            <Section title="Treatment Maneuver" subtitle="Based on the otolith location, what is the most appropriate treatment maneuver? You may select up to two.">
              <CheckGroup
                name="man"
                options={MANEUVER_OPTIONS}
                selected={maneuvers}
                onToggle={toggleManeuver}
                max={MAX_MANEUVERS}
              />
              <ConfidenceSlider value={maneuverConf} onChange={setManeuverConf} />
              <ErrLine err={err} />
              <PrimaryBtn busy={busy} onClick={submitManeuver}>
                {demo
                  ? "Complete Demo Questionnaire"
                  : sequenceNumber >= totalVideos
                  ? "Submit & Finish Study"
                  : "Submit & Go to Next Video"}
              </PrimaryBtn>
            </Section>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Clinical info block (positions, characteristics, symptoms) for 1b/1c ----
function ClinicalInfo({ details, fallbackPosition }: { details: VideoDetails | null; fallbackPosition: string }) {
  // Line 1 — positions
  const posText = details ? positionLine(details) : `position : ${fallbackPosition}`;

  // Line 2 — other nystagmus characteristics
  const charParts: string[] = [];
  if (details?.latency != null) charParts.push(`Latency : ${details.latency} seconds`);
  if (details?.duration != null) charParts.push(`Duration : ${details.duration} seconds`);
  if (details?.reversal != null) charParts.push(`Reversal of Nystagmus : ${details.reversal}`);

  // Line 3 — patient symptoms
  const sympParts: string[] = [];
  if (details?.dizziness != null) sympParts.push(`Dizziness : ${details.dizziness}`);
  if (details?.nausea != null) sympParts.push(`Nausea : ${details.nausea}`);

  return (
    <div style={s.clinical}>
      <div style={s.clinicalHeader}>PERTINENT CLINICAL INFORMATION</div>
      <div style={s.clinicalRow}>
        <span style={s.clinicalLabel}>The nystagmus was observed in the following test - </span>
        <span style={s.clinicalValue}>{posText}</span>
      </div>
      {charParts.length > 0 && (
        <div style={s.clinicalRow}>
          <span style={s.clinicalLabel}>Other nystagmus characteristics noted - </span>
          <span style={s.clinicalValue}>{charParts.join(", ")}</span>
        </div>
      )}
      {sympParts.length > 0 && (
        <div style={s.clinicalRow}>
          <span style={s.clinicalLabel}>Patient symptoms during testing - </span>
          <span style={s.clinicalValue}>{sympParts.join(", ")}</span>
        </div>
      )}
      {details?.comments != null && (
        <div style={s.clinicalRow}>
          <span style={s.clinicalLabel}>Comments - </span>
          <span style={s.clinicalValue}>{details.comments}</span>
        </div>
      )}
    </div>
  );
}

// ---- Prior-answer summary box ----
function PriorSummary({
  step, initClass, finalClass, otolith,
}: { step: Step; initClass: string | null; finalClass: string | null; otolith: string | null }) {
  const items: { label: string; value: string | null }[] = [];
  if (step === "final") {
    items.push({ label: "Your initial 1a answer", value: initClass });
  } else if (step === "otolith") {
    items.push({ label: "Your final 1a answer", value: finalClass });
  } else if (step === "maneuver") {
    items.push({ label: "Your final 1a answer", value: finalClass });
    items.push({ label: "Your 1b otolith answer", value: otolith });
  }
  if (items.length === 0) return null;

  return (
    <div style={s.summary}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline" }}>
          <span style={{ fontSize: 12, color: "var(--ink-dim)" }}>{it.label}:</span>
          <span style={{ fontSize: 13.5, fontWeight: 600, color: "var(--ink)" }}>{it.value || "—"}</span>
        </div>
      ))}
    </div>
  );
}

// ---- Checkbox group (max N) for 1c ----
function CheckGroup({
  options, selected, onToggle, name, max,
}: { options: string[]; selected: string[]; onToggle: (v: string) => void; name: string; max: number }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ fontSize: 12, color: "var(--ink-dim)", marginBottom: 2 }}>
        Selected {selected.length} of {max} max
      </div>
      {options.map((opt, i) => {
        const checked = selected.includes(opt);
        const atMax = !checked && selected.length >= max;
        return (
          <label
            key={opt}
            style={{
              display: "flex", alignItems: "center", gap: 12, padding: "11px 14px",
              borderRadius: 8,
              border: `1px solid ${checked ? "var(--accent)" : "var(--line)"}`,
              background: checked ? "rgba(13,148,136,0.08)" : "var(--bg)",
              cursor: atMax ? "not-allowed" : "pointer",
              opacity: atMax ? 0.5 : 1,
              fontSize: 14,
            }}
          >
            <input
              type="checkbox"
              name={name}
              checked={checked}
              disabled={atMax}
              onChange={() => onToggle(opt)}
              style={{ width: "auto", accentColor: "#0d9488" }}
            />
            <span style={{ color: "var(--ink-faint)", fontSize: 12, minWidth: 18 }}>{i + 1}.</span>
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 21, marginBottom: 6 }}>{title}</h2>
        <p style={{ color: "var(--ink-dim)", fontSize: 13.5, lineHeight: 1.5 }}>{subtitle}</p>
      </div>
      {children}
    </div>
  );
}

function PrimaryBtn({ children, onClick, busy }: { children: React.ReactNode; onClick: () => void; busy: boolean }) {
  return (
    <button onClick={onClick} disabled={busy} style={{
      background: "var(--accent)", color: "#fff", border: "none", borderRadius: 8,
      padding: "13px 18px", fontSize: 15, fontWeight: 600, marginTop: 4,
      opacity: busy ? 0.6 : 1, cursor: busy ? "wait" : "pointer",
    }}>
      {busy ? "Saving…" : children}
    </button>
  );
}

function ErrLine({ err }: { err: string }) {
  if (!err) return null;
  return <div style={{ color: "var(--danger)", fontSize: 13 }}>{err}</div>;
}

function StepDots({ step }: { step: Step }) {
  const order: Step[] = ["initial", "final", "otolith", "maneuver"];
  const labels = ["Initial", "Final", "Otolith", "Maneuver"];
  const idx = order.indexOf(step);
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 22 }}>
      {order.map((_, i) => (
        <div key={i} title={labels[i]} style={{
          height: 4, flex: 1, borderRadius: 2,
          background: i <= idx ? "var(--accent)" : "var(--line)",
        }} />
      ))}
    </div>
  );
}

const s: Record<string, React.CSSProperties> = {
  page: { maxWidth: 820, margin: "0 auto", padding: "24px 28px" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 18, borderBottom: "1px solid var(--line)", marginBottom: 28 },
  pid: { fontSize: 11, letterSpacing: "0.14em", color: "var(--ink-faint)" },
  counter: { fontSize: 13, color: "var(--accent)", letterSpacing: "0.06em" },
  grid: { display: "flex", flexDirection: "column", gap: 24, alignItems: "stretch" },
  left: { display: "flex", flexDirection: "column", alignItems: "center", gap: 14 },
  posTag: { fontSize: 13, color: "var(--accent)", fontFamily: "var(--font-mono), monospace", letterSpacing: "0.04em", fontWeight: 500 },
  clinical: {
    width: "100%",
    maxWidth: 720,
    background: "#f3f1fb",
    border: "1px solid #e2ddf3",
    borderRadius: 14,
    padding: "26px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 18,
    fontSize: 14.5,
    lineHeight: 1.5,
    boxShadow: "0 8px 24px -16px rgba(40,30,80,0.25)",
  },
  clinicalHeader: {
    textAlign: "center",
    fontWeight: 700,
    fontSize: 16,
    letterSpacing: "0.04em",
    color: "#1a1530",
    marginBottom: 4,
  },
  clinicalRow: { color: "#3a3550" },
  clinicalLabel: { color: "#4a4560", fontWeight: 400 },
  clinicalValue: { color: "#1a1530", fontWeight: 700 },
  right: { minWidth: 0 },
  summary: {
    background: "var(--bg-elev)",
    border: "1px solid var(--line)",
    borderRadius: 10,
    padding: "14px 18px",
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
};