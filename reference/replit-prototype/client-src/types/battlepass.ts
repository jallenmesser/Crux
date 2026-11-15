export interface Season {
  id: string;
  name: string;
  startISO: string;
  endISO: string;
  levels: number;
  xpPerLevel: number;
}

export interface PassProgress {
  userId: string;
  seasonId: string;
  xp: number;
  level: number;
  streakDays: number;
  lastActivityISO: string;
  weeklyCount: number;
  dailyXPLog: { [dateISO: string]: number }; // Track XP earned per day
}

export interface Reward {
  id: string;
  seasonId: string;
  level: number;
  type: 'badge' | 'theme' | 'booster';
  payload: any;
}

export interface RewardClaim {
  userId: string;
  rewardId: string;
  claimedAtISO: string;
}
