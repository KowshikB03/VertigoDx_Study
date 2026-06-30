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
          <div style={s.counter}>
            {demo ? "Demo video" : `Video ${sequenceNumber} of ${totalVideos}`}
          </div>
          <LogoutButton locked={videoLocked} />
        </div>
      </header>

      {/* Legend: test flow & timing summary */}
      <TestFlowLegend />

      {/* Second counter between legend and video */}
      <div style={s.counterCenter}>
        {demo ? "Demo video" : `Video ${sequenceNumber} of ${totalVideos}`}
      </div>

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
            <QuestionBlock qid="A" qLabel="Initial Classification" qSub="Watch the video and provide your initial nystagmus classification." titleLink="Question 1A:">
              <RadioGroup name="init" options={NYSTAGMUS_OPTIONS} value={initClass} onChange={setInitClass} />
              <ConfidenceSlider value={initConf} onChange={setInitConf} />
              <ErrLine err={err} />
              <PrimaryBtn busy={busy} onClick={submitInitial}>Submit Initial Answer</PrimaryBtn>
            </QuestionBlock>
          )}

          {step === "final" && (
            <QuestionBlock qid="A" qLabel="Final Classification (Submit)" qSub={`Review and modify your answer if needed. You may replay up to ${MAX_REPLAYS} times.`} titleLink="Question 1A:" heading="Keep or change Answer 1A to be your FINAL answer:">
              <RadioGroup name="final" options={NYSTAGMUS_OPTIONS} value={finalClass} onChange={setFinalClass} />
              <ConfidenceSlider value={finalConf} onChange={setFinalConf} />
              <ErrLine err={err} />
              <PrimaryBtn busy={busy} onClick={submitFinal}>Submit and Proceed to Next Question</PrimaryBtn>
            </QuestionBlock>
          )}

          {step === "otolith" && (
            <QuestionBlock qid="B" qLabel="Diagnosis: Otolith Location" qSub="Identify the affected otolith location." titleLink="Question 1B:" heading={`Question 1B - Otolith Location: Diagnosis (choose ${isMultiOtolith ? "up to 2" : "1"} answer${isMultiOtolith ? "s" : ""})`} headingSub={`Based on the classification of the video and the test position - ${position}, where is the otolith most likely located?`}>
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
            </QuestionBlock>
          )}

          {step === "maneuver" && (
            <QuestionBlock qid="C" qLabel="Treatment Maneuver" qSub="Select the most appropriate treatment maneuver." titleLink="Question 1C:" heading="Question 1C: Treatment Maneuver (Choose 2 techniques)" headingSub="Based on the otolith location, what is the most appropriate treatment maneuver? You may select up to two.">
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
            </QuestionBlock>
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
// Colors per request: 1a answer = blue, 1b answer = green, 1c context = red/pink.
function PriorSummary({
  step, initClass, finalClass, otolith,
}: { step: Step; initClass: string | null; finalClass: string | null; otolith: string | null }) {
  const items: { label: string; value: string | null; color: string }[] = [];
  if (step === "final") {
    items.push({ label: "Your INITIAL 1a NYSTAGMUS answer:", value: initClass, color: "#1d4ed8" });
  } else if (step === "otolith") {
    items.push({ label: "Your INITIAL 1a NYSTAGMUS answer:", value: finalClass, color: "#1d4ed8" });
  } else if (step === "maneuver") {
    items.push({ label: "Your FINAL 1A NYSTAGMUS Answer:", value: finalClass, color: "#1d4ed8" });
    items.push({ label: "Your 1B DIAGNOSIS Answer:", value: otolith, color: "#15803d" });
  }
  if (items.length === 0) return null;

  return (
    <div style={s.summary}>
      {items.map((it) => (
        <div key={it.label} style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "baseline" }}>
          <span style={{ fontSize: 13.5, color: "#000", fontWeight: 700 }}>{it.label}</span>
          <span style={{ fontSize: 14.5, fontWeight: 700, color: it.color }}>{it.value || "—"}</span>
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
      <div style={{ fontSize: 12, color: "#000", marginBottom: 2 }}>
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
            <span style={{ color: "#000", fontSize: 12, minWidth: 18 }}>{i + 1}.</span>
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

// Colors for the QUESTION A / B / C theme (badge + headers).
const Q_THEME: Record<string, { bg: string; text: string }> = {
  A: { bg: "#1d4ed8", text: "#1d4ed8" }, // blue
  B: { bg: "#15803d", text: "#15803d" }, // green
  C: { bg: "#7c3aed", text: "#7c3aed" }, // purple
};

// A question step: shows the colored QUESTION badge card, a purple "Question 1X:"
// link-style title, an optional bold heading + sub, then the inputs.
function QuestionBlock({
  qid, qLabel, qSub, titleLink, heading, headingSub, children,
}: {
  qid: "A" | "B" | "C";
  qLabel: string;
  qSub: string;
  titleLink: string;
  heading?: string;
  headingSub?: string;
  children: React.ReactNode;
}) {
  const theme = Q_THEME[qid];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {/* Title link + badge card row */}
      <div style={{ display: "flex", alignItems: "center", gap: 18, flexWrap: "wrap" }}>
        <span style={{ color: "#7c3aed", fontWeight: 700, fontSize: 16, textDecoration: "underline" }}>
          {titleLink}
        </span>
        <div style={{
          border: `2px solid ${theme.bg}`, borderRadius: 12, overflow: "hidden",
          minWidth: 180, textAlign: "center", background: "#fff",
        }}>
          <div style={{ background: theme.bg, color: "#fff", fontWeight: 700, fontSize: 12.5, padding: "5px 10px", letterSpacing: "0.04em" }}>
            QUESTION {qid}
          </div>
          <div style={{ padding: "10px 12px" }}>
            <div style={{ color: theme.text, fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>{qLabel}</div>
            <div style={{ color: "#000", fontSize: 11.5, lineHeight: 1.4 }}>{qSub}</div>
          </div>
        </div>
      </div>

      {/* Optional bold heading (purple) + sub */}
      {heading && (
        <div>
          <h2 style={{ fontSize: 18, color: "#7c3aed", textDecoration: "underline", marginBottom: 6 }}>{heading}</h2>
          {headingSub && <p style={{ color: theme.text, fontSize: 13.5, lineHeight: 1.5, fontWeight: 500 }}>{headingSub}</p>}
        </div>
      )}

      {children}
    </div>
  );
}

// The "TEST FLOW & TIMING SUMMARY" legend shown above the video.
function TestFlowLegend() {
  const cards: { id: "A" | "B" | "C"; title: string; sub: string }[] = [
    { id: "A", title: "Initial Classification", sub: "Watch the video and provide your initial nystagmus classification." },
    { id: "A", title: "Final Classification (Submit)", sub: "Review and modify your answer if needed. Click SUBMIT FINAL ANSWER to finalize." },
    { id: "B", title: "Diagnosis: Otolith Location", sub: "Identify the affected otolith location." },
    { id: "C", title: "Treatment Maneuver", sub: "Select the most appropriate treatment maneuver." },
  ];
  return (
    <div style={s.legend}>
      <div style={s.legendTitle}>TEST FLOW &amp; TIMING SUMMARY</div>
      <div style={s.legendTiming}>
        <strong style={{ color: "#1d4ed8" }}>TIMING IS MEASURED:</strong> From pressing <strong>PLAY</strong> when starting the video for Question A, and ends when you click <strong>SUBMIT FINAL ANSWER</strong>.
      </div>
      <div style={s.legendCards}>
        {cards.map((c, i) => {
          const theme = Q_THEME[c.id];
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{
                flex: 1, border: `1.5px solid ${theme.bg}`, borderRadius: 10, overflow: "hidden",
                background: "#fff", minWidth: 0,
              }}>
                <div style={{ background: theme.bg, color: "#fff", fontWeight: 700, fontSize: 10.5, padding: "4px 8px", textAlign: "center", letterSpacing: "0.04em" }}>
                  QUESTION {c.id}
                </div>
                <div style={{ padding: "8px 10px" }}>
                  <div style={{ color: theme.text, fontWeight: 700, fontSize: 11.5, marginBottom: 3, textAlign: "center" }}>{c.title}</div>
                  <div style={{ color: "#000", fontSize: 10, lineHeight: 1.35, textAlign: "center" }}>{c.sub}</div>
                </div>
              </div>
              {i < cards.length - 1 && <span style={{ color: "#000", fontSize: 16 }}>→</span>}
            </div>
          );
        })}
      </div>
      <div style={s.legendKey}>
        <LegendKey color="#1d4ed8" text="Question A: Nystagmus Classification (Initial and Final)" />
        <LegendKey color="#15803d" text="Question B: Diagnosis: Otolith Location" />
        <LegendKey color="#7c3aed" text="Question C: Treatment Maneuver" />
      </div>
    </div>
  );
}

function LegendKey({ color, text }: { color: string; text: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <span style={{ width: 12, height: 12, borderRadius: 3, background: color, display: "inline-block" }} />
      <span style={{ fontSize: 11, color: "#000" }}>{text}</span>
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
  pid: { fontSize: 11, letterSpacing: "0.14em", color: "#000" },
  counter: { fontSize: 16, color: "#0d9488", fontWeight: 700, letterSpacing: "0.02em" },
  counterCenter: { fontSize: 18, color: "#0d9488", fontWeight: 700, textAlign: "center", margin: "4px 0 18px" },
  legend: {
    border: "1px solid var(--line)", borderRadius: 14, padding: "18px 22px",
    marginBottom: 22, background: "#fff", display: "flex", flexDirection: "column", gap: 14,
  },
  legendTitle: { textAlign: "center", fontWeight: 800, fontSize: 16, letterSpacing: "0.03em", color: "#1a1530" },
  legendTiming: {
    background: "#eff4ff", border: "1px solid #d6e0fb", borderRadius: 8,
    padding: "10px 14px", fontSize: 12.5, lineHeight: 1.5, color: "#33405e",
  },
  legendCards: { display: "flex", alignItems: "stretch", gap: 4, flexWrap: "wrap" },
  legendKey: { display: "flex", gap: 18, flexWrap: "wrap", paddingTop: 4, borderTop: "1px solid var(--line-soft)", justifyContent: "center" },
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