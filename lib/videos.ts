// ============================================================
// VIDEO CONFIG — one entry per video, served from CLOUDINARY.
//
//   id            : the video's code (string, e.g. "1D", "8UCC", "17LHN")
//   cloudinaryId  : the Cloudinary public ID OR full Cloudinary URL
//   position      : the positional test(s) the nystagmus was viewed in
//
// All videos ask all three questions (1a, 1b, 1c). The position string is
// revealed at question 1b (after the 1a classification is complete).
// ============================================================

export interface VideoConfig {
  id: string;
  cloudinaryId: string; // full Cloudinary URL or bare public ID
  position: string;
}

export const POSITIONS = [
  "Supine",
  "Supine Roll Right",
  "Supine Roll Left",
  "Dix Hallpike Right",
  "Dix Hallpike Left",
  "Deep Head Hang",
] as const;

// Used only when a bare public ID (not a full URL) is given.
export const CLOUDINARY_CLOUD_NAME = "djlppkq0b";

// ============================================================
// THE VIDEOS — order here is the order test takers see them.
// ============================================================
export const VIDEOS: VideoConfig[] = [
  { id: "1D",     cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780417450/Sitting_1_e7g5x9.mov",    position: "Position 1 - Dix Hallpike Left, Position 2 - Deep Head Hang" },
  { id: "2D",     cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780686936/Roll_Left_2_1_pghzou.mov",    position: "Supine Roll Left" },
  { id: "3D",     cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780687534/Lying_3_zpwgtn.mov",    position: "Position 1 - Deep Head Hang, Position 2 - Supine Roll Right, Position 3 - Dix Hallpike Right" },
  { id: "5D",     cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780687578/DBN_Tors_lt60s_Deep_Head_Hang_Hal_S_05_29_2024_copy_kgcehv.mov",    position: "Deep Head Hang" },
  { id: "6D",     cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780687748/Deep_Head_Hang_bveut0.mov",    position: "Deep Head Hang" },
  { id: "7D",     cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780687802/Lying_2_jstevd.mp4",    position: "Deep Head Hang" },
  { id: "8D",     cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780687856/Dix_HallPike_Left_10_1_gifvyc.mov",    position: "Position 1 - Deep Head Hang, Position 2 - Dix Hallpike Right" },
  { id: "8UCC",   cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780687914/Dix_HallPike_Right_bgzihy.mov",  position: "Position 1 - Supine, Position 2 - Supine Roll Right, Position 3 - Dix Hallpike Right" },
  { id: "10UCC",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780687914/Dix_HallPike_Right_bgzihy.mov", position: "Position 1 - Supine Roll Right, Position 2 - Dix Hallpike Right" },
  { id: "28UCC",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688037/Deep_Head_Hang_2026-06-01-17-47-42_d968fc1c_t7e7aq.mov", position: "Dix Hallpike Right" },
  { id: "29UCC",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688084/Roll_Right_2026-05-21-14-55-33_e8307e09_helz0t.mov", position: "Deep Head Hang" },
  { id: "26RHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1782843258/R_HN_Daisy_6_mild_zht8za.mov", position: "Supine Roll Right" },
  { id: "32UCC",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688253/Deep_Head_Hang_3_1_qboj8i.mov", position: "Position 1 - Deep Head Hang, Position 2 - Dix Hallpike Right" },
  { id: "13UC",   cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688326/UTN_Cf_14_sta1my.mov",  position: "Position 1 - Deep Head Hang, Position 2 - Dix Hallpike Left" },
  { id: "14UC",   cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688393/Roll_Left_fvrbtf.mov",  position: "Dix Hallpike Left" },
  { id: "15UC",   cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688455/Lying_a63hvr.mov",  position: "Position 1 - Deep Head Hang, Position 2 - Dix Hallpike Left, Position 3 - Supine Roll Left" },
  { id: "16UC",   cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1781903042/Dix_HallPike_Left_2026-05-27-14-19-09_ac6cb987_dhbe88.mov",  position: "Dix Hallpike Left" },
  { id: "17LHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688670/L_HN_Ari_7_Severe_ib4uve.mov", position: "Position 1 - Supine Roll Left and Position 2 - Dix Hallpike Left" },
  { id: "18LHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688754/L_HN_Samantha_2_Severe_rwhufm.mov", position: "Supine Roll Left" },
  { id: "20LHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688788/L_HN_Alex_4_min_fl0gj1.mov", position: "Supine Roll Left" },
  { id: "21LHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688840/Lying_copHNmildClipped_giiyhg.mov", position: "Supine Roll Left" },
  { id: "22LHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780688921/Roll_Right_1_gelnet.mov", position: "Supine Roll Right" },
  { id: "23LHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780689030/Deep_Head_Hang_6_1_um6y2m.mov", position: "Supine Roll Left" },
  { id: "24RHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1782843610/Roll_Left_222_lwgeyt.mov", position: "Position 1 - Supine and Position 2 - Supine Roll Left" },
  { id: "27RHN",  cloudinaryId: "https://res.cloudinary.com/djlppkq0b/video/upload/v1780689218/Dix_HallPike_Left_rfawha.mov", position: "Supine Roll Right" },
];

export const TOTAL_VIDEOS = VIDEOS.length;
export const VIDEO_ORDER: string[] = VIDEOS.map((v) => v.id);

// ============================================================
// DEMO VIDEO — a single fixed practice video (31UCC). It is deliberately
// NOT part of the VIDEOS array, so it never appears in any tester's study,
// never counts toward VIDEO_ORDER / TOTAL_VIDEOS, and is shown only on the
// demo page and last in the admin video library.
//
// >>> TO SET THE VIDEO LINK: replace "PENDING" below with the Cloudinary URL
//     (or public ID) for the demo clip. Until then it shows "No video yet".
// ============================================================
export const DEMO_VIDEO: VideoConfig = {
  id: "31UCC",
  cloudinaryId: "PENDING",
  position: "Right Dix Hallpike",
};

export function getVideo(id: string): VideoConfig | undefined {
  return VIDEOS.find((v) => v.id === id);
}

export function videoIndex(id: string): number {
  return VIDEO_ORDER.indexOf(id);
}

// Builds a Cloudinary delivery URL that plays in an HTML <video> tag.
// Inserts f_auto so Cloudinary serves a browser-playable format (important:
// the source files are .mov / QuickTime, which most browsers can't play
// directly — f_auto transcodes to mp4/webm as needed).
export function videoUrl(cloudinaryId: string): string {
  if (cloudinaryId === "PENDING" || !cloudinaryId) return "";
  let url = cloudinaryId;
  if (!url.startsWith("http")) {
    url = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload/${cloudinaryId}`;
  }
  // Insert f_auto,q_auto right after "/upload/" if not already present.
  url = url.replace(/\/upload\/(?!f_auto)/, "/upload/f_auto,q_auto/");
  // Normalise a trailing .mov to .mp4 so the browser gets the transcoded file.
  url = url.replace(/\.mov($|\?)/i, ".mp4$1");
  return url;
}