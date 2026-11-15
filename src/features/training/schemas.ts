// Runtime validation for workout and session data (persisted locally or fetched from the server).
import { z } from 'zod';

const num = z.number().finite().nonnegative();

export const PrescribedSetSchema = z.object({
  reps: num.optional(),
  weightKg: num.optional(),
  durationSec: num.optional(),
  distanceM: num.optional(),
});

export const WorkoutExerciseSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  kind: z.enum(['warmup', 'strength', 'bodyweight', 'timed', 'cardio', 'mobility']),
  instructions: z.string().optional(),
  notes: z.string().optional(),
  muscleGroups: z.array(z.string()).optional(),
  restSeconds: num.optional(),
  sets: z.array(PrescribedSetSchema).min(1),
});

export const WorkoutSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  programName: z.string().min(1),
  dayNumber: z.number().int().positive(),
  estimatedMinutes: num,
  exercises: z.array(WorkoutExerciseSchema).min(1),
});

export const LoggedSetSchema = z.object({
  exerciseId: z.string(),
  exerciseIndex: z.number().int().nonnegative(),
  setIndex: z.number().int().nonnegative(),
  reps: num.optional(),
  weightKg: num.optional(),
  durationSec: num.optional(),
  distanceM: num.optional(),
  completedAt: z.number(),
});

export const SessionSchema = z.object({
  id: z.string().min(1),
  workoutId: z.string().min(1),
  status: z.enum(['exercising', 'resting', 'paused', 'completed', 'abandoned']),
  exerciseIndex: z.number().int().nonnegative(),
  setIndex: z.number().int().nonnegative(),
  loggedSets: z.array(LoggedSetSchema),
  skippedExerciseIds: z.array(z.string()),
  startedAt: z.number(),
  elapsedMs: num,
  activeSince: z.number().nullable(),
  restEndsAt: z.number().nullable(),
  pausedFrom: z.enum(['exercising', 'resting']).nullable(),
  pausedRestRemainingMs: num.nullable(),
  completedAt: z.number().nullable(),
});
