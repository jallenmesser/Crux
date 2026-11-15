// Structured workout data. Same shape the AI trainer will return later.
// Weights in kg, distance in meters, time in seconds. Unit conversion happens at display.

export type PrescribedSet = {
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  distanceM?: number;
};

export type ExerciseKind = 'warmup' | 'strength' | 'bodyweight' | 'timed' | 'cardio' | 'mobility';

export type WorkoutExercise = {
  id: string;
  name: string;
  kind: ExerciseKind;
  instructions?: string;
  notes?: string;
  muscleGroups?: string[];
  restSeconds?: number; // falls back to WORKOUT_DEFAULTS.restSeconds
  sets: PrescribedSet[];
};

export type Workout = {
  id: string;
  name: string;
  programName: string;
  dayNumber: number;
  estimatedMinutes: number;
  exercises: WorkoutExercise[];
};

export type LoggedSet = {
  exerciseId: string;
  exerciseIndex: number;
  setIndex: number;
  reps?: number;
  weightKg?: number;
  durationSec?: number;
  distanceM?: number;
  completedAt: number;
};

export type SessionStatus = 'exercising' | 'resting' | 'paused' | 'completed' | 'abandoned';

export type Session = {
  id: string;
  workoutId: string;
  status: SessionStatus;
  // Position of the NEXT set to do. exerciseIndex === exercises.length means all exercises are done.
  exerciseIndex: number;
  setIndex: number;
  loggedSets: LoggedSet[];
  skippedExerciseIds: string[];
  startedAt: number;
  elapsedMs: number; // accumulated active time, excluding pauses
  activeSince: number | null; // clock-running marker; null while paused or ended
  restEndsAt: number | null; // absolute timestamp while resting
  pausedFrom: 'exercising' | 'resting' | null;
  pausedRestRemainingMs: number | null;
  completedAt: number | null;
};

export type SessionEvent =
  | { type: 'COMPLETE_SET'; reps?: number; weightKg?: number; durationSec?: number; distanceM?: number }
  | { type: 'SKIP_EXERCISE' }
  | { type: 'NEXT_EXERCISE' }
  | { type: 'RESTART_EXERCISES' }
  | { type: 'SKIP_REST' }
  | { type: 'ADJUST_REST'; deltaSeconds: number }
  | { type: 'REST_DONE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'FINISH' }
  | { type: 'ABANDON' };
