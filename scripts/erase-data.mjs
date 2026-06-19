// Erase stored answers.
//
//   node scripts/erase-data.mjs            -> erases ALL answers (asks to confirm)
//   node scripts/erase-data.mjs clinician1 -> erases only that user's answers
//
import { DatabaseSync } from "node:sqlite";
import path from "path";
import readline from "readline";

const db = new DatabaseSync(path.join(process.cwd(), "data", "study.db"));
const user = process.argv[2];

function erase() {
  if (user) {
    const info = db.prepare("DELETE FROM answers WHERE user_id = ?").run(user);
    console.log(`Erased ${info.changes} row(s) for user "${user}".`);
  } else {
    const info = db.prepare("DELETE FROM answers").run();
    console.log(`Erased ALL ${info.changes} row(s).`);
  }
  db.close();
}

const target = user ? `all answers for "${user}"` : "ALL answers for EVERY user";
const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
rl.question(`This will permanently delete ${target}. Type "yes" to confirm: `, (a) => {
  rl.close();
  if (a.trim().toLowerCase() === "yes") erase();
  else { console.log("Cancelled. Nothing was deleted."); db.close(); }
});
