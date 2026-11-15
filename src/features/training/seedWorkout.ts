// PLACEHOLDER workout for the first slice. Content is not final; names, loads and
// instructions are stand-ins. The shape is what the AI trainer will return later.
// Covers: warm-up, weighted reps, bodyweight reps, timed holds, cardio by time and
// distance, mobility, per-exercise rest and notes.

import type { Workout } from './types';

export const SEED_WORKOUT: Workout = {
  id: 'seed-upper-body-d1',
  name: 'Upper Body Strength',
  programName: 'Crux Starter (placeholder)',
  dayNumber: 1,
  estimatedMinutes: 30,
  exercises: [
    {
      id: 'jumping-jacks',
      name: 'Jumping Jacks',
      kind: 'warmup',
      muscleGroups: ['Full body'],
      instructions: 'Jump feet wide while raising arms overhead, then return. Keep a steady rhythm.',
      sets: [{ durationSec: 45 }],
    },
    {
      id: 'db-bench-press',
      name: 'Dumbbell Bench Press',
      kind: 'strength',
      muscleGroups: ['Chest', 'Triceps', 'Shoulders'],
      instructions: 'Lie back with a dumbbell in each hand. Lower to chest level, press up until arms are straight.',
      notes: 'Choose a load you can control for all reps.',
      restSeconds: 15,
      sets: [
        { reps: 8, weightKg: 20 },
        { reps: 8, weightKg: 20 },
        { reps: 8, weightKg: 20 },
      ],
    },
    {
      id: 'db-row',
      name: 'One-Arm Dumbbell Row',
      kind: 'strength',
      muscleGroups: ['Back', 'Biceps'],
      instructions: 'Hand and knee on a bench, flat back. Pull the dumbbell to your hip, lower with control.',
      sets: [
        { reps: 10, weightKg: 16 },
        { reps: 10, weightKg: 16 },
        { reps: 10, weightKg: 16 },
      ],
    },
    {
      id: 'push-ups',
      name: 'Push-Ups',
      kind: 'bodyweight',
      muscleGroups: ['Chest', 'Triceps', 'Core'],
      instructions: 'Hands under shoulders, body in a straight line. Lower chest to the floor, press back up.',
      sets: [{ reps: 12 }, { reps: 12 }, { reps: 12 }],
    },
    {
      id: 'plank',
      name: 'Plank',
      kind: 'timed',
      muscleGroups: ['Core'],
      instructions: 'Forearms on the floor, body in a straight line from head to heels. Hold without sagging.',
      sets: [{ durationSec: 30 }, { durationSec: 30 }, { durationSec: 30 }],
    },
    {
      id: 'easy-run',
      name: 'Easy Run',
      kind: 'cardio',
      muscleGroups: ['Legs', 'Cardio'],
      instructions: 'Run at a pace where you could hold a conversation.',
      notes: 'Log either time or distance, whichever your device shows.',
      sets: [{ durationSec: 300, distanceM: 800 }],
    },
    {
      id: 'chest-stretch',
      name: 'Doorway Chest Stretch',
      kind: 'mobility',
      muscleGroups: ['Chest', 'Shoulders'],
      instructions: 'Forearm on a door frame, step through until you feel a stretch across the chest. Breathe slowly.',
      sets: [{ durationSec: 30 }, { durationSec: 30 }],
    },
  ],
};
