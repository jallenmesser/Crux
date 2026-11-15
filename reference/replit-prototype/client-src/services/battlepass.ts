import { PassProgress } from "@/types/battlepass";
import { battlePassXP } from "@/config/xpConfig";
import { WorkoutSessionWithExercises } from "@/types/workout";
import { ExerciseTemplate } from "@shared/schema";

/**
 * Compute current level from total XP
 */
export function computeLevelFromXP(xp: number, xpPerLevel: number): number {
  return Math.floor(xp / xpPerLevel);
}

/**
 * Clamp XP earned to daily cap
 * Ensures earned XP never exceeds remaining cap and never goes negative
 */
export function clampDailyXP(earned: number, capRemaining: number): number {
  return Math.max(0, Math.min(earned, capRemaining));
}

/**
 * Compute streak based on last activity date
 */
export function computeStreak(lastActivityISO: string | null, todayISO: string): number {
  if (!lastActivityISO) return 1;
  
  const lastActivity = new Date(lastActivityISO);
  const today = new Date(todayISO);
  
  // Reset time to start of day for accurate date comparison
  lastActivity.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  
  const diffDays = Math.floor((today.getTime() - lastActivity.getTime()) / (1000 * 60 * 60 * 24));
  
  // If activity was yesterday, increment streak
  if (diffDays === 1) {
    return 1; // Will be added to existing streak
  }
  
  // If activity was today, maintain streak (return 0 to not increment)
  if (diffDays === 0) {
    return 0;
  }
  
  // If more than 1 day gap, streak is broken (reset to 1)
  return -1; // Signal to reset
}

interface WorkoutContext {
  exerciseTemplates: ExerciseTemplate[];
  todayISO: string;
  xpPerLevel: number;
}

/**
 * Award XP for a workout or recovery session
 * @param oldXP - Optional. If provided, this XP will be subtracted before adding new XP (for workout edits)
 */
export function awardWorkoutXP(
  progress: PassProgress | null,
  session: WorkoutSessionWithExercises,
  context: WorkoutContext,
  oldXP?: number
): { earnedXP: number; newLevel: number; updatedProgress: PassProgress } {
  const today = context.todayISO;
  const xpPerLevel = context.xpPerLevel;
  
  // Initialize progress if null
  const currentProgress = progress || {
    userId: 'default', // Will be set by caller
    seasonId: 'oct2025',
    xp: 0,
    level: 0,
    streakDays: 0,
    lastActivityISO: '',
    weeklyCount: 0,
    dailyXPLog: {},
  };
  
  // Calculate XP using behavior-based rules
  let baseXP = 0;
  
  if (session.activityType === 'workout') {
    // Workout: base + per set + duration/distance bonuses
    baseXP = battlePassXP.baseWorkoutXP; // 10 XP
    
    // +1 XP per set
    const totalSets = session.exercises.reduce((sum, exercise) => {
      return sum + (exercise.setsData as any[]).length;
    }, 0);
    baseXP += totalSets;
    
    // +2 XP per minute of duration (previously +1 per 30 sec)
    session.exercises.forEach(exercise => {
      (exercise.setsData as any[]).forEach(set => {
        if (set.durationMin) {
          baseXP += Math.floor(set.durationMin * 2);
        }
        if (set.distanceMeters) {
          baseXP += Math.floor(set.distanceMeters / 500);
        }
      });
    });
  } else if (session.activityType === 'recovery') {
    // Recovery: base + duration bonus
    baseXP = battlePassXP.baseRecoveryXP; // 5 XP
    
    // +1 XP per 10 min of recovery duration
    if (session.recoveryDurationMin) {
      baseXP += Math.floor(session.recoveryDurationMin / 10);
    }
  }
  
  // Compute streak
  const streakIncrement = computeStreak(currentProgress.lastActivityISO || null, today);
  let newStreak = currentProgress.streakDays;
  
  if (streakIncrement === -1) {
    newStreak = 1; // Reset streak
  } else if (streakIncrement === 1) {
    newStreak = currentProgress.streakDays + 1; // Increment streak
  }
  // If streakIncrement === 0, maintain current streak
  
  // Apply streak bonuses
  let streakBonus = 0;
  if (newStreak >= 7) {
    streakBonus = battlePassXP.streak7Bonus;
  } else if (newStreak >= 3) {
    streakBonus = battlePassXP.streak3Bonus;
  }
  
  baseXP += streakBonus;
  
  // Check if it's a new week (simple implementation: every 7 activities)
  const newWeeklyCount = currentProgress.weeklyCount + 1;
  let weeklyBonus = 0;
  if (newWeeklyCount >= 7) {
    weeklyBonus = battlePassXP.weeklyAdherenceBonus;
  }
  
  baseXP += weeklyBonus;
  
  // Get today's date as ISO date string (YYYY-MM-DD)
  const todayDate = new Date(today).toISOString().split('T')[0];
  
  // Get daily XP earned so far for today
  const dailyXPLog = currentProgress.dailyXPLog || {};
  let dailyXPEarned = dailyXPLog[todayDate] || 0;
  
  // If editing a workout, subtract the old XP first
  let adjustedCurrentXP = currentProgress.xp;
  if (oldXP !== undefined && oldXP > 0) {
    adjustedCurrentXP = Math.max(0, currentProgress.xp - oldXP);
    dailyXPEarned = Math.max(0, dailyXPEarned - oldXP);
  }
  
  // Apply daily cap
  const capRemaining = battlePassXP.dailyCap - dailyXPEarned;
  const earnedXP = clampDailyXP(baseXP, capRemaining);
  
  // Calculate new total XP and level
  const newTotalXP = adjustedCurrentXP + earnedXP;
  const newLevel = computeLevelFromXP(newTotalXP, xpPerLevel);
  
  // Update daily XP log
  const updatedDailyXPLog = { ...dailyXPLog };
  updatedDailyXPLog[todayDate] = dailyXPEarned + earnedXP;
  
  const updatedProgress: PassProgress = {
    ...currentProgress,
    xp: newTotalXP,
    level: newLevel,
    streakDays: newStreak,
    lastActivityISO: today,
    weeklyCount: newWeeklyCount >= 7 ? 0 : newWeeklyCount, // Reset weekly count after bonus
    dailyXPLog: updatedDailyXPLog,
  };
  
  return {
    earnedXP,
    newLevel,
    updatedProgress,
  };
}
