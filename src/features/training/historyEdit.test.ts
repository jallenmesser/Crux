import { describe, expect, it } from 'vitest';
import { addLoggedSet, updateLoggedSet } from './historyEdit';
import { startSession, transition } from './sessionMachine';
import type { Session, Workout } from './types';

const T0 = 1_000_000;
const workout: Workout = {
  id: 'w', name: 'T', programName: 'P', dayNumber: 1, estimatedMinutes: 5,
  exercises: [
    { id: 'a', name: 'A', kind: 'strength', sets: [{ reps: 5, weightKg: 20 }, { reps: 5, weightKg: 20 }] },
    { id: 'b', name: 'B', kind: 'bodyweight', sets: [{ reps: 10 }] },
  ],
};
// A: set 1 logged, set 2 not; B skipped. Finished.
function finished(): Session {
  let s = startSession(workout, 's1', T0);
  s = transition(s, { type: 'COMPLETE_SET', reps: 6, weightKg: 22.5 }, T0, workout, 10);
  s = transition(s, { type: 'SKIP_REST' }, T0, workout, 10);
  s = transition(s, { type: 'NEXT_EXERCISE' }, T0, workout, 10);
  s = transition(s, { type: 'SKIP_EXERCISE' }, T0, workout, 10);
  return transition(s, { type: 'FINISH' }, T0 + 5, workout, 10);
}

describe('updateLoggedSet', () => {
  it('changes only the values given on that set', () => {
    const s = updateLoggedSet(finished(), 0, 0, { reps: 8 });
    expect(s.loggedSets[0]).toMatchObject({ reps: 8, weightKg: 22.5 });
  });

  it('is a no-op for a set that was not logged', () => {
    const before = finished();
    expect(updateLoggedSet(before, 0, 1, { reps: 8 })).toBe(before);
  });

  it('does not mutate and keeps the session completed', () => {
    const before = finished();
    const snap = JSON.parse(JSON.stringify(before));
    const after = updateLoggedSet(before, 0, 0, { reps: 9 });
    expect(before).toEqual(snap);
    expect(after.status).toBe('completed');
  });
});

describe('addLoggedSet', () => {
  it('adds a missing set with prescribed values, in order', () => {
    const s = addLoggedSet(finished(), workout, 0, 1, T0 + 10);
    expect(s.loggedSets.map((l) => [l.exerciseIndex, l.setIndex])).toEqual([[0, 0], [0, 1]]);
    expect(s.loggedSets[1]).toMatchObject({ exerciseId: 'a', reps: 5, weightKg: 20, completedAt: T0 + 10 });
  });

  it('un-skips an exercise once a set is added to it', () => {
    const s = addLoggedSet(finished(), workout, 1, 0, T0 + 10);
    expect(s.skippedExerciseIds).toEqual([]);
    expect(s.loggedSets).toHaveLength(2);
  });

  it('is a no-op if the set is already logged or the slot does not exist', () => {
    const before = finished();
    expect(addLoggedSet(before, workout, 0, 0, T0)).toBe(before);
    expect(addLoggedSet(before, workout, 0, 9, T0)).toBe(before);
    expect(addLoggedSet(before, workout, 7, 0, T0)).toBe(before);
  });

  it('does not change completion time or status', () => {
    const before = finished();
    const after = addLoggedSet(before, workout, 0, 1, T0 + 99);
    expect(after).toMatchObject({ status: 'completed', completedAt: before.completedAt });
  });
});
