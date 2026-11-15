import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

import { SessionProvider } from '@/features/training/SessionProvider';
import { colors } from '@/theme/tokens';

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="light" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
        <Stack.Screen name="workout/run" options={{ gestureEnabled: false }} />
        <Stack.Screen name="workout/complete" options={{ gestureEnabled: false }} />
      </Stack>
    </SessionProvider>
  );
}
