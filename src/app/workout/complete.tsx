import { useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { XpBar } from '@/components/gamification/XpBar';
import { Button } from '@/components/ui/Button';
import { Screen } from '@/components/ui/Screen';
import { awardForSession, type AwardOutcome } from '@/features/gamification/localProgress';
import { useWorkoutSession } from '@/features/training/SessionProvider';
import { summarize } from '@/features/training/sessionMachine';
import { localStore } from '@/services/storage/localStore';
import { colors, radius, spacing, type } from '@/theme/tokens';
import { formatDuration } from '@/utils/format';

const LOCAL_USER = 'local-user'; // replaced by the anonymous account in the backend step

export default function Complete() {
  const router = useRouter();
  const { ready, workout, session, clear } = useWorkoutSession();
  const [outcome, setOutcome] = useState<AwardOutcome | null>(null);
  const requested = useRef(false);
  const completed = session?.status === 'completed';

  useEffect(() => {
    if (!ready) return;
    if (!completed) {
      router.replace('/');
      return;
    }
    // The award is idempotent per session, so a re-render or relaunch never double-awards.
    if (requested.current || !session) return;
    requested.current = true;
    awardForSession(localStore, session, LOCAL_USER, Date.now()).then(setOutcome);
  }, [ready, completed, session, router]);

  if (!session || !completed) return null;
  const sum = summarize(session, workout);

  return (
    <Screen
      footer={
        <Button
          label="DONE"
          disabled={!outcome}
          onPress={async () => {
            await clear();
            router.replace('/');
          }}
        />
      }
    >
      <Text style={styles.kicker}>WORKOUT COMPLETE</Text>
      <Text style={styles.title}>YOU CRUXED IT.</Text>

      <View style={styles.xpCard}>
        <Text style={styles.xp}>+{outcome ? outcome.amount : '…'} XP</Text>
        {outcome && outcome.levelsGained > 0 ? <Text style={styles.levelUp}>LEVEL UP · LEVEL {outcome.progress.level}</Text> : null}
        {outcome ? <XpBar info={outcome.progress} /> : null}
      </View>

      <View style={styles.stats}>
        <Stat label="SETS" value={String(sum.completedSets)} />
        <Stat label="EXERCISES" value={String(sum.completedExercises)} />
        <Stat label="SKIPPED" value={String(sum.skippedExercises)} />
        <Stat label="TIME" value={formatDuration(session.elapsedMs)} />
      </View>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.accent, fontSize: type.caption, fontWeight: '700', letterSpacing: 2, marginTop: spacing.lg },
  title: { color: colors.textPrimary, fontSize: 40, fontWeight: '800' },
  xpCard: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  xp: { color: colors.accent, fontSize: 48, fontWeight: '800' },
  levelUp: { color: colors.textPrimary, fontSize: type.heading, fontWeight: '800', letterSpacing: 2 },
  stats: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  stat: { flexBasis: '47%', flexGrow: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  statValue: { color: colors.textPrimary, fontSize: type.title, fontWeight: '800' },
  statLabel: { color: colors.textSecondary, fontSize: type.caption, letterSpacing: 1.5 },
});
