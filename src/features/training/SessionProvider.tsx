import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { WORKOUT_DEFAULTS } from '@/config/gamification';
import { localStore } from '@/services/storage/localStore';
import { SEED_WORKOUT } from './seedWorkout';
import { startSession, transition } from './sessionMachine';
import { clearSession, loadSession, restoreAfterInterruption, saveSession } from './sessionStorage';
import type { Session, SessionEvent, Workout } from './types';

type Ctx = {
  ready: boolean;
  workout: Workout;
  session: Session | null;
  startWorkout: () => void;
  send: (event: SessionEvent) => void;
  clear: () => Promise<void>;
};

const SessionContext = createContext<Ctx | null>(null);

const newId = () => `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;

// Single owner of the active workout session. Screens render it and send events; they hold no workout logic.
export function SessionProvider({ children }: { children: ReactNode }) {
  const workout = SEED_WORKOUT; // placeholder source until stored/AI workouts exist
  const [ready, setReady] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const ref = useRef<Session | null>(null);

  const commit = useCallback((next: Session | null) => {
    ref.current = next;
    setSession(next);
    if (next) saveSession(localStore, next, Date.now()).catch(() => {});
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      const saved = await loadSession(localStore);
      if (!alive) return;
      if (saved && saved.session.workoutId === workout.id) {
        const restored = restoreAfterInterruption(saved, workout, WORKOUT_DEFAULTS.restSeconds);
        ref.current = restored;
        setSession(restored);
        if (restored !== saved.session) saveSession(localStore, restored, saved.savedAt).catch(() => {});
      }
      setReady(true);
    })();
    return () => {
      alive = false;
    };
  }, [workout]);

  const startWorkout = useCallback(() => {
    // Never replace a session that is still in progress.
    const cur = ref.current;
    if (cur && (cur.status === 'exercising' || cur.status === 'resting' || cur.status === 'paused')) return;
    commit(startSession(workout, newId(), Date.now()));
  }, [commit, workout]);

  const send = useCallback(
    (event: SessionEvent) => {
      const cur = ref.current;
      if (!cur) return;
      const next = transition(cur, event, Date.now(), workout, WORKOUT_DEFAULTS.restSeconds);
      if (next !== cur) commit(next);
    },
    [commit, workout],
  );

  const clear = useCallback(async () => {
    ref.current = null;
    setSession(null);
    await clearSession(localStore);
  }, []);

  const value = useMemo(
    () => ({ ready, workout, session, startWorkout, send, clear }),
    [ready, workout, session, startWorkout, send, clear],
  );
  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useWorkoutSession(): Ctx {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useWorkoutSession must be used inside SessionProvider');
  return ctx;
}
