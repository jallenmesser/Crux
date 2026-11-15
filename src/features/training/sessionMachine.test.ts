import { describe, expect, it } from 'vitest';
import {
  completedSetCount,
  getElapsedMs,
  getRestRemainingMs,
  isWorkoutDone,
  startSession,
  summarize,
  transition,
} from './sessionMachine';
import type { Session, SessionEvent, Workout } from './types';

const REST_DEFAULT = 10;
const T0 = 1_000_000;

const workout: Workout = {
  id: 'w1',
  name: 'Test Day',
  programName: 'Test',
  dayNumber: 1,
  estimatedMinutes: 30,
  exercises: [
    { id: 'a', name: 'A', kind: 'strength', sets: [{ reps: 5, weightKg: 20 }, { reps: 5, weightKg: 20 }] },
    { id: 'b', name: 'B', kind: 'bodyweight', restSeconds: 30, sets: [{ reps: 10 }] },
    { id: 'c', name: 'C', kind: 'timed', sets: [{ durationSec: 30 }] },
  ],
};

const start = () => startSession(workout, 's1', T0);
const run = (s: Session, now: number, ...events: SessionEvent[]) =>
  events.reduce((acc, e) => transition(acc, e, now, workout, REST_DEFAULT), s);
const step = (s: Session, e: SessionEvent, now: number) => transition(s, e, now, workout, REST_DEFAULT);

describe('startSession', () => {
  it('starts exercising at the first set', () => {
    const s = start();
    expect(s).toMatchObject({ status: 'exercising', exerciseIndex: 0, setIndex: 0, startedAt: T0, activeSince: T0 });
    expect(s.loggedSets).toEqual([]);
  });
});

