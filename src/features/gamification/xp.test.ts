import { describe, expect, it } from 'vitest';
import { GAMIFICATION } from '@/config/gamification';
import { startSession, transition } from '@/features/training/sessionMachine';
import type { Session, Workout } from '@/features/training/types';
import { awardWorkoutXp, calculateWorkoutXp, getBalance, getLevelInfo, levelsGained, type XpTransaction } from './xp';

const cfg = { xp: { workoutBase: 10, perCompletedSet: 1 }, levels: { xpPerLevel: 20 } } as const;
const T0 = 1_000_000;

const workout: Workout = {
  id: 'w1',
  name: 'T',
  programName: 'T',
  dayNumber: 1,
  estimatedMinutes: 10,
  exercises: [{ id: 'a', name: 'A', kind: 'strength', sets: [{ reps: 5 }, { reps: 5 }, { reps: 5 }] }],
};

function completedSession(sets: number, id = 's1'): Session {
  let s = startSession(workout, id, T0);
  for (let i = 0; i < sets; i++) {
    s = transition(s, { type: 'COMPLETE_SET' }, T0 + i, workout, 10);
    s = transition(s, { type: 'SKIP_REST' }, T0 + i, workout, 10);
  }
  return transition(s, { type: 'FINISH' }, T0 + 100, workout, 10);
}

describe('calculateWorkoutXp', () => {
  it('is base plus per completed set', () => {
    expect(calculateWorkoutXp(0, cfg)).toBe(10);
    expect(calculateWorkoutXp(3, cfg)).toBe(13);
    expect(calculateWorkoutXp(12, cfg)).toBe(22);
  });

  it('reads the central config by default', () => {
    const { workoutBase, perCompletedSet } = GAMIFICATION.xp;
    expect(calculateWorkoutXp(5)).toBe(workoutBase + 5 * perCompletedSet);
  });

  it('never returns a negative or fractional amount', () => {
    expect(calculateWorkoutXp(-4, cfg)).toBe(10);
    expect(Number.isInteger(calculateWorkoutXp(3, { ...cfg, xp: { workoutBase: 10, perCompletedSet: 1.5 } }))).toBe(true);
  });
});

describe('awardWorkoutXp', () => {
  it('creates one transaction for a completed session', () => {
    const r = awardWorkoutXp([], completedSession(3), { userId: 'u1', txId: 't1', now: T0 + 200 }, cfg);
    expect(r.awarded).toBe(true);
    expect(r.ledger).toHaveLength(1);
    expect(r.transaction).toMatchObject({
      id: 't1',
      userId: 'u1',
      amount: 13,
      source: 'workout_completed',
      sourceKey: 'workout_session:s1',
      createdAt: T0 + 200,
    });
  });

  it('awards exactly once: a second attempt returns the existing transaction', () => {
    const session = completedSession(3);
    const first = awardWorkoutXp([], session, { userId: 'u1', txId: 't1', now: T0 }, cfg);
    const second = awardWorkoutXp(first.ledger, session, { userId: 'u1', txId: 't2', now: T0 + 5 }, cfg);
    expect(second.awarded).toBe(false);
    expect(second.ledger).toHaveLength(1);
    expect(second.transaction).toEqual(first.transaction);
    expect(getBalance(second.ledger)).toBe(13);
  });

  it('awards separately for different sessions', () => {
    const a = awardWorkoutXp([], completedSession(1, 'sA'), { userId: 'u1', txId: 't1', now: T0 }, cfg);
    const b = awardWorkoutXp(a.ledger, completedSession(2, 'sB'), { userId: 'u1', txId: 't2', now: T0 }, cfg);
    expect(b.ledger).toHaveLength(2);
    expect(getBalance(b.ledger)).toBe(11 + 12);
  });

  it('does not award for sessions that are not completed', () => {
    const active = startSession(workout, 's1', T0);
    const abandoned = transition(active, { type: 'ABANDON' }, T0, workout, 10);
    for (const s of [active, abandoned]) {
      const r = awardWorkoutXp([], s, { userId: 'u1', txId: 't1', now: T0 }, cfg);
      expect(r.awarded).toBe(false);
      expect(r.transaction).toBeNull();
      expect(r.ledger).toEqual([]);
    }
  });

  it('does not mutate the input ledger', () => {
    const ledger: XpTransaction[] = [];
    awardWorkoutXp(ledger, completedSession(2), { userId: 'u1', txId: 't1', now: T0 }, cfg);
    expect(ledger).toEqual([]);
  });
});

describe('getBalance', () => {
  it('sums transactions and is 0 for an empty ledger', () => {
    expect(getBalance([])).toBe(0);
    const tx = (amount: number, i: number): XpTransaction => ({
      id: `t${i}`, userId: 'u', amount, source: 'workout_completed', sourceKey: `k${i}`, createdAt: i,
    });
    expect(getBalance([tx(10, 1), tx(7, 2)])).toBe(17);
  });
});

describe('getLevelInfo', () => {
  it('starts at level 1 with 0 XP', () => {
    expect(getLevelInfo(0, cfg)).toEqual({ level: 1, totalXp: 0, xpIntoLevel: 0, xpForNextLevel: 20, progress: 0 });
  });

  it('stays on the level until the boundary, then moves up', () => {
    expect(getLevelInfo(19, cfg)).toMatchObject({ level: 1, xpIntoLevel: 19 });
    expect(getLevelInfo(20, cfg)).toMatchObject({ level: 2, xpIntoLevel: 0 });
    expect(getLevelInfo(45, cfg)).toMatchObject({ level: 3, xpIntoLevel: 5, progress: 0.25 });
  });

  it('treats negative XP as 0', () => {
    expect(getLevelInfo(-5, cfg).level).toBe(1);
  });

  it('uses the central config by default', () => {
    expect(getLevelInfo(GAMIFICATION.levels.xpPerLevel).level).toBe(2);
  });
});

describe('levelsGained', () => {
  it('reports how many levels a gain crossed', () => {
    expect(levelsGained(10, 23, cfg)).toBe(1);
    expect(levelsGained(10, 19, cfg)).toBe(0);
    expect(levelsGained(5, 65, cfg)).toBe(3);
  });
});
