import { describe, expect, it } from 'vitest';
import type { KeyValueStore } from '@/features/training/sessionStorage';
import { startSession, transition } from '@/features/training/sessionMachine';
import type { Workout } from '@/features/training/types';
import { awardForSession, loadProgress } from './localProgress';

const T0 = 1_000_000;
const workout: Workout = {
  id: 'w', name: 'T', programName: 'P', dayNumber: 1, estimatedMinutes: 5,
  exercises: [{ id: 'a', name: 'A', kind: 'strength', sets: [{ reps: 5 }, { reps: 5 }] }],
};
const mem = (): KeyValueStore => {
  const d: Record<string, string> = {};
  return { getItem: async (k) => d[k] ?? null, setItem: async (k, v) => void (d[k] = v), removeItem: async (k) => void delete d[k] };
};
const finished = (id: string, sets: number) => {
  let s = startSession(workout, id, T0);
  for (let i = 0; i < sets; i++) {
    s = transition(s, { type: 'COMPLETE_SET' }, T0, workout, 10);
    s = transition(s, { type: 'SKIP_REST' }, T0, workout, 10);
  }
  return transition(s, { type: 'FINISH' }, T0, workout, 10);
};
const rules = { xp: { workoutBase: 10, perCompletedSet: 1 }, levels: { xpPerLevel: 20 } };

describe('local progress', () => {
  it('starts empty', async () => {
    expect(await loadProgress(mem(), rules)).toMatchObject({ totalXp: 0, level: 1 });
  });

  it('awards once and persists across reloads', async () => {
    const store = mem();
    const r = await awardForSession(store, finished('s1', 2), 'u', T0, rules);
    expect(r).toMatchObject({ awarded: true, amount: 12, totalBefore: 0, totalAfter: 12, levelsGained: 0 });
    expect(await loadProgress(store, rules)).toMatchObject({ totalXp: 12, level: 1 });
  });

  it('a repeat call for the same session does not add XP and reports the same amount', async () => {
    const store = mem();
    const s = finished('s1', 2);
    await awardForSession(store, s, 'u', T0, rules);
    const again = await awardForSession(store, s, 'u', T0 + 5, rules);
    expect(again).toMatchObject({ awarded: false, amount: 12, totalAfter: 12, totalBefore: 0 });
    expect((await loadProgress(store, rules)).totalXp).toBe(12);
  });

  it('reports level-ups', async () => {
    const store = mem();
    await awardForSession(store, finished('s1', 2), 'u', T0, rules); // 12
    const r = await awardForSession(store, finished('s2', 2), 'u', T0, rules); // 24
    expect(r).toMatchObject({ totalBefore: 12, totalAfter: 24, levelsGained: 1 });
  });

  it('survives a corrupt ledger by starting empty', async () => {
    const store = mem();
    await store.setItem('crux.xpLedger.v1', '{bad');
    expect((await loadProgress(store, rules)).totalXp).toBe(0);
  });

  it('returns no award for an unfinished session', async () => {
    const r = await awardForSession(mem(), startSession(workout, 's', T0), 'u', T0, rules);
    expect(r).toMatchObject({ awarded: false, amount: 0 });
  });
});
