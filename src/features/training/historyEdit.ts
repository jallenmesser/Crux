// Edits to a finished workout. Pure. XP is not touched here: the award is made once, at completion.

import type { LoggedSet, Session, Workout } from './types';

export type SetValues = Partial<Pick<LoggedSet, 'reps' | 'weightKg' | 'durationSec' | 'distanceM'>>;

const byPosition = (a: LoggedSet, b: LoggedSet) => a.exerciseIndex - b.exerciseIndex || a.setIndex - b.setIndex;

export function updateLoggedSet(session: Session, exerciseIndex: number, setIndex: number, values: SetValues): Session {
  const i = session.loggedSets.findIndex((l) => l.exerciseIndex === exerciseIndex && l.setIndex === setIndex);
  if (i < 0) return session;
  const loggedSets = session.loggedSets.map((l, idx) => (idx === i ? { ...l, ...values } : l));
  return { ...session, loggedSets };
}

export function addLoggedSet(session: Session, workout: Workout, exerciseIndex: number, setIndex: number, now: number): Session {
  const exercise = workout.exercises[exerciseIndex];
  const prescribed = exercise?.sets[setIndex];
  if (!exercise || !prescribed) return session;
  if (session.loggedSets.some((l) => l.exerciseIndex === exerciseIndex && l.setIndex === setIndex)) return session;
  const added: LoggedSet = {
    exerciseId: exercise.id,
    exerciseIndex,
    setIndex,
    reps: prescribed.reps,
    weightKg: prescribed.weightKg,
    durationSec: prescribed.durationSec,
    distanceM: prescribed.distanceM,
    completedAt: now,
  };
  return {
    ...session,
    loggedSets: [...session.loggedSets, added].sort(byPosition),
    skippedExerciseIds: session.skippedExerciseIds.filter((id) => id !== exercise.id),
  };
}
