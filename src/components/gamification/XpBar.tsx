import { StyleSheet, Text, View } from 'react-native';

import { ProgressBar } from '@/components/ui/ProgressBar';
import type { LevelInfo } from '@/features/gamification/xp';
import { colors, spacing, type } from '@/theme/tokens';

export function XpBar({ info }: { info: LevelInfo }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.row}>
        <Text style={styles.level}>LEVEL {info.level}</Text>
        <Text style={styles.xp}>
          {info.xpIntoLevel} / {info.xpForNextLevel} XP
        </Text>
      </View>
      <ProgressBar progress={info.progress} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: spacing.sm },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  level: { color: colors.accent, fontSize: type.heading, fontWeight: '800', letterSpacing: 2 },
  xp: { color: colors.textSecondary, fontSize: type.caption },
});
