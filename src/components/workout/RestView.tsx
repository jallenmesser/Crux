import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { useNow } from '@/hooks/useNow';
import { getRestRemainingMs } from '@/features/training/sessionMachine';
import type { Session, SessionEvent, Workout } from '@/features/training/types';
import { colors, spacing, type } from '@/theme/tokens';
import { describeSet, formatClock } from '@/utils/format';

type Props = { workout: Workout; session: Session; send: (e: SessionEvent) => void; onPause: () => void };

export function RestView({ workout, session, send, onPause }: Props) {
  const now = useNow(true);
  const remaining = getRestRemainingMs(session, now);
  const next = workout.exercises[session.exerciseIndex];

  // Timer end advances the session. REST_DONE is ignored by the machine until the time has really elapsed.
  useEffect(() => {
    if (remaining <= 0) send({ type: 'REST_DONE' });
  }, [remaining, send]);

  return (
    <Screen
      footer={
        <>
          <Button label="SKIP REST" onPress={() => send({ type: 'SKIP_REST' })} />
          <View style={styles.row}>
            <Button label="− 10s" variant="secondary" style={styles.flex} onPress={() => send({ type: 'ADJUST_REST', deltaSeconds: -10 })} />
            <Button label="+ 10s" variant="secondary" style={styles.flex} onPress={() => send({ type: 'ADJUST_REST', deltaSeconds: 10 })} />
          </View>
          <Button label="Pause" variant="ghost" onPress={onPause} />
        </>
      }
    >
      <Text style={styles.kicker}>REST</Text>
      <Text style={styles.clock} accessibilityLabel={`Rest time remaining ${formatClock(remaining)}`}>
        {formatClock(remaining)}
      </Text>
      <Text style={styles.muted}>Breathe. Next up:</Text>
      {next ? (
        <View style={styles.next}>
          <Text style={styles.nextName}>{next.name}</Text>
          <Text style={styles.muted}>
            Set {session.setIndex + 1} of {next.sets.length} · {describeSet(next.sets[session.setIndex])}
          </Text>
        </View>
      ) : null}
      <Text style={styles.quip}>Stay locked in.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: { flexDirection: 'row', gap: spacing.sm },
  kicker: { color: colors.accent, fontSize: type.caption, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginTop: spacing.lg },
  clock: { color: colors.textPrimary, fontSize: 96, fontWeight: '800', textAlign: 'center', fontVariant: ['tabular-nums'] },
  muted: { color: colors.textSecondary, fontSize: type.body, textAlign: 'center' },
  next: { alignItems: 'center', gap: spacing.xs },
  nextName: { color: colors.textPrimary, fontSize: type.heading, fontWeight: '800' },
  quip: { color: colors.accent, fontSize: type.body, fontWeight: '700', textAlign: 'center', marginTop: spacing.lg, letterSpacing: 1 },
});
