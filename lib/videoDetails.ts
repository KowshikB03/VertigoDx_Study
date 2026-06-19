// ============================================================
// VIDEO DETAILS — per-video clinical info shown in the questionnaire
// (positions, nystagmus characteristics, patient symptoms).
// Extracted from the study spreadsheet "25 QUESTIONS" sheet.
// ============================================================

export interface VideoDetails {
    positions: string[];          // 1 or more positional tests
    latency: string | null;       // seconds
    duration: string | null;      // seconds
    reversal: string | null;      // Yes / No
    dizziness: string | null;     // Yes / No
    nausea: string | null;        // Yes / No
  }
  
  export const VIDEO_DETAILS: Record<string, VideoDetails> = {
    "16UC": { positions: ["Dix Hallpike Left"], latency: "5", duration: "10", reversal: "Yes", dizziness: "Yes", nausea: "No" },
    "27RHN": { positions: ["Supine Roll Right"], latency: "2", duration: "50", reversal: "Yes", dizziness: "Yes", nausea: "Yes" },
    "5D": { positions: ["Deep Head Hang"], latency: "0", duration: "10", reversal: "No", dizziness: "Yes", nausea: "Yes" },
    "22LHN": { positions: ["Supine Roll Right"], latency: "0", duration: "95", reversal: "Yes", dizziness: "Yes", nausea: "No" },
    "10UCC": { positions: ["Supine Roll Right", "Dix Hallpike Right"], latency: "2", duration: "30", reversal: "No", dizziness: "Yes", nausea: "No" },
    "8D": { positions: ["Deep Head Hang", "Dix Hallpike Right"], latency: "1", duration: "80", reversal: "No", dizziness: "Yes", nausea: "Yes" },
    "21LHN": { positions: ["Supine Roll Left"], latency: "1", duration: "30", reversal: "Yes", dizziness: "Yes", nausea: "Yes" },
    "28UCC": { positions: ["Dix Hallpike Right"], latency: "0", duration: "90", reversal: "No", dizziness: "Yes", nausea: "No" },
    "1D": { positions: ["Dix Hallpike Left", "Deep Head Hang"], latency: "5", duration: "30", reversal: "No", dizziness: "Yes", nausea: "Yes" },
    "14UC": { positions: ["Dix Hallpike Left"], latency: "0", duration: "90", reversal: "No", dizziness: "Yes", nausea: "Yes" },
    "17LHN": { positions: ["Supine Roll Left", "Dix Hallpike Left"], latency: "2", duration: "50", reversal: "No", dizziness: "Yes", nausea: "Yes" },
    "8UCC": { positions: ["Supine", "Supine Roll Right", "Dix Hallpike Right"], latency: "0", duration: "10", reversal: "Yes", dizziness: "Yes", nausea: "No" },
    "2D": { positions: ["Supine Roll Left"], latency: "0", duration: "30", reversal: "No", dizziness: "Yes", nausea: "No" },
    "23LHN": { positions: ["Supine Roll Left"], latency: "5", duration: "10", reversal: "No", dizziness: "Yes", nausea: "No" },
    "3D": { positions: ["Deep Head Hang", "Supine Roll Right", "Dix Hallpike Right"], latency: "0", duration: "85", reversal: "No", dizziness: "Yes", nausea: "Yes" },
    "13UC": { positions: ["Deep Head Hang", "Dix Hallpike Left"], latency: "5", duration: "10", reversal: "Yes", dizziness: "Yes", nausea: "No" },
    "20LHN": { positions: ["Supine Roll Left"], latency: "2", duration: "45", reversal: "Yes", dizziness: "Yes", nausea: "Yes" },
    "7D": { positions: ["Deep Head Hang"], latency: "5", duration: "10", reversal: "No", dizziness: "Yes", nausea: "Yes" },
    "24RHN": { positions: ["Supine", "Supine Roll Left"], latency: "0", duration: "120", reversal: "Yes", dizziness: "Yes", nausea: "No" },
    "15UC": { positions: ["Deep Head Hang", "Dix Hallpike Left", "Supine Roll Left"], latency: "0", duration: "90", reversal: "No", dizziness: "Yes", nausea: "No" },
    "18LHN": { positions: ["Supine Roll Left"], latency: "5", duration: "15", reversal: "Yes", dizziness: "Yes", nausea: "Yes" },
    "29UCC": { positions: ["Deep Head Hang"], latency: "5", duration: "10", reversal: "Yes", dizziness: "Yes", nausea: "Yes" },
    "32UCC": { positions: ["Deep Head Hang, Dix Hallpike Right"], latency: "0", duration: "80", reversal: "Yes", dizziness: "Yes", nausea: "Yes" },
    "6D": { positions: ["Deep Head Hang"], latency: "5", duration: "10", reversal: "Yes", dizziness: "Yes", nausea: "Yes" },
  };
  
  export function getDetails(id: string): VideoDetails | undefined {
    return VIDEO_DETAILS[id];
  }
  
  // Builds the position label: "position" if one, "position 1"/"position 2" if many.
  export function positionLine(d: VideoDetails): string {
    if (!d.positions.length) return "position : —";
    if (d.positions.length === 1) return "position : " + d.positions[0];
    return d.positions.map((p, i) => "position " + (i + 1) + " : " + p).join(", ");
  }