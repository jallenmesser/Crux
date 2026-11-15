import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { SetInputs, type SetValues } from '@/components/workout/SetInputs';
import { useWorkoutSession } from '@/features/training/SessionProvider';
import { addLoggedSet, updateLoggedSet } from '@/features/training/historyEdit';
import { useCompletedToday } from '@/features/training/useCompletedToday';
import { upsertCompleted, type CompletedWorkout } from '@/features/training/workoutHistory';
import { localStore } from '@/services/storage/localStore';
import { colors, radius, spacing, type } from '@/theme/tokens';
import { describeSet } from '@/utils/format';

// Edit the sets of today's finished workout. XP was awarded at completion and does not change here.
export default function EditWorkout() {
  const router = useRouter();
  const { workout } = useWorkoutSession();
  const { entry, loaded, reload } = useCompletedToday(workout.id);
  const [editing, setEditing] = useState<string | null>(null);
  const values = useRef<SetValues>({});

  useEffect(() => {
    if (loaded && !entry) router.replace('/');
  }, [loaded, entry, router]);

  if (!entry) return null;

  const save = async (next: CompletedWorkout['session']) => {
    await upsertCompleted(localStore, { ...entry, session: next });
    await reload();
  };

  return (
    <Screen footer={<Button label="DONE" onPress={() => router.replace('/')} />}>
      <Text style={styles.kicker}>EDIT WORKOUT</Text>
      <Text style={styles.title}>{workout.name}</Text>
      <Text style={styles.muted}>XP stays at +{entry.xpAwarded}. Editing does not run the workout again.</Text>

      {workout.exercises.map((ex, ei) => (
        <View key={ex.id} style={styles.card}>
          <Text style={styles.name}>{ex.name}</Text>
          {ex.sets.map((prescribed, si) => {
            const logged = entry.session.loggedSets.find((l) => l.exerciseIndex === ei && l.setIndex === si);
            const id = `${ei}-${si}`;
            if (!logged) {
              return (
                <View key={id} style={styles.row}>
                  <Text style={styles.muted}>Set {si + 1} · not done</Text>
                  <Pressable
                    accessibilityRole="button"
                    accessibilityLabel={`Add ${ex.name} set ${si + 1}`}
                    onPress={() => save(addLoggedSet(entry.session, workout, ei, si, Date.now()))}
                    style={styles.action}
                  >
                    <Text style={styles.actionText}>ADD</Text>
                  </Pressable>
                </View>
              );
            }
            if (editing === id) {
              return (
                <View key={id} style={styles.editBox}>
                  <Text style={styles.setLabel}>SET {si + 1}</Text>
                  <SetInputs prescribed={logged} onChange={(v) => (values.current = v)} />
                  <View style={styles.row}>
                    <Button label="SAVE" style={styles.flex} onPress={async () => {
                      await save(updateLoggedSet(entry.session, ei, si, values.current));
                      values.current = {};
                      setEditing(null);
                    }} />
                    <Button label="Cancel" variant="ghost" onPress={() => { values.current = {}; setEditing(null); }} />
                  </View>
                </View>
              );
            }
            return (
              <View key={id} style={styles.row}>
                <Text style={styles.setText}>Set {si + 1} · {describeSet(logged)}</Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Edit ${ex.name} set ${si + 1}`}
                  onPress={() => { values.current = {}; setEditing(id); }}
                  style={styles.action}
                >
                  <Text style={styles.actionText}>EDIT</Text>
                </Pressable>
              </View>
            );
          })}
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  kicker: { color: colors.accent, fontSize: type.caption, fontWeight: '700', letterSpacing: 2 },
  title: { color: colors.textPrimary, fontSize: type.title, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: type.caption },
  card: { backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  name: { color: colors.textPrimary, fontSize: type.body, fontWeight: '800' },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  setText: { color: colors.textPrimary, fontSize: type.body, flex: 1 },
  setLabel: { color: colors.textSecondary, fontSize: type.caption, letterSpacing: 1.5 },
  editBox: { gap: spacing.sm, paddingVertical: spacing.sm },
  action: { minHeight: 44, minWidth: 64, borderRadius: radius.sm, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
  actionText: { color: colors.accent, fontWeight: '800', letterSpacing: 1 },
});
