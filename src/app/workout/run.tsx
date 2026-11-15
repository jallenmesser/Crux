import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler } from 'react-native';

import { ExerciseView } from '@/components/workout/ExerciseView';
import { PausedView } from '@/components/workout/PausedView';
import { RestView } from '@/components/workout/RestView';
import { useWorkoutSession } from '@/features/training/SessionProvider';
import { useConfirm } from '@/components/ui/ConfirmProvider';

// One route renders the whole in-workout flow from session status.
// There is no screen-to-screen navigation during a workout, so it cannot get out of sync with state.
export default function Run() {
  const router = useRouter();
  const { ready, workout, session, send, clear } = useWorkoutSession();
  const confirm = useConfirm();
  const status = session?.status;

  useEffect(() => {
    if (!ready) return;
    if (!status || status === 'abandoned') router.replace('/');
    else if (status === 'completed') router.replace('/workout/complete');
  }, [ready, status, router]);

  // Hardware back pauses instead of leaving mid-workout.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (status === 'exercising' || status === 'resting') send({ type: 'PAUSE' });
      return true;
    });
    return () => sub.remove();
  }, [status, send]);

  if (!session || (status !== 'exercising' && status !== 'resting' && status !== 'paused')) return null;

  const pause = () => send({ type: 'PAUSE' });
  const finishEarly = () =>
    confirm({
      title: 'Finish now?',
      message: 'You earn XP for the sets you logged. Remaining exercises are left out.',
      confirmLabel: 'FINISH',
      onConfirm: () => send({ type: 'FINISH' }),
    });
  const quit = () =>
    confirm({
      title: 'Quit this workout?',
      message: 'No XP for an unfinished workout. Your logged sets are not saved.',
      confirmLabel: 'QUIT',
      destructive: true,
      onConfirm: async () => {
        send({ type: 'ABANDON' });
        await clear();
        router.replace('/');
      },
    });

  if (status === 'paused') return <PausedView session={session} send={send} onQuit={quit} onFinishEarly={finishEarly} />;
  if (status === 'resting') return <RestView workout={workout} session={session} send={send} onPause={pause} />;
  return <ExerciseView workout={workout} session={session} send={send} onPause={pause} onFinishEarly={finishEarly} onQuit={quit} />;
}
