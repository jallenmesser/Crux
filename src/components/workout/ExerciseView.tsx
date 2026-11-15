import { useRef } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Screen } from '@/components/ui/Screen';
import { isWorkoutDone } from '@/features/training/sessionMachine';
import type { Session, SessionEvent, Workout } from '@/features/training/types';
import { colors, radius, spacing, type } from '@/theme/tokens';
import { describeSet } from '@/utils/format';
import { SetInputs, type SetValues } from './SetInputs';

type Props = {
  workout: Workout;
  session: Session;
  send: (e: SessionEvent) => void;
  onPause: () => void;
  onFinishEarly: () => void;
};

export function ExerciseView({ workout, session, send, onPause, onFinishEarly }: Props) {
  const values = useRef<SetValues>({});
  const done = isWorkoutDone(session, workout);
  const total = workout.exercises.length;

  if (done) {
    return (
      <Screen
        footer={<Button label="FINISH WORKOUT" onPress={() => send({ type: 'FINISH' })} />}
      >
        <Text style={styles.kicker}>ALL EXERCISES DONE</Text>
        <Text style={styles.title}>Last call.</Text>
        <Text style={styles.body}>
          {session.loggedSets.length} sets logged. Finish to lock in your XP.
        </Text>
      </Screen>
    );
  }

  const exercise = workout.exercises[session.exerciseIndex];
  const prescribed = exercise.sets[session.setIndex];
  const loggedHere = session.loggedSets.filter((l) => l.exerciseId === exercise.id).length;
  const key = `${exercise.id}-${session.setIndex}`;

  return (
    <Screen
      footer={
        <>
          <Button
            label={`COMPLETE SET ${session.setIndex + 1}`}
            onPress={() => {
              send({ type: 'COMPLETE_SET', ...values.current });
              values.current = {};
            }}
          />
          <View style={styles.footerRow}>
            <Button
              label="SKIP EXERCISE"
              variant="secondary"
              style={styles.flex}
              onPress={() => {
                values.current = {};
                send({ type: 'SKIP_EXERCISE' });
              }}
            />
            {loggedHere > 0 ? (
              <Button
                label="NEXT EXERCISE"
                variant="secondary"
                style={styles.flex}
                onPress={() => {
                  values.current = {};
                  send({ type: 'NEXT_EXERCISE' });
                }}
              />
            ) : null}
          </View>
        </>
      }
    >
      <View style={styles.topRow}>
        <Text style={styles.kicker}>
          EXERCISE {session.exerciseIndex + 1} OF {total}
        </Text>
        <View style={styles.topActions}>
          {session.loggedSets.length > 0 ? <Button label="Finish" variant="ghost" onPress={onFinishEarly} style={styles.small} /> : null}
          <Button label="Pause" variant="ghost" onPress={onPause} style={styles.small} />
        </View>
      </View>
      <ProgressBar progress={session.exerciseIndex / total} />

      <Text style={styles.title}>{exercise.name}</Text>
      {exercise.muscleGroups ? <Text style={styles.muted}>{exercise.muscleGroups.join(' · ')}</Text> : null}

      <View style={styles.demo} accessibilityLabel="Exercise demonstration placeholder">
        <Text style={styles.demoText}>DEMO COMING</Text>
      </View>

      <Text style={styles.setLine}>
        SET {session.setIndex + 1} OF {exercise.sets.length}
        <Text style={styles.muted}>   target {describeSet(prescribed)}</Text>
      </Text>

      <SetInputs key={key} prescribed={prescribed} onChange={(v) => (values.current = v)} />

      {exercise.instructions ? <Text style={styles.body}>{exercise.instructions}</Text> : null}
      {exercise.notes ? <Text style={styles.note}>{exercise.notes}</Text> : null}
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  topActions: { flexDirection: 'row' },
  small: { minHeight: 40, paddingHorizontal: spacing.sm },
  kicker: { color: colors.accent, fontSize: type.caption, fontWeight: '700', letterSpacing: 2 },
  title: { color: colors.textPrimary, fontSize: type.title, fontWeight: '800' },
  muted: { color: colors.textSecondary, fontSize: type.caption },
  body: { color: colors.textSecondary, fontSize: type.body, lineHeight: 22 },
  note: { color: colors.textPrimary, fontSize: type.caption, backgroundColor: colors.surface, padding: spacing.md, borderRadius: radius.md },
  setLine: { color: colors.textPrimary, fontSize: type.body, fontWeight: '700', letterSpacing: 1 },
  demo: { height: 160, borderRadius: radius.md, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  demoText: { color: colors.textSecondary, letterSpacing: 3, fontSize: type.caption },
  footerRow: { flexDirection: 'row', gap: spacing.sm },
});
