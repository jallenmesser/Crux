// XP Configuration for different exercise types

export const xpConfig = {
  // Strength exercises
  strength: {
    volumeMultiplier: 0.1, // 0.1 XP per (rep × kg)
    minXpPerSet: 10, // Minimum XP for bodyweight sets
    durationXpPerSecond: 0.5, // 0.5 XP per second for isometric holds
  },
  
  // Cardio exercises
  cardio: {
    durationXpPerMinute: 1, // 1 XP per minute
    distanceXpPer100m: 1, // 1 XP per 100 meters
  },
  
  // Flexibility exercises
  flexibility: {
    useTemplateXp: true, // Use xpPerSet from template
  },
};

// Battle Pass XP Configuration
export const battlePassXP = {
  baseWorkoutXP: 10,
  baseRecoveryXP: 5,
  perSetXP: 1,
  per30SecHoldXP: 1,
  per5MinCardioXP: 1,
  per500mCardioXP: 1,
  streak3Bonus: 5,
  streak7Bonus: 10,
  weeklyAdherenceBonus: 20,
  dailyCap: 40, // Daily XP cap to prevent excessive grinding
};
