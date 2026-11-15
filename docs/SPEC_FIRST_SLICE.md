# Crux first slice: spec (DRAFT, awaiting Jallen's approval)

Sources: `CLAUDE.md`, `docs/PRODUCT_BRIEF.md` (section 12), `docs/REPLIT_PROTOTYPE.md`.
Items marked **PROPOSED** are my suggestions. Items marked **DECISION NEEDED** block the plan.

## 1. Goal
One complete workout, end to end, on a real phone: open today's workout, run it set by set, rest, skip, pause, resume, finish, earn XP once, see updated progress.

## 2. Done condition (from brief 12.3)
- A user completes a whole workout with no navigation errors.
- Every completed set is recorded.
- Killing and reopening the app mid-workout resumes where they left off.
- Workout history is saved.
- XP is awarded exactly once per completed workout, even on retry or double tap.
- The user sees updated XP and level.
- It works on an actual phone (Expo Go or dev build).

## 3. In scope
Five screens: Home/Today, Workout Overview, Active Exercise, Rest Timer, Workout Complete.
Behaviors: log reps and weight per set, move between exercises, skip an exercise, adjust or skip rest, pause and resume, finish, persist history, award XP, show progress.

## 4. Out of scope (this slice)
AI generation, onboarding, program browsing, Battle Pass UI, quests, achievements, streaks, leaderboards, social and share (button hidden or inert), wellness, nutrition, avatars, payments, mood check-in on the complete screen.

## 5. Where the workout comes from
**PROPOSED:** one hand-authored workout (for example "Day 01: Upper Body Strength") shipped as seed data, in the same structured shape the AI trainer will return later. This keeps the slice honest without inventing AI behavior, and the stored-workout rule is met from day one. Exercise content (names, instructions, demo image) is placeholder until Jallen supplies or approves content.

## 6. Screens

| # | Screen | Shows | Actions |
|---|---|---|---|
| 1 | Home / Today | Today's workout card, program name, XP and level, one daily objective placeholder | Open workout, Resume (if a session is active) |
| 2 | Workout Overview | Name, program, day, exercise list with sets x reps, estimated duration, muscle groups | Start |
| 3 | Active Exercise | Exercise name, demo (static image), instructions, set N of M, reps and weight inputs (prefilled from prescription), exercise progress | Complete set, Skip exercise, Pause, Next |
| 4 | Rest Timer | Countdown, next exercise, short message | Skip rest, +/- time, Pause |
| 5 | Workout Complete | Exercises and sets done, duration, XP earned, new XP total and level, level-up if any | Done (back to Home). Share is not built |

Navigation: Home -> Overview -> Active <-> Rest -> Complete -> Home. Back from Active asks "Pause or quit?" and never silently loses data.

## 7. Workout session state machine
One state machine owns the whole flow. Screens render state and send events. No screen holds workout logic.

States: `idle` -> `inProgress` (sub-states: `exercising`, `resting`) <-> `paused` -> `completed` | `abandoned`.
Events: START, COMPLETE_SET, SKIP_EXERCISE, NEXT_EXERCISE, START_REST, SKIP_REST, ADJUST_REST, PAUSE, RESUME, FINISH, ABANDON.
Rules:
- Illegal events are ignored, not errors (for example COMPLETE_SET while paused).
- Every transition is saved immediately, so a crash loses at most the in-flight tap.
- Rest timer stores an absolute end timestamp, not a ticking counter, so it stays correct after backgrounding or relaunch.
- Pause stops the duration clock and stores remaining rest time.
- FINISH is allowed when at least one set is logged. Skipped exercises count as skipped, not completed.
- The machine is plain TypeScript with no React imports, so it is unit-testable and independent of any avatar or UI.

## 8. XP and progression
Architecture rules (fixed by the brief):
- One XP transaction record per award. Balance is derived from transactions, never incremented from the UI.
- Workout completion is authoritative and awards XP exactly once: the transaction carries a unique key per workout session, and a second award attempt returns the existing one.
- Award happens server-side only. The client requests completion and displays the result.
- All numbers live in one config module: XP formula, level curve.

**DECISION NEEDED (XP formula).** The brief says values are not decided. Options, all configurable:
- A. Prototype baseline: 10 base + 1 per completed set. (Prototype also had timed, distance, streak, weekly, and daily cap rules; I would leave those out of this slice.)
- B. Flat: a fixed amount per completed workout, ignoring sets.
- C. You set the numbers.