describe('COMPLETE_SET', () => {
  it('logs prescribed values by default and starts rest with the default rest time', () => {
    const s = step(start(), { type: 'COMPLETE_SET' }, T0 + 1000);
    expect(s.loggedSets).toHaveLength(1);
    expect(s.loggedSets[0]).toMatchObject({ exerciseId: 'a', exerciseIndex: 0, setIndex: 0, reps: 5, weightKg: 20 });
    expect(s.status).toBe('resting');
    expect(s.restEndsAt).toBe(T0 + 1000 + REST_DEFAULT * 1000);
    expect(s).toMatchObject({ exerciseIndex: 0, setIndex: 1 });
  });

  it('uses recorded values over prescribed ones', () => {
    const s = step(start(), { type: 'COMPLETE_SET', reps: 7, weightKg: 22.5 }, T0);
    expect(s.loggedSets[0]).toMatchObject({ reps: 7, weightKg: 22.5 });
  });

  it('moves to the next exercise after the last set of an exercise', () => {
    const s = run(start(), T0, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' }, { type: 'COMPLETE_SET' });
    expect(s).toMatchObject({ status: 'resting', exerciseIndex: 1, setIndex: 0 });
  });

  it('does not rest after the final set; workout is done', () => {
    let s = start();
    s = run(s, T0, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' }, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' });
    s = run(s, T0, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' }, { type: 'COMPLETE_SET' });
    expect(s.status).toBe('exercising');
    expect(s.restEndsAt).toBeNull();
    expect(isWorkoutDone(s, workout)).toBe(true);
    expect(completedSetCount(s)).toBe(4);
  });

  it('is ignored while resting or paused', () => {
    const resting = step(start(), { type: 'COMPLETE_SET' }, T0);
    expect(step(resting, { type: 'COMPLETE_SET' }, T0)).toBe(resting);
    const paused = step(start(), { type: 'PAUSE' }, T0);
    expect(step(paused, { type: 'COMPLETE_SET' }, T0)).toBe(paused);
  });
});

describe('skip and next', () => {
  it('SKIP_EXERCISE marks it skipped and moves on without rest', () => {
    const s = step(start(), { type: 'SKIP_EXERCISE' }, T0);
    expect(s).toMatchObject({ status: 'exercising', exerciseIndex: 1, setIndex: 0 });
    expect(s.skippedExerciseIds).toEqual(['a']);
  });

  it('SKIP_EXERCISE after some sets were logged moves on without marking it skipped', () => {
    const s = run(start(), T0, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' }, { type: 'SKIP_EXERCISE' });
    expect(s).toMatchObject({ exerciseIndex: 1, setIndex: 0 });
    expect(s.skippedExerciseIds).toEqual([]);
  });

  it('skipping the last exercise ends the exercise list', () => {
    const s = run(start(), T0, { type: 'SKIP_EXERCISE' }, { type: 'SKIP_EXERCISE' }, { type: 'SKIP_EXERCISE' });
    expect(isWorkoutDone(s, workout)).toBe(true);
  });

  it('NEXT_EXERCISE after some sets keeps logged sets and does not mark skipped', () => {
    const s = run(start(), T0, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' }, { type: 'NEXT_EXERCISE' });
    expect(s).toMatchObject({ exerciseIndex: 1, setIndex: 0, status: 'exercising' });
    expect(s.skippedExerciseIds).toEqual([]);
    expect(s.loggedSets).toHaveLength(1);
  });

  it('NEXT_EXERCISE with no sets logged is ignored (use skip)', () => {
    const s = start();
    expect(step(s, { type: 'NEXT_EXERCISE' }, T0)).toBe(s);
  });

  it('SKIP_EXERCISE is ignored when the workout is already done', () => {
    const done = run(start(), T0, { type: 'SKIP_EXERCISE' }, { type: 'SKIP_EXERCISE' }, { type: 'SKIP_EXERCISE' });
    expect(step(done, { type: 'SKIP_EXERCISE' }, T0)).toBe(done);
  });
});

describe('rest', () => {
  const resting = () => step(start(), { type: 'COMPLETE_SET' }, T0);

  it('remaining time counts down from absolute timestamps', () => {
    const s = resting();
    expect(getRestRemainingMs(s, T0 + 4000)).toBe(6000);
    expect(getRestRemainingMs(s, T0 + 99_000)).toBe(0);
  });

  it('REST_DONE only ends rest once the time has elapsed', () => {
    const s = resting();
    expect(step(s, { type: 'REST_DONE' }, T0 + 5000)).toBe(s);
    const done = step(s, { type: 'REST_DONE' }, T0 + 10_000);
    expect(done).toMatchObject({ status: 'exercising', restEndsAt: null });
  });

  it('SKIP_REST returns to exercising', () => {
    expect(step(resting(), { type: 'SKIP_REST' }, T0 + 1000)).toMatchObject({ status: 'exercising', restEndsAt: null });
  });

  it('ADJUST_REST changes the end time and never goes below now', () => {
    const s = resting();
    expect(step(s, { type: 'ADJUST_REST', deltaSeconds: 15 }, T0 + 2000).restEndsAt).toBe(T0 + 25_000);
    expect(step(s, { type: 'ADJUST_REST', deltaSeconds: -60 }, T0 + 2000).restEndsAt).toBe(T0 + 2000);
  });

  it('uses the exercise rest when set', () => {
    // complete exercise A fully, then B's set uses restSeconds 30
    let s = run(start(), T0, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' }, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' });
    s = step(s, { type: 'COMPLETE_SET' }, T0 + 5000);
    expect(s.restEndsAt).toBe(T0 + 5000 + 30_000);
  });

  it('rest events are ignored when not resting', () => {
    const s = start();
    expect(step(s, { type: 'SKIP_REST' }, T0)).toBe(s);
    expect(step(s, { type: 'ADJUST_REST', deltaSeconds: 5 }, T0)).toBe(s);
    expect(step(s, { type: 'REST_DONE' }, T0)).toBe(s);
  });
});

describe('pause and resume', () => {
  it('pausing stops the elapsed clock', () => {
    let s = step(start(), { type: 'PAUSE' }, T0 + 10_000);
    expect(s.status).toBe('paused');
    expect(getElapsedMs(s, T0 + 10_000)).toBe(10_000);
    expect(getElapsedMs(s, T0 + 500_000)).toBe(10_000);
    s = step(s, { type: 'RESUME' }, T0 + 60_000);
    expect(s.status).toBe('exercising');
    expect(getElapsedMs(s, T0 + 65_000)).toBe(15_000);
  });

  it('pausing during rest freezes remaining rest and resume restores it', () => {
    let s = step(start(), { type: 'COMPLETE_SET' }, T0); // rest ends T0+10s
    s = step(s, { type: 'PAUSE' }, T0 + 4000); // 6s left
    expect(s.pausedFrom).toBe('resting');
    expect(getRestRemainingMs(s, T0 + 100_000)).toBe(6000);
    s = step(s, { type: 'RESUME' }, T0 + 50_000);
    expect(s.status).toBe('resting');
    expect(s.restEndsAt).toBe(T0 + 56_000);
  });

  it('PAUSE and RESUME are ignored in the wrong state', () => {
    const s = start();
    expect(step(s, { type: 'RESUME' }, T0)).toBe(s);
    const p = step(s, { type: 'PAUSE' }, T0);
    expect(step(p, { type: 'PAUSE' }, T0)).toBe(p);
  });
});

describe('FINISH and ABANDON', () => {
  it('FINISH requires at least one completed set', () => {
    const s = start();
    expect(step(s, { type: 'FINISH' }, T0)).toBe(s);
  });

  it('FINISH completes the session and freezes elapsed time', () => {
    const s = run(start(), T0 + 20_000, { type: 'COMPLETE_SET' }, { type: 'FINISH' });
    expect(s).toMatchObject({ status: 'completed', completedAt: T0 + 20_000, activeSince: null, restEndsAt: null });
    expect(getElapsedMs(s, T0 + 999_999)).toBe(20_000);
  });

  it('FINISH works from paused and excludes paused time', () => {
    let s = run(start(), T0, { type: 'COMPLETE_SET' });
    s = step(s, { type: 'PAUSE' }, T0 + 5000);
    s = step(s, { type: 'FINISH' }, T0 + 90_000);
    expect(s.status).toBe('completed');
    expect(getElapsedMs(s, T0 + 90_000)).toBe(5000);
  });

  it('ABANDON ends the session without completion', () => {
    const s = step(start(), { type: 'ABANDON' }, T0 + 1000);
    expect(s.status).toBe('abandoned');
  });

  it('ended sessions ignore all events', () => {
    const done = run(start(), T0, { type: 'COMPLETE_SET' }, { type: 'FINISH' });
    for (const e of [{ type: 'COMPLETE_SET' }, { type: 'PAUSE' }, { type: 'FINISH' }, { type: 'ABANDON' }] as SessionEvent[]) {
      expect(step(done, e, T0 + 1)).toBe(done);
    }
  });
});

describe('summarize', () => {
  it('counts completed sets, completed and skipped exercises', () => {
    let s = run(start(), T0, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' }, { type: 'COMPLETE_SET' }, { type: 'SKIP_REST' });
    s = run(s, T0, { type: 'SKIP_EXERCISE' }, { type: 'COMPLETE_SET' }); // skip B, do C
    const sum = summarize(s, workout);
    expect(sum).toEqual({ completedSets: 3, completedExercises: 2, skippedExercises: 1 });
  });
});

describe('purity', () => {
  it('never mutates the input session', () => {
    const s = start();
    const snapshot = JSON.parse(JSON.stringify(s));
    step(s, { type: 'COMPLETE_SET' }, T0 + 1);
    step(s, { type: 'PAUSE' }, T0 + 1);
    expect(s).toEqual(snapshot);
  });
});
