import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { localStore } from '@/services/storage/localStore';
import { dateKey, findCompletedOn, loadHistory, type CompletedWorkout } from './workoutHistory';

// Whether this workout was already finished today (local date).
// Loads whenever the screen gains focus; call reload() after changing history.
export function useCompletedToday(workoutId: string) {
  const [entry, setEntry] = useState<CompletedWorkout | null>(null);
  const [loaded, setLoaded] = useState(false);

  const reload = useCallback(async () => {
    const history = await loadHistory(localStore);
    setEntry(findCompletedOn(history, workoutId, dateKey(Date.now())));
    setLoaded(true);
  }, [workoutId]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload]),
  );

  return { entry, loaded, reload };
}
