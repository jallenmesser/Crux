import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash"),
  username: text("username").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  authProvider: text("auth_provider").default("local"), // 'local' | 'magicLink'
  currentLevel: integer("current_level").notNull().default(0),
  activeTheme: text("active_theme").default("default"),
  debug: integer("debug").notNull().default(0), // boolean: 0 = false, 1 = true
  avatarBadgeId: text("avatar_badge_id"), // Badge ID to use as avatar (optional)
  unitPreference: text("unit_preference").default("imperial"), // 'metric' | 'imperial'
});

export const exerciseTemplates = pgTable("exercise_templates", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'strength' | 'cardio' | 'flexibility'
  category: text("category").notNull(), // 'upper_body' | 'lower_body' | 'core' | 'full_body' | 'cardio'
  muscleGroup: text("muscle_group"),
  xpPerSet: integer("xp_per_set").notNull().default(50),
  icon: text("icon").default("dumbbell"),
  isBodyweight: integer("is_bodyweight").notNull().default(0), // SQLite boolean
});

export const workoutSessions = pgTable("workout_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  date: timestamp("date").notNull().defaultNow(),
  notes: text("notes"),
  totalXp: integer("total_xp").notNull().default(0),
  activityType: text("activity_type").notNull().default("workout"), // 'workout' | 'recovery'
  recoveryType: text("recovery_type"), // e.g., 'yoga', 'stretching', 'meditation', 'walk'
  recoveryDurationMin: integer("recovery_duration_min"), // Duration in minutes for recovery activities
  programId: varchar("program_id"), // ID of program if this workout is from a program
  programDayKey: text("program_day_key"), // Format: "dayOfWeek-workoutName" to identify which program workout
});

export const workoutEntries = pgTable("workout_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull().references(() => workoutSessions.id),
  userId: varchar("user_id").references(() => users.id),
  exerciseTemplateId: varchar("exercise_template_id").notNull().references(() => exerciseTemplates.id),
  date: timestamp("date").notNull().defaultNow(),
  
  // Per-set data stored as JSON array
  setsData: jsonb("sets_data").notNull(), // Array of ExerciseSet
  
  // Common fields
  notes: text("notes"),
  xpEarned: integer("xp_earned").notNull(),
});

export const passProgress = pgTable("pass_progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  seasonId: text("season_id").notNull(),
  xp: integer("xp").notNull().default(0),
  level: integer("level").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  lastActivityISO: text("last_activity_iso"),
  weeklyCount: integer("weekly_count").notNull().default(0),
  dailyXPLog: jsonb("daily_xp_log").notNull().default('{}'), // Track XP earned per day as { dateISO: xpAmount }
  completedPrograms: jsonb("completed_programs").notNull().default('[]'), // Track program IDs that have received completion bonus
});

export const programs = pgTable("programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  durationWeeks: integer("duration_weeks").notNull(),
  days: jsonb("days").notNull(), // Array of ProgramDay
  authorId: varchar("author_id").references(() => users.id),
});

export const userPrograms = pgTable("user_programs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  programId: varchar("program_id").notNull().references(() => programs.id),
  startDateISO: text("start_date_iso").notNull(),
  currentWeek: integer("current_week").notNull().default(1),
  completedWorkouts: jsonb("completed_workouts").notNull().default('[]'), // Array of workout session IDs
});

export const rewards = pgTable("rewards", {
  id: varchar("id").primaryKey(),
  tier: integer("tier").notNull(),
  type: text("type").notNull(), // 'badge' | 'theme'
  name: text("name").notNull(),
  description: text("description").notNull(),
  icon: text("icon"), // For badges
  themeConfig: jsonb("theme_config"), // For themes: { primary, background, etc }
});

export const userRewards = pgTable("user_rewards", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rewardId: varchar("reward_id").notNull().references(() => rewards.id),
  unlockedAt: timestamp("unlocked_at").notNull().defaultNow(),
  claimed: integer("claimed").notNull().default(0), // boolean: 0 = unlocked but not claimed, 1 = claimed
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  currentLevel: true,
  activeTheme: true,
  debug: true,
  avatarBadgeId: true,
  passwordHash: true,
  unitPreference: true,
}).extend({
  email: z.string().email(),
  passwordHash: z.string().optional(),
  username: z.string().min(3),
  authProvider: z.enum(['local', 'magicLink']).optional(),
});

export const insertUserLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const insertExerciseTemplateSchema = createInsertSchema(exerciseTemplates).omit({
  id: true,
});

export const insertWorkoutSessionSchema = createInsertSchema(workoutSessions).omit({
  id: true,
  date: true,
  totalXp: true,
}).extend({
  userId: z.string().min(1), // Required for workout creation
  notes: z.string().optional(),
  activityType: z.enum(["workout", "recovery"]).default("workout"),
  recoveryType: z.string().optional(),
  recoveryDurationMin: z.number().int().positive().optional(),
  programId: z.string().optional(),
  programDayKey: z.string().optional(),
});

export const updateWorkoutSessionSchema = z.object({
  userId: z.string().optional(), // Optional for updates - workout already has userId
  notes: z.string().optional(),
  activityType: z.enum(["workout", "recovery"]).default("workout"),
  recoveryType: z.string().optional(),
  recoveryDurationMin: z.number().int().positive().optional(),
  programId: z.string().optional(),
  programDayKey: z.string().optional(),
  totalXp: z.number().nonnegative().optional(),
});

