// Local record of completed workouts (stand-in until history is saved server-side).
// One entry per finished session. Used to show "completed today" and to edit logged sets.

import { z } from 'zod';
import { SessionSchema } from './schemas';
import type { KeyValueStore } from './sessionStorage';
import type { Session } from './types';

const KEY = 'crux.history.v1';

export type CompletedWorkout = { session: Session; xpAwarded: number; dateKey: string };

const HistorySchema = z.array(
  z.object({ session: SessionSchema, xpAwarded: z.number().nonnegative(), dateKey: z.string() }),
);

// Local calendar date, so "today" matches what the user sees on their clock.
export function dateKey(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export async function loadHistory(store: KeyValueStore): Promise<CompletedWorkout[]> {
  try {
    const raw = await store.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { version?: unknown; entries?: unknown };
    if (parsed.version !== 1) return [];
    const r = HistorySchema.safeParse(parsed.entries);
    return r.success ? r.data : [];
  } catch {
    return [];
  }
}

export async function upsertCompleted(store: KeyValueStore, entry: CompletedWorkout): Promise<void> {
  const all = await loadHistory(store);
  const next = [...all.filter((e) => e.session.id !== entry.session.id), entry];
  await store.setItem(KEY, JSON.stringify({ version: 1, entries: next }));
}

export function findCompletedOn(history: readonly CompletedWorkout[], workoutId: string, key: string): CompletedWorkout | null {
  return history.find((e) => e.session.workoutId === workoutId && e.dateKey === key) ?? null;
}
