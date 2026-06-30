// ============================================================
// End-of-study FEEDBACK questionnaire (shown after all 25 videos).
// 5 statements, each rated 0-5 (Strongly Disagree -> Strongly Agree).
// ============================================================

export interface FeedbackQuestion {
    title: string;
    text: string;
  }
  
  export const FEEDBACK_QUESTIONS: FeedbackQuestion[] = [
    {
      title: "Diagnostic Confidence (Digital vs. Memory)",
      text: "The ability to replay and scrub the video significantly increased my confidence in identifying the fast-phase direction compared to a standard 'one-look' bedside observation.",
    },
    {
      title: "Detail Sufficiency",
      text: "The visual quality of the video provided sufficient detail (e.g., torsional beats, iris landmarks) to establish a definitive diagnosis without needing to physically re-examine the patient.",
    },
    {
      title: "Replay Utility",
      text: "The Replay Tracker functionality was essential for capturing subtle nystagmus characteristics that were not immediately apparent during the first few seconds of playback.",
    },
    {
      title: "Collaborative Potential",
      text: "Sharing and reviewing this digital recording with a colleague to reach a 'Gold Standard' consensus is significantly more effective than describing a past physical exam from memory.",
    },
    {
      title: "Patient Educational Value",
      text: "The clarity of these recordings makes them highly effective visual aids for helping a patient understand the rationale behind a specific therapeutic maneuver (e.g., Epley).",
    },
  ];
  
  export const FEEDBACK_SCALE_MIN = 0;
  export const FEEDBACK_SCALE_MAX = 5;