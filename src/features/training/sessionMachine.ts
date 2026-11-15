// Workout session state machine. Pure TypeScript: no React, no storage, no clock.
// Callers pass `now` (ms epoch) so behavior is deterministic and testable.
// Illegal events return the same session object (reference equality) and change nothing.

import type { LoggedSet, Session, SessionEvent, Workout } from './types';

export function startSession(workout: Workout, sessionId: string, now: number): Session {
  return {
    id: sessionId,
    workoutId: workout.id,
    status: 'exercising',
    exerciseIndex: 0,
    setIndex: 0,
    loggedSets: [],
    skippedExerciseIds: [],
    startedAt: now,
    elapsedMs: 0,
    activeSince: now,
    restEndsAt: null,
    pausedFrom: null,
    pausedRestRemainingMs: null,
    completedAt: null,
  };
}

export function isWorkoutDone(session: Session, workout: Workout): boolean {
  return session.exerciseIndex >= workout.exercises.length;
}

export function completedSetCount(session: Session): number {
  return session.loggedSets.length;
}

export function getElapsedMs(session: Session, now: number): number {
  return session.elapsedMs + (session.activeSince === null ? 0 : Math.max(0, now - session.activeSince));
}

export function getRestRemainingMs(session: Session, now: number): number {
  if (session.status === 'resting' && session.restEndsAt !== null) {
    return Math.max(0, session.restEndsAt - now);
  }
  if (session.status === 'paused' && session.pausedFrom === 'resting') {
    return session.pausedRestRemainingMs ?? 0;
  }
  return 0;
}

export function summarize(session: Session, workout: Workout) {
  const done = new Set(session.loggedSets.map((s) => s.exerciseId));
  return {
    completedSets: session.loggedSets.length,
    completedExercises: workout.exercises.filter((e) => done.has(e.id)).length,
    skippedExercises: session.skippedExerciseIds.length,
  };
}

function isActive(s: Session): boolean {
  return s.status === 'exercising' || s.status === 'resting' || s.status === 'paused';
}

function hasLogged(session: Session, exerciseId: string): boolean {
  return session.loggedSets.some((l) => l.exerciseId === exerciseId);
}

export function transition(
  session: Session,
  event: SessionEvent,
  now: number,
  workout: Workout,
  defaultRestSeconds: number,
): Session {
  const done = isWorkoutDone(session, workout);
  const exercise = done ? undefined : workout.exercises[session.exerciseIndex];

  switch (event.type) {
    case 'COMPLETE_SET': {
      if (session.status !== 'exercising' || !exercise) return session;
      const prescribed = exercise.sets[session.setIndex] ?? {};
      const logged: LoggedSet = {
        exerciseId: exercise.id,
        exerciseIndex: session.exerciseIndex,
        setIndex: session.setIndex,
        reps: event.reps ?? prescribed.reps,
        weightKg: event.weightKg ?? prescribed.weightKg,
        durationSec: event.durationSec ?? prescribed.durationSec,
        distanceM: event.distanceM ?? prescribed.distanceM,
        completedAt: now,
      };
      const moreSets = session.setIndex + 1 < exercise.sets.length;
      const next = moreSets
        ? { exerciseIndex: session.exerciseIndex, setIndex: session.setIndex + 1 }
        : { exerciseIndex: session.exerciseIndex + 1, setIndex: 0 };
      const finishedAll = next.exerciseIndex >= workout.exercises.length;
      const restMs = (exercise.restSeconds ?? defaultRestSeconds) * 1000;
      return {
        ...session,
        ...next,
        loggedSets: [...session.loggedSets, logged],
        status: finishedAll ? 'exercising' : 'resting',
        restEndsAt: finishedAll ? null : now + restMs,
      };
    }

    case 'SKIP_EXERCISE': {
      if (session.status !== 'exercising' || !exercise) return session;
      // Skipping after some sets were logged just moves on; only untouched exercises count as skipped.
      const skipped =
        hasLogged(session, exercise.id) || session.skippedExerciseIds.includes(exercise.id)
          ? session.skippedExerciseIds
          : [...session.skippedExerciseIds, exercise.id];
      return { ...session, exerciseIndex: session.exerciseIndex + 1, setIndex: 0, skippedExerciseIds: skipped };
    }

    case 'NEXT_EXERCISE': {
      if (session.status !== 'exercising' || !exercise || !hasLogged(session, exercise.id)) return session;
      return { ...session, exerciseIndex: session.exerciseIndex + 1, setIndex: 0 };
    }

    case 'SKIP_REST': {
      if (session.status !== 'resting') return session;
      return { ...session, status: 'exercising', restEndsAt: null };
    }

    case 'REST_DONE': {
      if (session.status !== 'resting' || session.restEndsAt === null || now < session.restEndsAt) return session;
      return { ...session, status: 'exercising', restEndsAt: null };
    }

    case 'ADJUST_REST': {
      if (session.status !== 'resting' || session.restEndsAt === null) return session;
      return { ...session, restEndsAt: Math.max(now, session.restEndsAt + event.deltaSeconds * 1000) };
    }

    case 'PAUSE': {
      if (session.status !== 'exercising' && session.status !== 'resting') return session;
      const resting = session.status === 'resting' && session.restEndsAt !== null;
      return {
        ...session,
        status: 'paused',
        elapsedMs: getElapsedMs(session, now),
        activeSince: null,
        pausedFrom: resting ? 'resting' : 'exercising',
        pausedRestRemainingMs: resting ? Math.max(0, (session.restEndsAt as number) - now) : null,
        restEndsAt: null,
      };
    }

    case 'RESUME': {
      if (session.status !== 'paused' || !session.pausedFrom) return session;
      const resting = session.pausedFrom === 'resting';
      return {
        ...session,
        status: session.pausedFrom,
        activeSince: now,
        restEndsAt: resting ? now + (session.pausedRestRemainingMs ?? 0) : null,
        pausedFrom: null,
        pausedRestRemainingMs: null,
      };
    }

    case 'FINISH': {
      if (!isActive(session) || session.loggedSets.length === 0) return session;
      return {
        ...session,
        status: 'completed',
        elapsedMs: getElapsedMs(session, now),
        activeSince: null,
        restEndsAt: null,
        pausedFrom: null,
        pausedRestRemainingMs: null,
        completedAt: now,
      };
    }

    case 'ABANDON': {
      if (!isActive(session)) return session;
      return {
        ...session,
        status: 'abandoned',
        elapsedMs: getElapsedMs(session, now),
        activeSince: null,
        restEndsAt: null,
        pausedFrom: null,
        pausedRestRemainingMs: null,
      };
    }
  }
}
