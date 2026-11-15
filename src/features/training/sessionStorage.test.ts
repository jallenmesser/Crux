import { describe, expect, it } from 'vitest';
import { startSession, transition, getElapsedMs, getRestRemainingMs } from './sessionMachine';
import {
  clearSession,
  loadSession,
  restoreAfterInterruption,
  resumeInfo,
  saveSession,
  type KeyValueStore,
} from './sessionStorage';
import type { Workout } from './types';

const T0 = 1_000_000;
const workout: Workout = {
  id: 'w1', name: 'T', programName: 'P', dayNumber: 1, estimatedMinutes: 10,
  exercises: [
    { id: 'a', name: 'Bench Press', kind: 'strength', sets: [{ reps: 5, weightKg: 40 }, { reps: 5, weightKg: 40 }, { reps: 5, weightKg: 40 }] },
    { id: 'b', name: 'Plank', kind: 'timed', sets: [{ durationSec: 30 }] },
  ],
};

function memoryStore(initial: Record<string, string> = {}): KeyValueStore & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: async (k) => data[k] ?? null,
    setItem: async (k, v) => void (data[k] = v),
    removeItem: async (k) => void delete data[k],
  };
}

describe('save / load / clear', () => {
  it('round-trips a session exactly', async () => {
    const store = memoryStore();
    let s = startSession(workout, 's1', T0);
    s = transition(s, { type: 'COMPLETE_SET', reps: 6, weightKg: 42.5 }, T0 + 1000, workout, 10);
    await saveSession(store, s, T0 + 1000);
    const loaded = await loadSession(store);
    expect(loaded?.session).toEqual(s);
    expect(loaded?.savedAt).toBe(T0 + 1000);
  });

  it('returns null when nothing is saved', async () => {
    expect(await loadSession(memoryStore())).toBeNull();
  });

  it('returns null for corrupt or invalid data instead of crashing', async () => {
    expect(await loadSession(memoryStore({ 'crux.activeSession.v1': 'not json' }))).toBeNull();
    expect(await loadSession(memoryStore({ 'crux.activeSession.v1': '{"version":1,"savedAt":1,"session":{"id":"x"}}' }))).toBeNull();
  });

  it('returns null for an unknown version', async () => {
    const store = memoryStore();
    const s = startSession(workout, 's1', T0);
    await saveSession(store, s, T0);
    store.data['crux.activeSession.v1'] = store.data['crux.activeSession.v1'].replace('"version":1', '"version":99');
    expect(await loadSession(store)).toBeNull();
  });

  it('clearSession removes it', async () => {
    const store = memoryStore();
    await saveSession(store, startSession(workout, 's1', T0), T0);
    await clearSession(store);
    expect(await loadSession(store)).toBeNull();
  });

  it('keeps one slot: saving replaces the previous session', async () => {
    const store = memoryStore();
    await saveSession(store, startSession(workout, 's1', T0), T0);
    await saveSession(store, startSession(workout, 's2', T0), T0);
    expect((await loadSession(store))?.session.id).toBe('s2');
  });
});

describe('restoreAfterInterruption', () => {
  it('pauses an exercising session at the last save time so killed-app time is not counted', () => {
    const s = startSession(workout, 's1', T0);
    const restored = restoreAfterInterruption({ session: s, savedAt: T0 + 20_000 }, workout, 10);
    expect(restored.status).toBe('paused');
    expect(getElapsedMs(restored, T0 + 9_000_000)).toBe(20_000);
  });

  it('keeps remaining rest as it was at the last save', () => {
    let s = startSession(workout, 's1', T0);
    s = transition(s, { type: 'COMPLETE_SET' }, T0 + 1000, workout, 10); // rest ends T0+11s
    const restored = restoreAfterInterruption({ session: s, savedAt: T0 + 4000 }, workout, 10);
    expect(restored.status).toBe('paused');
    expect(getRestRemainingMs(restored, T0 + 9_000_000)).toBe(7000);
  });

  it('leaves an already paused session unchanged', () => {
    let s = startSession(workout, 's1', T0);
    s = transition(s, { type: 'PAUSE' }, T0 + 5000, workout, 10);
    expect(restoreAfterInterruption({ session: s, savedAt: T0 + 6000 }, workout, 10)).toBe(s);
  });

  it('leaves a completed session unchanged', () => {
    let s = startSession(workout, 's1', T0);
    s = transition(s, { type: 'COMPLETE_SET' }, T0, workout, 10);
    s = transition(s, { type: 'FINISH' }, T0, workout, 10);
    expect(restoreAfterInterruption({ session: s, savedAt: T0 + 1 }, workout, 10)).toBe(s);
  });
});

describe('resumeInfo', () => {
  it('describes where the user left off', () => {
    let s = startSession(workout, 's1', T0);
    s = transition(s, { type: 'COMPLETE_SET' }, T0, workout, 10);
    expect(resumeInfo(s, workout)).toEqual({ exerciseName: 'Bench Press', setNumber: 2, totalSets: 3, completedSets: 1 });
  });

  it('returns null when the workout is done or the session is not resumable', () => {
    let s = startSession(workout, 's1', T0);
    s = transition(s, { type: 'ABANDON' }, T0, workout, 10);
    expect(resumeInfo(s, workout)).toBeNull();
    const done = { ...startSession(workout, 's2', T0), exerciseIndex: 2 };
    expect(resumeInfo(done, workout)).toBeNull();
  });
});
