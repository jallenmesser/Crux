import AsyncStorage from '@react-native-async-storage/async-storage';

import type { KeyValueStore } from '@/features/training/sessionStorage';

// App-level storage. Logic modules take a KeyValueStore so they stay independent of React Native.
export const localStore: KeyValueStore = AsyncStorage;
