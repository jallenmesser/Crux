// TEMPORARY local stand-in for the server XP ledger (step 6 replaces it with Supabase).
// Uses the same award rules and the same exactly-once key, so swapping is a storage change.

import { z } from 'zod';
import { GAMIFICATION } from '@/config/gamification';
import type { KeyValueStore } from '@/features/training/sessionStorage';
import type { Session } from '@/features/training/types';
import {
  awardWorkoutXp,
  getBalance,
  getLevelInfo,
  levelsGained,
  workoutSourceKey,
  type GamificationRules,
  type LevelInfo,
  type XpTransaction,
} from './xp';

const KEY = 'crux.xpLedger.v1';

const LedgerSchema = z.array(
  z.object({
    id: z.string(),
    userId: z.string(),
    amount: z.number(),
    source: z.literal('workout_completed'),
    sourceKey: z.string(),
    createdAt: z.number(),
  }),
);

async function readLedger(store: KeyValueStore): Promise<XpTransaction[]> {
  try {
    const raw = await store.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as { version?: unknown; ledger?: unknown };
    if (parsed.version !== 1) return [];
    const r = LedgerSchema.safeParse(parsed.ledger);
    return r.success ? r.data : [];
  } catch {
    return [];
  }
}

export type Progress = LevelInfo;

export async function loadProgress(store: KeyValueStore, rules: GamificationRules = GAMIFICATION): Promise<Progress> {
  return getLevelInfo(getBalance(await readLedger(store)), rules);
}

export type AwardOutcome = {
  awarded: boolean; // true only the first time
  amount: number;
  totalBefore: number;
  totalAfter: number;
  levelsGained: number;
  progress: Progress;
};

export async function awardForSession(
  store: KeyValueStore,
  session: Session,
  userId: string,
  now: number,
  rules: GamificationRules = GAMIFICATION,
): Promise<AwardOutcome> {
  const ledger = await readLedger(store);
  const result = awardWorkoutXp(ledger, session, { userId, txId: `tx-${session.id}`, now }, rules);
  if (result.awarded) {
    await store.setItem(KEY, JSON.stringify({ version: 1, ledger: result.ledger }));
  }
  const totalAfter = getBalance(result.ledger);
  const amount = result.transaction?.amount ?? 0;
  const isThisSession = result.transaction?.sourceKey === workoutSourceKey(session.id);
  const totalBefore = isThisSession ? totalAfter - amount : totalAfter;
  return {
    awarded: result.awarded,
    amount,
    totalBefore,
    totalAfter,
    levelsGained: levelsGained(totalBefore, totalAfter, rules),
    progress: getLevelInfo(totalAfter, rules),
  };
}
