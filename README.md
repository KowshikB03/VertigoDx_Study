# SmartVertigo™ — Login, Auth & Admin Dashboard

This now includes **phase 1** (login, auth, admin dashboard) and
**phase 2** (the 25-question study flow: video player, timers, replays,
the three questions, resume-on-relogin).

## Fill in your videos

Open `lib/videos.ts`:
- Set `CLOUDINARY_CLOUD_NAME` to your Cloudinary cloud name.
- For each of the 25 videos, replace `cloudinaryId` (currently
  `PLACEHOLDER_video_N`) with the real Cloudinary public ID or full URL, and
  set the correct `position` (Supine, Dix Hallpike Right, etc.).

Until you do this, the player will try to load placeholder URLs and show
nothing — that's expected. The rest of the flow (questions, timers, saving)
works regardless.

## Run it

```bash
npm install      # pure JS, no native compile, no Visual Studio needed
npm run dev      # http://localhost:3000
```

Requires **Node 22.5+** (you're on 24). Uses Node's built-in `node:sqlite`,
so there is nothing to compile — the earlier `better-sqlite3` /
Visual Studio error is gone.

You'll see one harmless line on startup: `ExperimentalWarning: SQLite is an
experimental feature`. That's just Node flagging the built-in module; it works
fine. It goes away in future Node LTS.

Open `http://localhost:3000` → redirects to `/login`.

## Logins (edit in `lib/users.ts`)

| ID          | Password         | Role   | Lands on |
|-------------|------------------|--------|----------|
| admin       | changeme-admin   | admin  | /admin   |
| clinician1  | vertigo-001      | tester | /study   |
| clinician2  | vertigo-002      | tester | /study   |
| clinician3  | vertigo-003      | tester | /study   |

**Add users:** open `lib/users.ts` and add to the `USERS` array. No signup,
no password reset — you control the list. Change the admin password before use.

## What each file does

- `lib/users.ts` — the hardcoded user list + login lookup.
- `lib/session.ts` — sets/reads an httpOnly cookie; re-validates against the config.
- `lib/db.ts` — SQLite (`data/study.db`), the `answers` table (all required fields), and `getAllAnswers()`.
- `app/login/page.tsx` — login screen.
- `app/page.tsx` — routes you to /admin or /study based on role.
- `app/admin/page.tsx` — gated admin dashboard; renders the answers table + summary stats.
- `app/admin/AdminTable.tsx` — scrollable table with a user-ID filter.
- `app/study/page.tsx` — the test-taker flow: shows instructions, resumes at the next unanswered video, renders the question steps, shows completion when all 25 are done.
- `app/study/Instructions.tsx` — pre-test instructions screen.
- `app/study/StudyFlow.tsx` — drives one video: 1a initial → 1a final → proceed → 1b otolith → 1c maneuver.
- `app/study/VideoPlayer.tsx` — play-only player (no scrub/speed/download), enforces single first-play, counts replays up to 5.
- `app/study/FormBits.tsx` — radio group + confidence slider.
- `app/api/save` — saves each step; computes timers server-side; enforces no-overwrite.
- `lib/videos.ts` — the 25 videos config (Cloudinary IDs + positions). **Fill this in.**
- `lib/options.ts` — all the radio-button choices (nystagmus, otolith, maneuver).
- `app/api/login` / `app/api/logout` — auth endpoints.

## How the study flow works

1. First login shows the instructions page; "Begin Study" starts video 1.
2. Per video: watch once (Timer 1 runs) → submit initial answer + confidence
   (initial is stored permanently here) → replays unlock, up to 5, auto-counted
   (Timer 2 runs) → submit final answer + confidence + optional uncertain flag
   → "Proceed" button → otolith location (Q1b) → treatment maneuver (Q1c) →
   next video.
3. Timers are hidden from the test taker and computed on the server from
   submitted start timestamps, so they can't be edited in dev tools.
4. Replay count is automatic, capped at 5.
5. Closing the browser and logging back in **resumes at the next unanswered
   video** (and at the right step within a half-finished video).
6. After all 25, a completion screen appears.

## Database

Auto-created on first run at `data/study.db`. The `answers` table holds one row
per video/question set with every field from the spec (initial + final answers,
confidence, replay count, all timers, otolith, maneuver, timestamps). The admin
table reads straight from it.

## Notes

- **SQLite** via Node's built-in `node:sqlite` — zero setup, no native build,
  single file at `data/study.db`. Same SQL works if you later move to Postgres.
- **Next.js 15.5.19** — patched for the December 2025 RCE (CVE-2025-66478 /
  React2Shell). React pinned to 19.0.1.
- `npm audit` may still show **2 moderate** warnings from a transitive PostCSS
  dependency inside Next. **Do not run `npm audit fix --force`** — it tries to
  downgrade Next to v9, which is far worse. The PostCSS issue is build-time CSS
  only and doesn't affect the running app; it clears in a later Next release.
- **Video** will be served via Cloudinary in the study phase (your choice).
- Deploys to a normal VPS/Render as-is. On Vercel, the SQLite file won't persist
  across deploys — use a hosted DB there.
