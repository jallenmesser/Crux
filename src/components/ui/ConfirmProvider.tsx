import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { Modal, StyleSheet, Text, View } from 'react-native';

import { colors, radius, spacing, type } from '@/theme/tokens';
import { Button } from './Button';

type Request = { title: string; message: string; confirmLabel: string; destructive?: boolean; onConfirm: () => void };
type Confirm = (req: Request) => void;

const ConfirmContext = createContext<Confirm | null>(null);

// In-app confirmation dialog. Native and browser dialogs (Alert, window.confirm) are blocked or
// unreliable in some viewers, so this renders its own modal everywhere.
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [req, setReq] = useState<Request | null>(null);
  const confirm = useCallback<Confirm>((r) => setReq(r), []);
  const value = useMemo(() => confirm, [confirm]);

  const close = () => setReq(null);

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal transparent animationType="fade" visible={!!req} onRequestClose={close}>
        <View style={styles.backdrop}>
          <View style={styles.card} accessibilityViewIsModal>
            <Text style={styles.title}>{req?.title}</Text>
            <Text style={styles.message}>{req?.message}</Text>
            <Button
              label={req?.confirmLabel ?? 'OK'}
              variant={req?.destructive ? 'danger' : 'primary'}
              onPress={() => {
                const run = req?.onConfirm;
                close();
                run?.();
              }}
            />
            <Button label="Cancel" variant="ghost" onPress={close} />
          </View>
        </View>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): Confirm {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.7)', justifyContent: 'center', padding: spacing.lg },
  card: { backgroundColor: colors.surface, borderRadius: radius.lg, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  title: { color: colors.textPrimary, fontSize: type.heading, fontWeight: '800' },
  message: { color: colors.textSecondary, fontSize: type.body, lineHeight: 22 },
});
