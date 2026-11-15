import { StyleSheet, Text, View } from 'react-native';

import { colors, spacing, type } from '@/theme/tokens';

// Placeholder. Replaced by the Home / Today screen in the screens step.
export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>CRUX</Text>
      <Text style={styles.sub}>You don't just work out. You Crux it.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', padding: spacing.lg },
  title: { color: colors.accent, fontSize: type.title, fontWeight: '800', letterSpacing: 4 },
  sub: { color: colors.textSecondary, fontSize: type.body, marginTop: spacing.sm },
});
