"use client";

export function RadioGroup({
  options,
  value,
  onChange,
  name,
}: {
  options: string[];
  value: string | null;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {options.map((opt, i) => {
        const selected = value === opt;
        return (
          <label
            key={opt}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "11px 14px",
              borderRadius: 8,
              border: `1px solid ${selected ? "var(--accent-dim)" : "var(--line)"}`,
              background: selected ? "rgba(45,212,191,0.08)" : "var(--bg)",
              cursor: "pointer",
              fontSize: 14,
              transition: "border-color 0.12s, background 0.12s",
            }}
          >
            <input
              type="radio"
              name={name}
              checked={selected}
              onChange={() => onChange(opt)}
              style={{ width: "auto", accentColor: "#2dd4bf" }}
            />
            <span style={{ color: "var(--ink-faint)", fontSize: 12, minWidth: 18 }}>
              {i + 1}.
            </span>
            <span>{opt}</span>
          </label>
        );
      })}
    </div>
  );
}

export function ConfidenceSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
        <span style={{ fontSize: 13, color: "var(--ink-dim)" }}>Confidence</span>
        <span
          className="mono"
          style={{ fontSize: 22, color: "var(--accent)", fontWeight: 500 }}
        >
          {value}%
        </span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ width: "100%", accentColor: "#2dd4bf", padding: 0 }}
      />
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-faint)" }}>
        <span>0 — Not at all sure</span>
        <span>100 — Certain</span>
      </div>
    </div>
  );
}
