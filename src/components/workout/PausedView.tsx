import { StyleSheet, Text } from 'react-native';

import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { getElapsedMs } from '@/features/training/sessionMachine';
import type { Session, SessionEvent } from '@/features/training/types';
import { colors, spacing, type } from '@/theme/tokens';
import { formatDuration } from '@/utils/format';

type Props = { session: Session; send: (e: SessionEvent) => void; onQuit: () => void; onFinishEarly: () => void };

export function PausedView({ session, send, onQuit, onFinishEarly }: Props) {
  return (
    <Screen
      footer={
        <>
          <Button label="RESUME" onPress={() => send({ type: 'RESUME' })} />
          {session.loggedSets.length > 0 ? <Button label="FINISH WORKOUT" variant="secondary" onPress={onFinishEarly} /> : null}
          <Button label="Quit without finishing" variant="danger" onPress={onQuit} />
        </>
      }
    >
      <Text style={styles.kicker}>PAUSED</Text>
      <Text style={styles.clock}>{formatDuration(getElapsedMs(session, Date.now()))}</Text>
      <Text style={styles.body}>{session.loggedSets.length} sets logged. The clock is stopped. Pick up when you're ready.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.accent, fontSize: type.caption, fontWeight: '700', letterSpacing: 2, textAlign: 'center', marginTop: spacing.xl },
  clock: { color: colors.textPrimary, fontSize: 72, fontWeight: '800', textAlign: 'center' },
  body: { color: colors.textSecondary, fontSize: type.body, textAlign: 'center', lineHeight: 22 },
});
