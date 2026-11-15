import type { InsertReward } from "./schema";

export const REWARDS_CONFIG: InsertReward[] = [
  // Tier 1 - Starter Badge
  {
    id: "reward-starter-badge",
    tier: 1,
    type: "badge",
    name: "Starter Badge",
    description: "Completed your first workout session!",
    icon: "award",
  },
  
  // Tier 2 - Ocean Theme
  {
    id: "reward-ocean-theme",
    tier: 2,
    type: "theme",
    name: "Ocean Theme",
    description: "Cool blue tones for a refreshing workout vibe",
    themeConfig: {
      primary: "hsl(207, 90%, 54%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(214, 95%, 93%)",
      secondaryForeground: "hsl(207, 73%, 15%)",
      accent: "hsl(189, 80%, 50%)",
      accentForeground: "hsl(0, 0%, 100%)",
    },
  },
  
  // Tier 3 - Consistency Badge
  {
    id: "reward-consistency-badge",
    tier: 3,
    type: "badge",
    name: "Consistency Badge",
    description: "Three levels reached - you're building a habit!",
    icon: "target",
  },
  
  // Tier 4 - Sunset Theme
  {
    id: "reward-sunset-theme",
    tier: 4,
    type: "theme",
    name: "Sunset Theme",
    description: "Warm orange and pink hues for evening workouts",
    themeConfig: {
      primary: "hsl(24, 95%, 53%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(24, 100%, 97%)",
      secondaryForeground: "hsl(24, 70%, 20%)",
      accent: "hsl(340, 75%, 55%)",
      accentForeground: "hsl(0, 0%, 100%)",
    },
  },
  
  // Tier 5 - Dedication Badge
  {
    id: "reward-dedication-badge",
    tier: 5,
    type: "badge",
    name: "Dedication Badge",
    description: "Halfway there! Your commitment shows.",
    icon: "flame",
  },
  
  // Tier 6 - Forest Theme
  {
    id: "reward-forest-theme",
    tier: 6,
    type: "theme",
    name: "Forest Theme",
    description: "Natural greens to keep you grounded",
    themeConfig: {
      primary: "hsl(142, 71%, 45%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(138, 76%, 97%)",
      secondaryForeground: "hsl(142, 60%, 15%)",
      accent: "hsl(158, 64%, 52%)",
      accentForeground: "hsl(0, 0%, 100%)",
    },
  },
  
  // Tier 7 - Warrior Badge
  {
    id: "reward-warrior-badge",
    tier: 7,
    type: "badge",
    name: "Warrior Badge",
    description: "Seven levels of pure strength and willpower!",
    icon: "sword",
  },
  
  // Tier 8 - Midnight Theme
  {
    id: "reward-midnight-theme",
    tier: 8,
    type: "theme",
    name: "Midnight Theme",
    description: "Deep purples for late-night grind sessions",
    themeConfig: {
      primary: "hsl(271, 81%, 56%)",
      primaryForeground: "hsl(0, 0%, 100%)",
      secondary: "hsl(270, 100%, 98%)",
      secondaryForeground: "hsl(271, 60%, 20%)",
      accent: "hsl(291, 64%, 42%)",
      accentForeground: "hsl(0, 0%, 100%)",
    },
  },
  
  // Tier 9 - Champion Badge
  {
    id: "reward-champion-badge",
    tier: 9,
    type: "badge",
    name: "Champion Badge",
    description: "Almost at the top - a true champion's journey!",
    icon: "crown",
  },
  
  // Tier 10 - Legend Badge
  {
    id: "reward-legend-badge",
    tier: 10,
    type: "badge",
    name: "Legend Badge",
    description: "You've conquered the season! A true legend.",
    icon: "trophy",
  },
];

// XP configuration
export const XP_CONFIG = {
  xpPerLevel: 20,
  maxTier: 10,
};

// Helper to get reward by tier
export function getRewardByTier(tier: number): InsertReward | undefined {
  return REWARDS_CONFIG.find(r => r.tier === tier);
}

// Helper to calculate level from XP
export function calculateLevel(xp: number): number {
  return Math.floor(xp / XP_CONFIG.xpPerLevel);
}

// Helper to get unlocked reward IDs based on level
export function getUnlockedRewardIds(level: number): string[] {
  return REWARDS_CONFIG
    .filter(reward => reward.tier <= level)
    .map(reward => reward.id);
}

// Helper to get next reward for a given level
export function getNextReward(level: number): InsertReward | null {
  const nextTier = level + 1;
  return REWARDS_CONFIG.find(r => r.tier === nextTier) || null;
}