// ExerciseSet schema - represents a single set in an exercise
export const exerciseSetSchema = z.object({
  reps: z.number().int().positive().optional(),
  weightKg: z.number().nonnegative().optional(),
  durationMin: z.number().positive().optional(),
  distanceMeters: z.number().nonnegative().optional(),
});

export type ExerciseSet = z.infer<typeof exerciseSetSchema>;

export const insertWorkoutEntrySchema = createInsertSchema(workoutEntries).omit({
  id: true,
  date: true,
  userId: true,
  sessionId: true,
  xpEarned: true, // Server will compute this
}).extend({
  exerciseTemplateId: z.string(),
  setsData: z.array(exerciseSetSchema).min(1, "Exercise must have at least one set"),
  notes: z.string().optional(),
});

// Composite payload schema for creating a full workout session with exercises
export const insertFullWorkoutSchema = z.object({
  session: insertWorkoutSessionSchema,
  exercises: z.array(insertWorkoutEntrySchema).optional(), // Optional for recovery activities
}).refine(
  (data) => {
    // If it's a workout, must have exercises
    if (data.session.activityType === "workout") {
      return data.exercises && data.exercises.length > 0;
    }
    return true;
  },
  { message: "Workout activities must have at least one exercise" }
).refine(
  (data) => {
    // If it's a recovery, must have recoveryType
    if (data.session.activityType === "recovery") {
      return data.session.recoveryType && data.session.recoveryType.trim().length > 0;
    }
    return true;
  },
  { message: "Recovery activities must specify a recovery type" }
);

export const updateFullWorkoutSchema = z.object({
  session: updateWorkoutSessionSchema,
  exercises: z.array(insertWorkoutEntrySchema).optional(),
}).refine(
  (data) => {
    if (data.session.activityType === "workout") {
      return data.exercises && data.exercises.length > 0;
    }
    return true;
  },
  { message: "Workout activities must have at least one exercise" }
);

// Select types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type ExerciseTemplate = typeof exerciseTemplates.$inferSelect;
export type InsertExerciseTemplate = z.infer<typeof insertExerciseTemplateSchema>;

export type WorkoutSession = typeof workoutSessions.$inferSelect;
export type InsertWorkoutSession = z.infer<typeof insertWorkoutSessionSchema>;

export type WorkoutEntry = typeof workoutEntries.$inferSelect;
export type InsertWorkoutEntry = z.infer<typeof insertWorkoutEntrySchema>;

export type InsertFullWorkout = z.infer<typeof insertFullWorkoutSchema>;

export type PassProgress = typeof passProgress.$inferSelect;
export const insertPassProgressSchema = createInsertSchema(passProgress).omit({
  id: true,
});
export type InsertPassProgress = z.infer<typeof insertPassProgressSchema>;

// Program schemas
export const prescribedSetSchema = z.object({
  reps: z.number().int().positive().optional(),
  weight: z.number().nonnegative().optional(),
  durationMin: z.number().positive().optional(),
  distance: z.number().nonnegative().optional(),
});

export type PrescribedSet = z.infer<typeof prescribedSetSchema>;

export const programExerciseSchema = z.object({
  exerciseId: z.string(),
  sets: z.array(prescribedSetSchema).min(1),
});

export type ProgramExercise = z.infer<typeof programExerciseSchema>;

export const programDaySchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6), // 0 = Sunday, 6 = Saturday
  name: z.string(),
  exercises: z.array(programExerciseSchema).min(1),
});

export type ProgramDay = z.infer<typeof programDaySchema>;

export const insertProgramSchema = createInsertSchema(programs).omit({
  id: true,
}).extend({
  name: z.string().min(1),
  description: z.string().optional(),
  durationWeeks: z.number().int().positive(),
  days: z.array(programDaySchema).min(1),
  authorId: z.string().optional(),
});

export type Program = typeof programs.$inferSelect;
export type InsertProgram = z.infer<typeof insertProgramSchema>;

export const insertUserProgramSchema = createInsertSchema(userPrograms).omit({
  id: true,
}).extend({
  userId: z.string(),
  programId: z.string(),
  startDateISO: z.string(),
  currentWeek: z.number().int().positive().default(1),
  completedWorkouts: z.array(z.string()).default([]),
});

export type UserProgram = typeof userPrograms.$inferSelect;
export type InsertUserProgram = z.infer<typeof insertUserProgramSchema>;

// Reward schemas
export const themeConfigSchema = z.object({
  primary: z.string(),
  primaryForeground: z.string(),
  secondary: z.string(),
  secondaryForeground: z.string(),
  accent: z.string(),
  accentForeground: z.string(),
}).optional();

export type ThemeConfig = z.infer<typeof themeConfigSchema>;

export const insertRewardSchema = createInsertSchema(rewards).extend({
  id: z.string(),
  tier: z.number().int().min(1).max(10),
  type: z.enum(["badge", "theme"]),
  name: z.string(),
  description: z.string(),
  icon: z.string().optional(),
  themeConfig: themeConfigSchema,
});

export type Reward = typeof rewards.$inferSelect;
export type InsertReward = z.infer<typeof insertRewardSchema>;

export const insertUserRewardSchema = createInsertSchema(userRewards).omit({
  id: true,
  unlockedAt: true,
}).extend({
  userId: z.string(),
  rewardId: z.string(),
  claimed: z.number().int().min(0).max(1).default(0),
});

export type UserReward = typeof userRewards.$inferSelect;
export type InsertUserReward = z.infer<typeof insertUserRewardSchema>;
