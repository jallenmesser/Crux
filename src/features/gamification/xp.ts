// XP and level logic. Pure TypeScript. All numbers come from src/config/gamification.ts.
// XP is transaction-based: balance is always derived from the ledger, never incremented directly.
// This module defines the rules; the server applies them and enforces the unique key.

import { GAMIFICATION } from '@/config/gamification';
import type { Session } from '@/features/training/types';

export type GamificationRules = {
  xp: { workoutBase: number; perCompletedSet: number };
  levels: { xpPerLevel: number };
};

export type XpTransaction = {
  id: string;
  userId: string;
  amount: number;
  source: 'workout_completed';
  // Unique per award. A second award with the same key is a no-op.
  sourceKey: string;
  createdAt: number;
};

export function calculateWorkoutXp(completedSets: number, rules: GamificationRules = GAMIFICATION): number {
  const sets = Math.max(0, completedSets);
  return Math.max(0, Math.floor(rules.xp.workoutBase + rules.xp.perCompletedSet * sets));
}

export function workoutSourceKey(sessionId: string): string {
  return `workout_session:${sessionId}`;
}

export type AwardResult = {
  ledger: XpTransaction[];
  transaction: XpTransaction | null;
  awarded: boolean;
};

export function awardWorkoutXp(
  ledger: readonly XpTransaction[],
  session: Session,
  ctx: { userId: string; txId: string; now: number },
  rules: GamificationRules = GAMIFICATION,
): AwardResult {
  // Only a completed session earns XP. Opening or abandoning a workout never does.
  if (session.status !== 'completed') {
    return { ledger: [...ledger], transaction: null, awarded: false };
  }
  const sourceKey = workoutSourceKey(session.id);
  const existing = ledger.find((t) => t.sourceKey === sourceKey);
  if (existing) {
    return { ledger: [...ledger], transaction: existing, awarded: false };
  }
  const transaction: XpTransaction = {
    id: ctx.txId,
    userId: ctx.userId,
    amount: calculateWorkoutXp(session.loggedSets.length, rules),
    source: 'workout_completed',
    sourceKey,
    createdAt: ctx.now,
  };
  return { ledger: [...ledger, transaction], transaction, awarded: true };
}

export function getBalance(ledger: readonly XpTransaction[]): number {
  return ledger.reduce((sum, t) => sum + t.amount, 0);
}

export type LevelInfo = {
  level: number; // starts at 1
  totalXp: number;
  xpIntoLevel: number;
  xpForNextLevel: number; // XP needed to complete the current level
  progress: number; // 0..1 within the current level
};

export function getLevelInfo(totalXp: number, rules: GamificationRules = GAMIFICATION): LevelInfo {
  const total = Math.max(0, totalXp);
  const per = rules.levels.xpPerLevel;
  const xpIntoLevel = total % per;
  return {
    level: Math.floor(total / per) + 1,
    totalXp: total,
    xpIntoLevel,
    xpForNextLevel: per,
    progress: xpIntoLevel / per,
  };
}

export function levelsGained(xpBefore: number, xpAfter: number, rules: GamificationRules = GAMIFICATION): number {
  return Math.max(0, getLevelInfo(xpAfter, rules).level - getLevelInfo(xpBefore, rules).level);
}
