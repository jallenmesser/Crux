import { describe, expect, it } from 'vitest';
import { formatClock, formatDuration, describeSet } from './format';

describe('formatClock', () => {
  it('formats ms as m:ss and rounds up partial seconds for countdowns', () => {
    expect(formatClock(0)).toBe('0:00');
    expect(formatClock(9_100)).toBe('0:10');
    expect(formatClock(65_000)).toBe('1:05');
    expect(formatClock(-5)).toBe('0:00');
  });
});

describe('formatDuration', () => {
  it('formats elapsed ms as m:ss, flooring seconds', () => {
    expect(formatDuration(9_900)).toBe('0:09');
    expect(formatDuration(3_725_000)).toBe('62:05');
  });
});

describe('describeSet', () => {
  it('describes weighted reps, bodyweight reps, time and distance', () => {
    expect(describeSet({ reps: 8, weightKg: 20 })).toBe('8 x 20 kg');
    expect(describeSet({ reps: 12 })).toBe('12 reps');
    expect(describeSet({ durationSec: 45 })).toBe('45 sec');
    expect(describeSet({ durationSec: 300, distanceM: 800 })).toBe('5:00 · 800 m');
    expect(describeSet({})).toBe('');
  });
});
