# Replit prototype audit

Source: the CruxFitness zip exported from Replit (Nov 15, 2026). Reusable files are copied to `reference/replit-prototype/` for reading. They are reference material, not code to paste into the Expo app. Secrets and the auth config were deliberately left out.

## What it is
A web app, not React Native. React 18, Vite, TypeScript, Tailwind, shadcn/ui, wouter and react-router, TanStack Query. Backend is Express with Drizzle ORM on Postgres (Neon), with JWT and passport auth. It was built by prompting Replit's agent in phases (Battle Pass core, profiles, auth, database, bug fixes).

## What exists
- Signup, login, JWT auth.
- Free workout logging with per-set data (reps, weight, duration, distance) and a recovery activity type.
- Programs: browse, preview, assign, and work through a program day by day.
- XP, levels, streak counter, and a 10-tier Battle Pass with 6 badges and 4 color themes.
- Rewards page (claim, equip avatar badge, switch theme), profile with stats, unit preference (metric or imperial), and a debug tab.
- Seeded exercise library and rewards.

## What does not exist
- No AI trainer. There is no AI SDK in package.json and no AI calls in the code.
- No social features, wellness, or nutrition.
- No resume for interrupted workouts that I saw.

## XP and progression rules already in the prototype
These contradict the product brief, which says XP values are "not decided". Treat them as the working baseline and confirm with Jallen before locking them in.
- Workout: 10 base XP, plus 1 per set, plus 2 per minute of timed work, plus 1 per 500 m of distance.
- Recovery: 5 base XP, plus 1 per 10 minutes.
- Streak bonus: +5 at a 3 day streak, +10 at 7 days or more.
- Weekly bonus: +20 after 7 activities (a simple counter, not a calendar week).
- Daily cap: 40 XP.
- Levels: 20 XP per level. Rewards unlock by tier up to tier 10. Season id is hardcoded as "oct2025".
- There is also a second, unused-looking volume formula in `xpConfig.ts` (0.1 XP per rep times kg).

## Problems to fix, not copy
1. **XP logic is split.** The server adds a session total on workout create, while the client has its own `awardWorkoutXP` with the streak, weekly, and daily cap rules. The two can disagree.
2. **The client can write progress.** `POST /api/battlepass/progress` saves whatever body it receives, and the debug endpoints (add XP, reset) take a userId with no auth check that I could see. XP must be awarded server-side only, as one transaction per award.
3. **Hardcoded secrets.** `shared/authConfig.ts` contains a dev JWT secret and a hardcoded debug account password, and it sits in the `shared` folder that the client also imports from. Do not carry it over. If that password is used anywhere real, change it.
4. **The workout flow is one giant file.** `WorkoutLog.tsx` is about 1,370 lines and `ProgramWorkout.tsx` about 430. This is likely why the workout pages do not flow together. Rebuild this as small screens with a single workout-session state machine.
5. **Level model is flat.** A fixed 20 XP per level with 10 tiers means the whole pass completes after 200 XP, which a few workouts can reach under the daily cap. The pacing needs a real design.
6. **Visual direction differs from the brief.** The prototype uses a light theme with emerald green. The brief calls for dark grayscale with neon accents.

## Worth reusing
- Data shapes: per-set JSON, program days with prescribed sets, the reward and theme config.
- The XP computation concepts, moved server-side and made configurable in one place.
- Kg and meters stored in the database with unit conversion at display time.
- The seeded exercise templates and reward definitions.
- Unit preference, streak calculation, and daily cap ideas.
