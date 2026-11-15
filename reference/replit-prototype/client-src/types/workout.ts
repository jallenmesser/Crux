export interface ExerciseTemplate {
  id: string;
  name: string;
  type: 'strength' | 'cardio' | 'flexibility';
  category: 'upper_body' | 'lower_body' | 'core' | 'full_body' | 'cardio';
  muscleGroup?: string;
  xpPerSet: number;
  icon: string;
  isBodyweight: boolean;
}

export interface ExerciseSet {
  reps?: number;
  weightKg?: number;
  durationMin?: number;
  distanceMeters?: number;
}

export interface ExerciseLog {
  templateId: string;
  sets: ExerciseSet[];
}

export interface WorkoutSession {
  id: string;
  userId?: string;
  date: Date;
  notes?: string;
  totalXp: number;
  activityType: 'workout' | 'recovery';
  recoveryType?: string;
  recoveryDurationMin?: number;
}

export interface WorkoutEntry {
  id: string;
  sessionId: string;
  userId?: string;
  exerciseTemplateId: string;
  date: Date;
  setsData: ExerciseSet[];
  notes?: string;
  xpEarned: number;
  exerciseTemplate?: ExerciseTemplate;
}

export interface WorkoutSessionWithExercises extends WorkoutSession {
  exercises: WorkoutEntry[];
  exerciseCount: number;
}
