import type { PrescribedSet } from '@/features/training/types';

const pad = (n: number) => String(n).padStart(2, '0');

// Countdown display: rounds partial seconds up so it shows 0:00 only when finished.
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  return `${Math.floor(total / 60)}:${pad(total % 60)}`;
}

// Elapsed display: floors partial seconds.
export function formatDuration(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(total / 60)}:${pad(total % 60)}`;
}

// Weights are kg in storage. Unit preference (kg or lb) is applied here later.
export function describeSet(set: PrescribedSet): string {
  const { reps, weightKg, durationSec, distanceM } = set;
  if (reps !== undefined && weightKg !== undefined) return `${reps} x ${weightKg} kg`;
  if (reps !== undefined) return `${reps} reps`;
  if (durationSec !== undefined && distanceM !== undefined) return `${formatClock(durationSec * 1000)} · ${distanceM} m`;
  if (durationSec !== undefined) return `${durationSec} sec`;
  if (distanceM !== undefined) return `${distanceM} m`;
  return '';
}
