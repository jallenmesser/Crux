import { storage } from "./storage";
import { REWARDS_CONFIG } from "@shared/rewards-config";
import { db } from "./db";
import { rewards, exerciseTemplates } from "@shared/schema";
import type { InsertProgram } from "@shared/schema";

export async function seedDatabase(): Promise<void> {
  try {
    const existingUser = await storage.getUserByEmail('dev@crux.app');
    if (existingUser) {
      console.log('✅ Database already initialized, skipping seed');
      return;
    }

    console.log('🌱 Starting database seed...');

    await storage.createUser({
      email: 'dev@crux.app',
      passwordHash: '$2b$10$OJg/uSis2cONUd4Yh0iOhuhUZFZJpkN/9EVMGRNzIrU7o0H3rcCW2',
      username: 'DevUser',
      authProvider: 'local',
    });

    await storage.createUser({
      email: 'builder@crux.test',
      passwordHash: '$2b$10$xvXE.YKzJhNqm0pGqZ5LKOy8F8N5X5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5Z5u',
      username: 'BuilderTest',
      authProvider: 'local',
    });

    console.log('✅ Seeded dev and builder users');

    const exerciseTemplateData = [
      { id: 'exercise-1', name: 'Squats', type: 'strength', category: 'lower_body', muscleGroup: 'Legs', xpPerSet: 50, icon: 'dumbbell', isBodyweight: 0 },
      { id: 'exercise-2', name: 'Bench Press', type: 'strength', category: 'upper_body', muscleGroup: 'Chest', xpPerSet: 60, icon: 'dumbbell', isBodyweight: 0 },
      { id: 'exercise-3', name: 'Push-ups', type: 'strength', category: 'upper_body', muscleGroup: 'Chest', xpPerSet: 40, icon: 'hand-rock', isBodyweight: 1 },
      { id: 'exercise-4', name: 'Deadlifts', type: 'strength', category: 'full_body', muscleGroup: 'Full Body', xpPerSet: 70, icon: 'dumbbell', isBodyweight: 0 },
      { id: 'exercise-5', name: 'Plank', type: 'flexibility', category: 'core', muscleGroup: 'Core', xpPerSet: 35, icon: 'stopwatch', isBodyweight: 1 },
      { id: 'exercise-6', name: 'Pull-ups', type: 'strength', category: 'upper_body', muscleGroup: 'Back', xpPerSet: 55, icon: 'grip-lines', isBodyweight: 1 },
      { id: 'exercise-7', name: 'Running 5K', type: 'cardio', category: 'cardio', xpPerSet: 100, icon: 'running', isBodyweight: 1 },
      { id: 'exercise-8', name: 'Lunges', type: 'strength', category: 'lower_body', muscleGroup: 'Legs', xpPerSet: 45, icon: 'dumbbell', isBodyweight: 0 },
      { id: 'exercise-9', name: 'Cycling', type: 'cardio', category: 'cardio', xpPerSet: 80, icon: 'biking', isBodyweight: 1 },
      { id: 'exercise-10', name: 'Shoulder Press', type: 'strength', category: 'upper_body', muscleGroup: 'Shoulders', xpPerSet: 50, icon: 'dumbbell', isBodyweight: 0 },
      { id: 'exercise-11', name: 'Barbell Rows', type: 'strength', category: 'upper_body', muscleGroup: 'Back', xpPerSet: 55, icon: 'dumbbell', isBodyweight: 0 },
      { id: 'exercise-12', name: 'Burpees', type: 'strength', category: 'full_body', muscleGroup: 'Full Body', xpPerSet: 65, icon: 'bolt', isBodyweight: 1 },
    ];

    for (const template of exerciseTemplateData) {
      await db.insert(exerciseTemplates).values({
        id: template.id,
        name: template.name,
        type: template.type,
        category: template.category,
        muscleGroup: template.muscleGroup,
        xpPerSet: template.xpPerSet,
        icon: template.icon,
        isBodyweight: template.isBodyweight,
      });
    }

    console.log(`✅ Seeded ${exerciseTemplateData.length} exercise templates`);

    for (const reward of REWARDS_CONFIG) {
      await db.insert(rewards).values({
        id: reward.id,
        tier: reward.tier,
        type: reward.type,
        name: reward.name,
        description: reward.description,
        icon: reward.icon || null,
        themeConfig: reward.themeConfig || null,
      });
    }

    console.log(`✅ Seeded ${REWARDS_CONFIG.length} rewards`);

    const beginnerProgram: InsertProgram = {
      name: 'Beginner Strength 4-Week',
      description: 'A 4-week beginner strength training program with 3 workouts per week. Perfect for building foundational strength.',
      durationWeeks: 4,
      days: [
        {
          dayOfWeek: 1,
          name: 'Lower Body',
          exercises: [
            {
              exerciseId: 'exercise-1',
              sets: [
                { reps: 10, weight: 45 },
                { reps: 10, weight: 45 },
                { reps: 10, weight: 45 },
              ],
            },
            {
              exerciseId: 'exercise-8',
              sets: [
                { reps: 12, weight: 20 },
                { reps: 12, weight: 20 },
              ],
            },
            {
              exerciseId: 'exercise-5',
              sets: [
                { durationMin: 30 },
                { durationMin: 30 },
                { durationMin: 30 },
              ],
            },
          ],
        },
        {
          dayOfWeek: 3,
          name: 'Upper Body Push',
          exercises: [
            {
              exerciseId: 'exercise-2',
              sets: [
                { reps: 8, weight: 65 },
                { reps: 8, weight: 65 },
                { reps: 8, weight: 65 },
              ],
            },
            {
              exerciseId: 'exercise-10',
              sets: [
                { reps: 10, weight: 30 },
                { reps: 10, weight: 30 },
              ],
            },
            {
              exerciseId: 'exercise-3',
              sets: [
                { reps: 15 },
                { reps: 15 },
              ],
            },
          ],
        },
        {
          dayOfWeek: 5,
          name: 'Back & Deadlifts',
          exercises: [
            {
              exerciseId: 'exercise-4',
              sets: [
                { reps: 8, weight: 95 },
                { reps: 8, weight: 95 },
                { reps: 8, weight: 95 },
              ],
            },
            {
              exerciseId: 'exercise-11',
              sets: [
                { reps: 10, weight: 65 },
                { reps: 10, weight: 65 },
              ],
            },
            {
              exerciseId: 'exercise-5',
              sets: [
                { durationMin: 30 },
                { durationMin: 30 },
              ],
            },
          ],
        },
      ],
      authorId: undefined,
    };

    await storage.saveProgram(beginnerProgram);

    console.log('✅ Seeded program: Beginner Strength 4-Week');

    console.log('🎉 Database seed completed successfully!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}
