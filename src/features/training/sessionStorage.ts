// Local persistence for the active workout session. One slot, versioned, validated on read.
// KeyValueStore matches AsyncStorage's API, so it plugs in directly; tests use an in-memory one.

import { transition } from './sessionMachine';
import { SessionSchema } from './schemas';
import type { Session, Workout } from './types';

export type KeyValueStore = {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
};

const KEY = 'crux.activeSession.v1';
const VERSION = 1;

export type SavedSession = { session: Session; savedAt: number };

export async function saveSession(store: KeyValueStore, session: Session, now: number): Promise<void> {
  await store.setItem(KEY, JSON.stringify({ version: VERSION, savedAt: now, session }));
}

export async function loadSession(store: KeyValueStore): Promise<SavedSession | null> {
  let raw: string | null;
  try {
    raw = await store.getItem(KEY);
  } catch {
    return null;
  }
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as { version?: unknown; savedAt?: unknown; session?: unknown };
    if (parsed.version !== VERSION || typeof parsed.savedAt !== 'number') return null;
    const result = SessionSchema.safeParse(parsed.session);
    if (!result.success) return null;
    return { session: result.data, savedAt: parsed.savedAt };
  } catch {
    return null;
  }
}

export async function clearSession(store: KeyValueStore): Promise<void> {
  await store.removeItem(KEY);
}

// After the app was killed or backgrounded, do not count the gap as workout time:
// pause the session as of its last save. The user taps Resume to continue.
export function restoreAfterInterruption(saved: SavedSession, workout: Workout, defaultRestSeconds: number): Session {
  return transition(saved.session, { type: 'PAUSE' }, saved.savedAt, workout, defaultRestSeconds);
}

export function isResumable(session: Session): boolean {
  return session.status === 'exercising' || session.status === 'resting' || session.status === 'paused';
}

export function resumeInfo(session: Session, workout: Workout) {
  if (!isResumable(session)) return null;
  const exercise = workout.exercises[session.exerciseIndex];
  if (!exercise) return null;
  return {
    exerciseName: exercise.name,
    setNumber: session.setIndex + 1,
    totalSets: exercise.sets.length,
    completedSets: session.loggedSets.length,
  };
}
