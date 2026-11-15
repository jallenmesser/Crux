# Slice 1: Log a workout, earn XP

Status: DRAFT, awaiting Jallen's approval. No code until approved.

## Goal
One flow works end to end: start a workout, log exercises and sets, finish, see XP earned and current level. Data survives an app restart.

## Done condition
1. User can add a workout with 1+ exercises, each with 1+ sets (reps, weight).
2. Tapping Finish saves the workout and awards XP by the rules below.
3. A summary screen shows XP earned, total XP, level, and progress to next level.
4. Home shows level, XP bar, and workout history (newest first).
5. Kill and reopen the app: history and XP are still there.
6. XP logic has unit tests written first and passing. verification-loop passes.

## Out of scope (later slices)
Accounts/auth, cloud sync, AI coach or generated plans, streaks, achievements, exercise library search, rest timers, progression suggestions, charts, units toggle (kg only for now).

## Stack
- Expo (current SDK), React Native, TypeScript strict
- Expo Router for navigation
- Zustand for client state, persisted with AsyncStorage
- Zod to validate data read from storage
- Jest + jest-expo + React Native Testing Library
- Runs in Expo Go on phone and in the web build

## Screens
1. **Home** (`/`): level badge, XP bar (xp into level / xp needed), "Start workout" button, history list.
2. **Log workout** (`/workout/new`): workout name (optional), list of exercises. Per exercise: name (free text), sets with reps and weight, add/remove set. "Add exercise". "Finish" disabled until at least one valid set exists.
3. **Summary** (`/workout/[id]`): XP breakdown, total XP, level-up message if a level was gained, "Done" back to Home. Also used to view past workouts from history.

## Data model
```
Workout  { id, name, startedAt, finishedAt, exercises: Exercise[], xpEarned }
Exercise { id, name, sets: Set[] }
Set      { id, reps: int 1..100, weight: number 0..1000 (kg, 0 = bodyweight) }
Profile  { totalXp }   // level is derived, never stored
```
Level is always computed from totalXp so the two cannot drift.

## XP rules (pure functions in `src/xp/`)
- **Per set:** 10 XP for each valid set.
- **Volume bonus:** +1 XP per 100 kg of volume (reps x weight, summed over the workout), rounded down, capped at 50.
- **Completion bonus:** +20 XP for finishing a workout with at least 3 sets.
- Workout XP is computed once at Finish and stored on the workout. Editing history is out of scope, so no recompute.
- **Levels:** cumulative XP to reach level n = `50 * n * (n - 1)`. L1 = 0, L2 = 50, L3 = 150, L4 = 300, L5 = 500.

Worked example: 3 exercises x 3 sets = 9 sets, 4,500 kg volume. 90 + 45 + 20 = 155 XP. From 0 XP that lands on level 3.

These numbers are placeholders chosen to be easy to tune. They live in one config object.

## Module layout
```
app/                 Expo Router routes (thin, no logic)
src/xp/              calculateWorkoutXp, levelFromXp, progressInLevel  (pure, tested)
src/workouts/        types, zod schemas, validation (valid set, valid workout)
src/store/           zustand store + persistence
src/ui/              shared components
```

## Test plan (written first)
- `calculateWorkoutXp`: no sets, one set, volume bonus rounding, bonus cap, completion bonus threshold at 2 vs 3 sets, bodyweight (weight 0).
- `levelFromXp` and `progressInLevel`: boundaries at 0, 49, 50, 149, 150, large values.
- Validation: reps and weight bounds, empty exercise name, workout with zero valid sets rejected.
- Store: finishing a workout adds it to history and increments totalXp exactly once; persisted state rehydrates; corrupt storage falls back to empty state rather than crashing.
- One component test: logging a set and finishing shows the summary with the expected XP.

## Security
Local-only, no auth, no network, no payments. Security-review not required for this slice. Storage reads are validated with Zod. It becomes required when accounts or sync arrive.

## Build steps (for plan-orchestrate after approval)
1. Scaffold Expo + TypeScript + Jest, commit.
2. XP and validation tests, then implementation.
3. Store and persistence tests, then implementation.
4. Screens: Log workout, Summary, Home.
5. Verification-loop and report.
Work happens on branch `claude/workout-xp-spec-s1v88o`, small commits, no push to main.

## Decisions for Jallen
1. **XP numbers:** keep the placeholders above, or give me your own?
2. **Weight unit:** kg only for now (default), or lb?
3. **Exercise input:** free text (default, fastest), or a small built-in list to pick from?
