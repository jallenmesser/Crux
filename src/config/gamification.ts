// Single home for tunable gamification numbers. Screens and logic read from here.
// Baseline values come from the Replit prototype; the brief marks them "not decided".
// PLACEHOLDER for testing. Final values are decided before ship.

export const GAMIFICATION = {
  xp: {
    workoutBase: 10,
    perCompletedSet: 1,
  },
  levels: {
    // Flat curve for the slice. Replace with a real curve before ship.
    xpPerLevel: 20,
  },
} as const;

export const WORKOUT_DEFAULTS = {
  // Used when an exercise does not set its own rest. Becomes variable per workout later.
  restSeconds: 10,
} as const;

export type GamificationConfig = typeof GAMIFICATION;
