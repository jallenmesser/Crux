import { useRouter } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useWorkoutSession } from '@/features/training/SessionProvider';
import { isResumable } from '@/features/training/sessionStorage';
import { colors, radius, spacing, type } from '@/theme/tokens';
import { describeSet } from '@/utils/format';

export default function Overview() {
  const router = useRouter();
  const { workout, session, startWorkout } = useWorkoutSession();
  const inProgress = !!session && isResumable(session);
  const muscles = Array.from(new Set(workout.exercises.flatMap((e) => e.muscleGroups ?? [])));

  return (
    <Screen
      footer={
        <>
          <Button
            label={inProgress ? 'RESUME WORKOUT' : 'START WORKOUT'}
            onPress={() => {
              if (!inProgress) startWorkout();
              router.replace('/workout/run');
            }}
          />
          <Button label="Back" variant="ghost" onPress={() => router.back()} />
        </>
      }
    >
      <Text style={styles.kicker}>
        {workout.programName.toUpperCase()} · DAY {String(workout.dayNumber).padStart(2, '0')}
      </Text>
      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.muted}>
        {workout.exercises.length} exercises · ~{workout.estimatedMinutes} min
      </Text>
      {muscles.length ? <Text style={styles.muted}>{muscles.join(' · ')}</Text> : null}

      {workout.exercises.map((e, i) => (
        <View key={e.id} style={styles.row}>
          <Text style={styles.index}>{i + 1}</Text>
          <View style={styles.rowBody}>
            <Text style={styles.name}>{e.name}</Text>
            <Text style={styles.muted}>
              {e.sets.length} {e.sets.length === 1 ? 'set' : 'sets'} · {describeSet(e.sets[0])}
            </Text>
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.accent, fontSize: type.caption, fontWeight: '700', letterSpacing: 2 },
  title: { color: colors.textPrimary, fontSize: type.title, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: type.caption },
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  index: { color: colors.accent, fontSize: type.heading, fontWeight: '800', width: 28, textAlign: 'center' },
  rowBody: { flex: 1, gap: 2 },
  name: { color: colors.textPrimary, fontSize: type.body, fontWeight: '700' },
});