**DECISION NEEDED (level curve).** The prototype used a flat 20 XP per level, which it flagged as too fast. Options:
- A. Use flat 20 for the slice, labeled placeholder, redesign later.
- B. A simple increasing curve you pick.
- C. You set the numbers.

Skipped exercises and partial workouts: **PROPOSED** XP counts completed sets only, so skipping earns nothing for that exercise. Abandoned workouts earn no XP and are kept in history as abandoned.

## 9. Data (logical only, not a schema)
Needed concepts, named after the brief's entities: workout (stored, versioned structure), workout exercises with prescribed sets, workout session (state, timestamps, pause time), logged sets (reps, weight, completed or skipped), history record, XP transaction (amount, source, unique key), user progression (derived total and level).
Weights stored in kg with unit conversion at display, per the prototype's good idea. Exact tables and columns come with the backend choice, not before.

## 10. Architecture
- Expo + React Native + TypeScript, file-based routing (Expo Router).
- `features/training/` holds the state machine, session persistence, and types. `features/gamification/` holds the XP config and XP calculation. Neither imports UI.
- `app/` holds thin screens. `components/` holds reusable pieces (set tracker, timer, XP bar, progress bar).
- State: the session machine for workout flow, TanStack Query for server data, Zod to validate data at the API boundary.
- No API keys in the app. Slice has no AI calls anyway.
- Dark grayscale theme with one neon accent held in a theme token, exact color **DECISION NEEDED** (any placeholder is fine for the slice).

## 11. Interruption and resume
- Active session is persisted locally on every transition (secure local storage) and mirrored to the backend when online.
- On launch, if an unfinished session exists, Home shows Resume with the exercise and set it was on.
- Completion needs the backend to award XP. If offline at FINISH, the session is saved as "finished, XP pending" and the award is requested when connectivity returns, still exactly once via the unique key.

## 12. Backend and auth
**DECISION NEEDED (backend and database).** The brief leaves this open. Options:
- A. Supabase (Postgres, auth, row-level security, edge functions for the XP award and later AI calls). Fastest to a real server-side award.
- B. Firebase (Firestore, auth, cloud functions).
- C. Custom Node API + Postgres (what the prototype used). Most work for the slice.
My recommendation: A. It gives server-side XP and the later AI proxy without running our own server.

**DECISION NEEDED (auth).** Options: email and password, Apple and Google sign-in, or anonymous device account for the slice and real auth next. Recommendation: anonymous account for the slice behind the same user-id interface, so real auth slots in later. Do not carry over anything from the prototype's auth, and no debug endpoints.

## 13. Testing plan (tests first, per crux-build)
Unit tests before implementation for:
1. State machine: every legal transition, illegal events ignored, pause and resume timing, skip, finish rules.
2. Rest timer: remaining time from timestamps, including after a simulated app restart.
3. XP calculation from config for completed, partial, and skipped workouts.
4. Level derivation from total XP, including level-up boundary.
5. Idempotent award: same session twice yields one transaction.
6. Session persistence: serialize, restore, resume at the right set.
Integration: full workout run through the machine ending in one XP transaction and one history record.
Manual device pass: the 14 functional requirements in brief 12.2 on a real phone, including kill-and-relaunch mid-workout.
Before done: verification-loop. Before the backend and auth work is merged: security-review.

## 14. Build order (for the plan step)
1. Scaffold Expo app, theme tokens, config module.
2. State machine + tests.
3. XP and level logic + tests.
4. Seed workout and local persistence.
5. Screens 1 to 5 wired to the machine.
6. Backend: XP award endpoint, history save, idempotency.
7. Device validation and verification-loop.
Each step is a small commit on the branch. Nothing goes to main without approval.

## 15. Decisions (resolved by Jallen)
1. Backend: Supabase.
2. Auth: none for the slice. Anonymous device account behind a user-id interface, so no login screens and fast iteration. Real auth comes later without touching the workout code.
3. XP: prototype cadence. Slice uses base 10 + 1 per completed set. Timed/distance bonuses, streak, weekly bonus and daily cap are deferred (ASSUMPTION, confirm if you want any of them in the slice).
4. Level curve: fixed test number, flat 20 XP per level, in config, labeled placeholder. Final curve decided before ship.
5. Workout content: placeholder, but the data shape must cover typical workout needs: warm-up, strength sets (reps x weight), bodyweight reps, timed holds, cardio by time or distance, per-exercise notes, and per-exercise rest. Supersets and circuits are shaped for but not built in the slice UI.
6. Rest: 10 seconds default for now, stored as a per-exercise value that falls back to one config default, so it can vary by workout later.
