import { describe, expect, it } from 'vitest';
import { dateKey, findCompletedOn, loadHistory, upsertCompleted, type CompletedWorkout } from './workoutHistory';
import { startSession, transition } from './sessionMachine';
import type { KeyValueStore } from './sessionStorage';
import type { Workout } from './types';

const T0 = new Date(2026, 10, 15, 9, 30).getTime(); // local Nov 15 2026, 09:30
const workout: Workout = {
  id: 'w', name: 'T', programName: 'P', dayNumber: 1, estimatedMinutes: 5,
  exercises: [{ id: 'a', name: 'A', kind: 'strength', sets: [{ reps: 5 }] }],
};
const mem = (): KeyValueStore => {
  const d: Record<string, string> = {};
  return { getItem: async (k) => d[k] ?? null, setItem: async (k, v) => void (d[k] = v), removeItem: async (k) => void delete d[k] };
};
const entry = (id: string, at: number, xp = 11): CompletedWorkout => {
  let s = startSession(workout, id, at);
  s = transition(s, { type: 'COMPLETE_SET' }, at, workout, 10);
  s = transition(s, { type: 'FINISH' }, at, workout, 10);
  return { session: s, xpAwarded: xp, dateKey: dateKey(at) };
};

describe('dateKey', () => {
  it('is the local calendar date', () => {
    expect(dateKey(T0)).toBe('2026-11-15');
    expect(dateKey(new Date(2026, 0, 5, 23, 59).getTime())).toBe('2026-01-05');
  });
});

describe('history store', () => {
  it('starts empty and survives corrupt data', async () => {
    expect(await loadHistory(mem())).toEqual([]);
    const s = mem();
    await s.setItem('crux.history.v1', '{bad');
    expect(await loadHistory(s)).toEqual([]);
  });

  it('upserts by session id and round-trips', async () => {
    const store = mem();
    const e = entry('s1', T0);
    await upsertCompleted(store, e);
    await upsertCompleted(store, { ...e, xpAwarded: 99 });
    const h = await loadHistory(store);
    expect(h).toHaveLength(1);
    expect(h[0].xpAwarded).toBe(99);
    expect(h[0].session).toEqual(e.session);
  });

  it('keeps separate sessions', async () => {
    const store = mem();
    await upsertCompleted(store, entry('s1', T0));
    await upsertCompleted(store, entry('s2', T0 + 86_400_000));
    expect(await loadHistory(store)).toHaveLength(2);
  });
});

describe('findCompletedOn', () => {
  it('finds a completed workout for that workout and local date only', () => {
    const h = [entry('s1', T0)];
    expect(findCompletedOn(h, 'w', '2026-11-15')?.session.id).toBe('s1');
    expect(findCompletedOn(h, 'w', '2026-11-16')).toBeNull();
    expect(findCompletedOn(h, 'other', '2026-11-15')).toBeNull();
  });
});
