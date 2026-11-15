import { useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { XpBar } from '@/components/gamification/XpBar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { loadProgress, type Progress } from '@/features/gamification/localProgress';
import { useWorkoutSession } from '@/features/training/SessionProvider';
import { isResumable, resumeInfo } from '@/features/training/sessionStorage';
import { summarize } from '@/features/training/sessionMachine';
import { useCompletedToday } from '@/features/training/useCompletedToday';
import { localStore } from '@/services/storage/localStore';
import { colors, radius, spacing, type } from '@/theme/tokens';

export default function Home() {
  const router = useRouter();
  const { ready, workout, session } = useWorkoutSession();
  const [progress, setProgress] = useState<Progress | null>(null);
  const { entry: doneToday, loaded: historyLoaded } = useCompletedToday(workout.id);

  useFocusEffect(
    useCallback(() => {
      loadProgress(localStore).then(setProgress);
    }, []),
  );

  const resumable = session && isResumable(session);
  const info = session && resumeInfo(session, workout);
  const finishedUnclaimed = session?.status === 'completed';

  const showDone = !resumable && !finishedUnclaimed && !!doneToday;
  const doneSummary = doneToday ? summarize(doneToday.session, workout) : null;

  let action = <Button label="START WORKOUT" onPress={() => router.push('/workout/overview')} />;
  if (resumable) action = <Button label="RESUME WORKOUT" onPress={() => router.push('/workout/run')} />;
  if (finishedUnclaimed) action = <Button label="SEE RESULTS" onPress={() => router.push('/workout/complete')} />;
  if (showDone) action = <Button label="EDIT WORKOUT" variant="secondary" onPress={() => router.push('/workout/edit')} />;

  return (
    <Screen>
      <Text style={styles.brand}>CRUX</Text>
      {progress ? <XpBar info={progress} /> : null}

      <Text style={styles.kicker}>TODAY'S TRAINING</Text>
      <View style={styles.card}>
        <Text style={styles.program}>{workout.programName.toUpperCase()} · DAY {String(workout.dayNumber).padStart(2, '0')}</Text>
        <Text style={styles.title}>{workout.name}</Text>
        <Text style={styles.muted}>
          {workout.exercises.length} exercises · ~{workout.estimatedMinutes} min
        </Text>
        {resumable && info ? (
          <Text style={styles.resume}>
            In progress: {info.exerciseName}, set {info.setNumber} of {info.totalSets}
          </Text>
        ) : null}
        {finishedUnclaimed ? <Text style={styles.resume}>Workout finished. Collect your XP.</Text> : null}
        {showDone && doneToday && doneSummary ? (
          <Text style={styles.done}>
            COMPLETED TODAY · {doneSummary.completedSets} sets · +{doneToday.xpAwarded} XP
          </Text>
        ) : null}
        {ready && historyLoaded ? action : null}
      </View>

      <Text style={styles.kicker}>DAILY OBJECTIVE</Text>
      <View style={styles.card}>
        <Text style={styles.body}>Complete today's workout</Text>
        <Text style={styles.muted}>Placeholder. Real objectives come later.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { color: colors.accent, fontSize: type.title, fontWeight: '800', letterSpacing: 6 },
  kicker: { color: colors.textSecondary, fontSize: type.caption, fontWeight: '700', letterSpacing: 2, marginTop: spacing.sm },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  program: { color: colors.accent, fontSize: type.caption, fontWeight: '700', letterSpacing: 1.5 },
  title: { color: colors.textPrimary, fontSize: type.title, fontWeight: '800' },
  body: { color: colors.textPrimary, fontSize: type.body, fontWeight: '600' },
  muted: { color: colors.textSecondary, fontSize: type.caption },
  done: { color: colors.accent, fontSize: type.body, fontWeight: '800', letterSpacing: 1, marginVertical: spacing.sm },
  resume: { color: colors.textPrimary, fontSize: type.body, marginVertical: spacing.sm },
});
