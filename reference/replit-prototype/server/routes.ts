import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertFullWorkoutSchema, insertProgramSchema, insertUserProgramSchema, insertUserSchema, insertUserLoginSchema } from "@shared/schema";
import { authService } from "./auth";
import { authConfig, DEBUG_USER } from "@shared/authConfig";

const loginAttempts = new Map<string, { count: number; lastAttempt: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOGIN_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication Routes
  
  // Sign up
  app.post("/api/auth/signup", async (req, res) => {
    try {
      const { email, password, username } = insertUserSchema.extend({
        password: insertUserLoginSchema.shape.password,
      }).parse(req.body);
      
      const result = await authService.signupWithEmail(email, password, username);
      
      res.json(result);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Login
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = insertUserLoginSchema.parse(req.body);
      
      // Rate limiting check
      const attempts = loginAttempts.get(email);
      if (attempts && attempts.count >= MAX_LOGIN_ATTEMPTS) {
        const timeElapsed = Date.now() - attempts.lastAttempt;
        if (timeElapsed < LOGIN_TIMEOUT_MS) {
          const remainingMinutes = Math.ceil((LOGIN_TIMEOUT_MS - timeElapsed) / 60000);
          return res.status(429).json({ 
            message: `Too many login attempts. Please try again in ${remainingMinutes} minutes.` 
          });
        } else {
          loginAttempts.delete(email);
        }
      }
      
      try {
        const result = await authService.loginWithEmail(email, password);
        
        // Clear failed attempts on successful login
        loginAttempts.delete(email);
        
        res.json(result);
      } catch (authError: any) {
        // Track failed attempt
        const currentAttempts = loginAttempts.get(email) || { count: 0, lastAttempt: Date.now() };
        loginAttempts.set(email, {
          count: currentAttempts.count + 1,
          lastAttempt: Date.now(),
        });
        
        throw authError;
      }
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // Get current user (from token)
  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token provided' });
      }

      const token = authHeader.substring(7);
      const user = await authService.getUserFromToken(token);
      
      if (!user) {
        return res.status(401).json({ message: 'Invalid token' });
      }

      res.json({
        id: user.id,
        email: user.email,
        username: user.username,
        currentLevel: user.currentLevel,
        activeTheme: user.activeTheme,
        debug: user.debug,
        avatarBadgeId: user.avatarBadgeId,
      });
    } catch (error: any) {
      res.status(401).json({ message: error.message });
    }
  });

  // Logout (client-side only, server just acknowledges)
  app.post("/api/auth/logout", async (_req, res) => {
    res.json({ message: 'Logged out successfully' });
  });

  // Get all exercise templates
  app.get("/api/exercises", async (_req, res) => {
    try {
      const exercises = await storage.getExerciseTemplates();
      res.json(exercises);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single exercise template
  app.get("/api/exercises/:id", async (req, res) => {
    try {
      const exercise = await storage.getExerciseTemplate(req.params.id);
      if (!exercise) {
        return res.status(404).json({ message: "Exercise not found" });
      }
      res.json(exercise);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Create workout session with multiple exercises
  app.post("/api/workouts/sessions", async (req, res) => {
    try {
      const validated = insertFullWorkoutSchema.parse(req.body);
      const session = await storage.createWorkoutSession(validated);
      
      // Update battle pass progress with the XP from this session
      const userId = validated.session.userId;
      const seasonId = "oct2025"; // Default season
      const currentProgress = await storage.getPassProgress(userId, seasonId);
      const currentXp = currentProgress?.xp || 0;
      const newXp = currentXp + (session.totalXp || 0);
      
      console.log(`✅ Awarded ${session.totalXp} XP to user ${userId} (total: ${newXp})`);
      
      // Save updated battle pass progress
      const { calculateLevel, getUnlockedRewardIds } = await import("@shared/rewards-config");
      const newLevel = calculateLevel(newXp);
      
      await storage.savePassProgress({
        userId,
        seasonId,
        xp: newXp,
        level: newLevel,
        dailyXPLog: currentProgress?.dailyXPLog || {},
        streakDays: currentProgress?.streakDays || 0,
        weeklyCount: currentProgress?.weeklyCount || 0
      });
      
      // Update user level
      await storage.updateUserLevel(userId, newLevel);
      
      // Auto-unlock rewards for new level
      const unlockedRewardIds = getUnlockedRewardIds(newLevel);
      const currentUserRewards = await storage.getUserRewards(userId);
      const currentRewardIds = new Set(currentUserRewards.map(ur => ur.rewardId));
      
      for (const rewardId of unlockedRewardIds) {
        if (!currentRewardIds.has(rewardId)) {
          await storage.unlockReward(userId, rewardId);
        }
      }
      
      res.json(session);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // List all workout sessions
  app.get("/api/workouts/sessions", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const sessions = await storage.listWorkoutSessions(userId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get today's workout sessions
  app.get("/api/workouts/sessions/today", async (req, res) => {
    try {
      const userId = req.query.userId as string | undefined;
      const sessions = await storage.getTodayWorkoutSessions(userId);
      res.json(sessions);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single workout session
  app.get("/api/workouts/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getWorkoutSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Delete workout session
  app.delete("/api/workouts/sessions/:id", async (req, res) => {
    try {
      const success = await storage.deleteWorkoutSession(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      res.json({ message: "Workout session deleted" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get workout session by program day key
  app.get("/api/workouts/sessions/program/:userId/:programDayKey", async (req, res) => {
    try {
      const { userId, programDayKey } = req.params;
      const session = await storage.getSessionByProgramDayKey(userId, programDayKey);
      if (!session) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      res.json(session);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update workout session
  app.patch("/api/workouts/sessions/:id", async (req, res) => {
    try {
      const { updateFullWorkoutSchema } = await import("@shared/schema");
      console.log(`🔄 Updating workout session ${req.params.id}:`, JSON.stringify(req.body, null, 2));
      const validated = updateFullWorkoutSchema.parse(req.body);
      const session = await storage.updateWorkoutSession(req.params.id, validated);
      if (!session) {
        return res.status(404).json({ message: "Workout session not found" });
      }
      res.json(session);
    } catch (error: any) {
      console.error(`❌ Update workout session error:`, error);
      res.status(400).json({ message: error.message });
    }
  });

  // Get battle pass progress
  app.get("/api/battlepass/progress", async (req, res) => {
    try {
      const userId = (req.query.userId as string) || 'default';
      const seasonId = (req.query.seasonId as string) || 'oct2025';
      const progress = await storage.getPassProgress(userId, seasonId);
      res.json(progress || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Save battle pass progress
  app.post("/api/battlepass/progress", async (req, res) => {
    try {
      const progress = await storage.savePassProgress(req.body);
      
      // Update user level and unlock rewards
      const { calculateLevel, getUnlockedRewardIds } = await import("@shared/rewards-config");
      const newLevel = calculateLevel(progress.xp);
      
      // Update user's current level
      await storage.updateUserLevel(progress.userId, newLevel);
      
      // Get all reward IDs that should be unlocked at this level
      const unlockedRewardIds = getUnlockedRewardIds(newLevel);
      
      // Get user's current rewards
      const currentUserRewards = await storage.getUserRewards(progress.userId);
      const currentRewardIds = new Set(currentUserRewards.map(ur => ur.rewardId));
      
      // Unlock any new rewards
      for (const rewardId of unlockedRewardIds) {
        if (!currentRewardIds.has(rewardId)) {
          await storage.unlockReward(progress.userId, rewardId);
        }
      }
      
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Create program
  app.post("/api/programs", async (req, res) => {
    try {
      const validated = insertProgramSchema.parse(req.body);
      const program = await storage.saveProgram(validated);
      res.json(program);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // List all programs
  app.get("/api/programs", async (_req, res) => {
    try {
      const programs = await storage.listPrograms();
      res.json(programs);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get single program
  app.get("/api/programs/:id", async (req, res) => {
    try {
      const program = await storage.getProgram(req.params.id);
      if (!program) {
        return res.status(404).json({ message: "Program not found" });
      }
      res.json(program);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Assign program to user
  app.post("/api/programs/assign", async (req, res) => {
    try {
      const validated = insertUserProgramSchema.parse(req.body);
      const userProgram = await storage.assignProgram(validated);
      res.json(userProgram);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user's current program
  app.get("/api/programs/user/:userId", async (req, res) => {
    try {
      const userProgram = await storage.getUserProgram(req.params.userId);
      res.json(userProgram || null);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Update user's program progress
  app.patch("/api/programs/user/:userId", async (req, res) => {
    try {
      const userProgram = await storage.updateUserProgram(req.params.userId, req.body);
      if (!userProgram) {
        return res.status(404).json({ message: "User program not found" });
      }
      res.json(userProgram);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Unassign user's program
  app.delete("/api/programs/user/:userId", async (req, res) => {
    try {
      const success = await storage.unassignProgram(req.params.userId);
      if (!success) {
        return res.status(404).json({ message: "User program not found" });
      }
      res.json({ message: "Program unassigned successfully" });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user by ID
  app.get("/api/users/:id", async (req, res) => {
    try {
      const user = await storage.getUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/users/:userId/unit-preference", async (req, res) => {
    try {
      const { userId } = req.params;
      const { unitPreference } = req.body;

      if (!unitPreference || !['metric', 'imperial'].includes(unitPreference)) {
        return res.status(400).json({ message: "Invalid unit preference" });
      }

      const success = await storage.setUnitPreference(userId, unitPreference);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, unitPreference });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get all rewards
  app.get("/api/rewards", async (_req, res) => {
    try {
      const rewards = await storage.listRewards();
      res.json(rewards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Get user's rewards
  app.get("/api/rewards/user/:userId", async (req, res) => {
    try {
      const userRewards = await storage.getUserRewards(req.params.userId);
      res.json(userRewards);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Unlock a reward for a user
  app.post("/api/rewards/unlock", async (req, res) => {
    try {
      const { userId, rewardId } = req.body;
      const userReward = await storage.unlockReward(userId, rewardId);
      res.json(userReward);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Claim a reward
  app.post("/api/rewards/claim/:rewardId", async (req, res) => {
    try {
      const userId = req.body.userId || 'default';
      const success = await storage.claimReward(userId, req.params.rewardId);
      if (!success) {
        return res.status(404).json({ message: "Reward not found or not unlocked" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Set active theme
  app.post("/api/rewards/theme/:themeId", async (req, res) => {
    try {
      const userId = req.body.userId || 'default';
      const success = await storage.setActiveTheme(userId, req.params.themeId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Set avatar badge
  app.post("/api/users/:userId/avatar", async (req, res) => {
    try {
      const userId = req.params.userId;
      const { badgeId } = req.body;
      const success = await storage.setAvatarBadge(userId, badgeId);
      if (!success) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get reward stats
  app.get("/api/rewards/stats", async (_req, res) => {
    try {
      const stats = await storage.getRewardStats();
      res.json(stats);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Debug: Add XP
  app.post("/api/debug/add-xp", async (req, res) => {
    try {
      const { userId, amount, seasonId, multiplier = 1 } = req.body;
      
      if (!userId || !amount || !seasonId) {
        return res.status(400).json({ message: "Missing required fields: userId, amount, seasonId" });
      }
      
      // Validate multiplier
      const validMultipliers = [1, 2, 5, 10];
      if (!validMultipliers.includes(multiplier)) {
        return res.status(400).json({ message: "Invalid multiplier. Must be one of: 1, 2, 5, 10" });
      }
      
      console.log(`🔧 Debug: Adding ${amount} XP to user ${userId} in season ${seasonId} with ${multiplier}x multiplier`);
      
      const progress = await storage.addXP(userId, amount, seasonId, multiplier);
      res.json(progress);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Debug: Reset streak
  app.post("/api/debug/reset-streak", async (req, res) => {
    try {
      const { userId, seasonId } = req.body;
      
      if (!userId || !seasonId) {
        return res.status(400).json({ message: "Missing required fields: userId, seasonId" });
      }
      
      console.log(`🔧 Debug: Resetting streak for user ${userId} in season ${seasonId}`);
      
      const success = await storage.resetStreak(userId, seasonId);
      if (!success) {
        return res.status(404).json({ message: "User progress not found" });
      }
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Debug: Reset season
  app.post("/api/debug/reset-season", async (req, res) => {
    try {
      const { userId, seasonId } = req.body;
      
      if (!userId || !seasonId) {
        return res.status(400).json({ message: "Missing required fields: userId, seasonId" });
      }
      
      console.log(`🔧 Debug: Starting comprehensive season reset for ${seasonId}, user ${userId}`);
      console.log(`   This will: lock all rewards, clear avatar badge, reset theme, and reset all progress`);
      
      const success = await storage.resetSeason(userId, seasonId);
      if (!success) {
        return res.status(404).json({ message: "User progress not found" });
      }
      
      console.log(`✅ Debug: Comprehensive season reset completed successfully`);
      res.json({ success: true });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Get user stats
  app.get("/api/users/:userId/stats", async (req, res) => {
    try {
      const userId = req.params.userId;
      const seasonId = "oct2025";
      
      const progress = await storage.getPassProgress(userId, seasonId);
      const sessions = await storage.listWorkoutSessions(userId);
      
      // Count both workout and recovery sessions toward total workouts
      const workoutsCompleted = sessions.filter(s => 
        s.activityType === 'workout' || s.activityType === 'recovery'
      ).length;
      const completedPrograms = progress?.completedPrograms ? (progress.completedPrograms as string[]).length : 0;
      
      res.json({
        totalXP: progress?.xp || 0,
        streakDays: progress?.streakDays || 0,
        workoutsCompleted,
        programsCompleted: completedPrograms,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
