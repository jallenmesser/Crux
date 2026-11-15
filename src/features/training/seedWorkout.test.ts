import { describe, expect, it } from 'vitest';
import { SEED_WORKOUT } from './seedWorkout';
import { WorkoutSchema } from './schemas';

describe('SEED_WORKOUT (placeholder)', () => {
  it('matches the workout schema', () => {
    expect(WorkoutSchema.safeParse(SEED_WORKOUT).success).toBe(true);
  });

  it('has unique exercise ids', () => {
    const ids = SEED_WORKOUT.exercises.map((e) => e.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('covers the typical workout needs', () => {
    const ex = SEED_WORKOUT.exercises;
    const kinds = new Set(ex.map((e) => e.kind));
    for (const k of ['warmup', 'strength', 'bodyweight', 'timed', 'cardio', 'mobility']) {
      expect(kinds.has(k as never)).toBe(true);
    }
    const sets = ex.flatMap((e) => e.sets);
    expect(sets.some((s) => s.weightKg !== undefined && s.reps !== undefined)).toBe(true); // weighted reps
    expect(sets.some((s) => s.reps !== undefined && s.weightKg === undefined)).toBe(true); // bodyweight reps
    expect(sets.some((s) => s.durationSec !== undefined)).toBe(true); // timed
    expect(sets.some((s) => s.distanceM !== undefined)).toBe(true); // distance
    expect(ex.some((e) => e.restSeconds !== undefined)).toBe(true); // per-exercise rest
    expect(ex.some((e) => e.notes)).toBe(true);
    expect(ex.every((e) => e.instructions)).toBe(true);
  });
});
