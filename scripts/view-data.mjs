// View all stored answers.  Run:  node scripts/view-data.mjs
import { DatabaseSync } from "node:sqlite";
import path from "path";

const db = new DatabaseSync(path.join(process.cwd(), "data", "study.db"));
const rows = db.prepare("SELECT * FROM answers ORDER BY user_id, video_id").all();

if (rows.length === 0) {
  console.log("No answers stored yet.");
} else {
  console.log(`${rows.length} row(s) in the database:\n`);
  for (const r of rows) {
    console.log(
      `user=${r.user_id}  video=${r.video_id}  pos=${r.video_position}\n` +
      `   initial: ${r.initial_classification} (${r.initial_confidence_percent}%, ${r.initial_response_time_seconds}s)\n` +
      `   final:   ${r.final_classification} (${r.final_confidence_percent}%, ${r.final_response_time_seconds}s)  replays=${r.replay_count}  total=${r.total_classification_time_seconds}s\n` +
      `   otolith: ${r.otolith_location_answer} (${r.otolith_confidence_percent}%)\n` +
      `   maneuver:${r.maneuver_answer} (${r.maneuver_confidence_percent}%)\n` +
      `   submitted: ${r.final_submission_timestamp}\n`
    );
  }
}
db.close();
