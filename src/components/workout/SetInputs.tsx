import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { PrescribedSet } from '@/features/training/types';
import { colors, radius, spacing, type } from '@/theme/tokens';

type Field = 'reps' | 'weightKg' | 'durationSec' | 'distanceM';
const META: Record<Field, { label: string; unit: string; step: number }> = {
  reps: { label: 'REPS', unit: '', step: 1 },
  weightKg: { label: 'WEIGHT', unit: 'kg', step: 2.5 },
  durationSec: { label: 'TIME', unit: 'sec', step: 5 },
  distanceM: { label: 'DISTANCE', unit: 'm', step: 50 },
};
const ORDER: Field[] = ['reps', 'weightKg', 'durationSec', 'distanceM'];

export type SetValues = Partial<Record<Field, number>>;

// Shows a stepper for each value the prescription defines, prefilled from it.
// Remount with a new `key` per set so values reset to that set's prescription.
export function SetInputs({ prescribed, onChange }: { prescribed: PrescribedSet; onChange: (v: SetValues) => void }) {
  const [values, setValues] = useState<SetValues>(() => ({ ...prescribed }));
  const fields = ORDER.filter((f) => prescribed[f] !== undefined);

  const bump = (f: Field, dir: 1 | -1) => {
    const next = { ...values, [f]: Math.max(0, Math.round(((values[f] ?? 0) + dir * META[f].step) * 100) / 100) };
    setValues(next);
    onChange(next);
  };

  return (
    <View style={styles.row}>
      {fields.map((f) => (
        <View key={f} style={styles.card}>
          <Text style={styles.label}>{META[f].label}</Text>
          <Text style={styles.value}>
            {values[f]}
            {META[f].unit ? <Text style={styles.unit}> {META[f].unit}</Text> : null}
          </Text>
          <View style={styles.steppers}>
            <Pressable accessibilityRole="button" accessibilityLabel={`Decrease ${META[f].label}`} onPress={() => bump(f, -1)} style={styles.step}>
              <Text style={styles.stepText}>−</Text>
            </Pressable>
            <Pressable accessibilityRole="button" accessibilityLabel={`Increase ${META[f].label}`} onPress={() => bump(f, 1)} style={styles.step}>
              <Text style={styles.stepText}>+</Text>
            </Pressable>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.sm },
  card: { flex: 1, backgroundColor: colors.surface, borderRadius: radius.md, padding: spacing.md, alignItems: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.border },
  label: { color: colors.textSecondary, fontSize: type.caption, letterSpacing: 1.5 },
  value: { color: colors.textPrimary, fontSize: type.title, fontWeight: '800' },
  unit: { color: colors.textSecondary, fontSize: type.body, fontWeight: '600' },
  steppers: { flexDirection: 'row', gap: spacing.sm },
  step: { width: 52, height: 48, borderRadius: radius.sm, backgroundColor: colors.surfaceRaised, alignItems: 'center', justifyContent: 'center' },
  stepText: { color: colors.textPrimary, fontSize: 24, fontWeight: '700' },
});
