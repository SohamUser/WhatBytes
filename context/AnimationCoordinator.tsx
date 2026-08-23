import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { Dimensions, View } from "react-native";
import { SharedValue, useSharedValue, withSequence, withSpring, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { TearFlyOverlay } from "@/components/TearFlyOverlay";
import { useTasks } from "@/context/TaskContext";
import { useTearSound } from "@/hooks/useTearSound";
import type { TaskInput } from "@/types";
import { restoreStickyDraft } from "@/utils/stickyNotes";
import type { StickyDraft } from "@/utils/stickyNotes";
import { reconcilePendingIds, SubmissionQueue } from "@/utils/submissionQueue";

export interface ScreenRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface AnimationSubmission {
  taskId: string;
  input: TaskInput;
  previewTitle: string;
  previewDescription: string;
  sourceRect: ScreenRect;
  draftRevision: string;
}

interface ActiveSubmission {
  request: AnimationSubmission;
  targetRect: ScreenRect;
}

interface FailedSubmission extends AnimationSubmission {
  error: string;
}

interface AnimationCoordinatorValue {
  enqueueSubmission: (request: AnimationSubmission) => boolean;
  registerTaskIcon: (node: View | null) => void;
  optimisticBadgeCount: number;
  taskIconScale: SharedValue<number>;
  recentArrivalIds: ReadonlySet<string>;
  consumeRecentArrival: (taskId: string) => void;
  failedSubmissions: readonly FailedSubmission[];
  retryFailed: (taskId: string) => void;
  restoreFailed: (taskId: string) => StickyDraft | null;
  soundEnabled: boolean;
  toggleSound: () => void;
}

const AnimationCoordinatorContext = createContext<AnimationCoordinatorValue | null>(null);

export function AnimationCoordinatorProvider({ children }: PropsWithChildren) {
  const { tasks, createTask } = useTasks();
  const insets = useSafeAreaInsets();
  const { soundEnabled, toggleSound, playTear } = useTearSound();
  const taskIconScale = useSharedValue(1);
  const taskIconRef = useRef<View | null>(null);
  const queueRef = useRef(new SubmissionQueue<AnimationSubmission>());
  const activeRef = useRef<AnimationSubmission | null>(null);
  const failedRef = useRef<FailedSubmission[]>([]);
  const [active, setActive] = useState<ActiveSubmission | null>(null);
  const [optimisticIds, setOptimisticIds] = useState<Set<string>>(() => new Set());
  const [recentArrivalIds, setRecentArrivalIds] = useState<Set<string>>(() => new Set());
  const [failedSubmissions, setFailedSubmissions] = useState<FailedSubmission[]>([]);

  const beginRequest = useCallback(
    (request: AnimationSubmission) => {
      activeRef.current = request;
      const window = Dimensions.get("window");
      const fallback: ScreenRect = {
        x: window.width * 0.75 - 22,
        y: window.height - insets.bottom - 54,
        width: 44,
        height: 44,
      };
      const node = taskIconRef.current;
      if (!node) {
        setActive({ request, targetRect: fallback });
        return;
      }
      node.measureInWindow((x, y, width, height) => {
        setActive({
          request,
          targetRect: width > 0 && height > 0 ? { x, y, width, height } : fallback,
        });
      });
    },
    [insets.bottom],
  );

  const startNext = useCallback(() => {
    if (activeRef.current) return;
    const next = queueRef.current.dequeue();
    if (next) beginRequest(next);
  }, [beginRequest]);

  const addFailure = useCallback((request: AnimationSubmission) => {
    const failed: FailedSubmission = {
      ...request,
      error: "This note could not be saved. Retry it or restore the text.",
    };
    failedRef.current = [...failedRef.current, failed];
    setFailedSubmissions(failedRef.current);
  }, []);

  const persistRequest = useCallback(
    (request: AnimationSubmission) => {
      setOptimisticIds((current) => new Set(current).add(request.taskId));
      setRecentArrivalIds((current) => new Set(current).add(request.taskId));
      taskIconScale.value = withSequence(withTiming(0.8, { duration: 80 }), withSpring(1));
      void createTask(request.input, { id: request.taskId, silent: true }).catch(() => {
        setOptimisticIds((current) => {
          const next = new Set(current);
          next.delete(request.taskId);
          return next;
        });
        setRecentArrivalIds((current) => {
          const next = new Set(current);
          next.delete(request.taskId);
          return next;
        });
        addFailure(request);
      });
    },
    [addFailure, createTask, taskIconScale],
  );

  const finalizeActive = useCallback(
    (request: AnimationSubmission) => {
      if (!queueRef.current.markFinalized(request.taskId)) return;
      persistRequest(request);
      activeRef.current = null;
      setActive(null);
      const next = queueRef.current.dequeue();
      if (next) beginRequest(next);
    },
    [beginRequest, persistRequest],
  );

  const enqueueSubmission = useCallback(
    (request: AnimationSubmission) => {
      const accepted = queueRef.current.enqueue(request);
      if (!accepted) return false;
      startNext();
      return true;
    },
    [startNext],
  );

  useEffect(() => {
    const taskIds = new Set(tasks.map((task) => task.id));
    setOptimisticIds((current) => {
      const next = reconcilePendingIds(current, taskIds);
      return next.size === current.size ? current : next;
    });
  }, [tasks]);

  const consumeRecentArrival = useCallback((taskId: string) => {
    setRecentArrivalIds((current) => {
      if (!current.has(taskId)) return current;
      const next = new Set(current);
      next.delete(taskId);
      return next;
    });
  }, []);

  const retryFailed = useCallback(
    (taskId: string) => {
      const failed = failedRef.current.find((item) => item.taskId === taskId);
      if (!failed) return;
      failedRef.current = failedRef.current.filter((item) => item.taskId !== taskId);
      setFailedSubmissions(failedRef.current);
      queueRef.current.releaseForRetry(taskId, failed.draftRevision);
      enqueueSubmission({ ...failed, draftRevision: `${failed.draftRevision}:retry:${Date.now()}` });
    },
    [enqueueSubmission],
  );

  const restoreFailed = useCallback((taskId: string) => {
    const failed = failedRef.current.find((item) => item.taskId === taskId);
    if (!failed) return null;
    failedRef.current = failedRef.current.filter((item) => item.taskId !== taskId);
    setFailedSubmissions(failedRef.current);
    return restoreStickyDraft(failed.input);
  }, []);

  const value = useMemo<AnimationCoordinatorValue>(
    () => ({
      enqueueSubmission,
      registerTaskIcon: (node) => {
        taskIconRef.current = node;
      },
      optimisticBadgeCount: optimisticIds.size,
      taskIconScale,
      recentArrivalIds,
      consumeRecentArrival,
      failedSubmissions,
      retryFailed,
      restoreFailed,
      soundEnabled,
      toggleSound,
    }),
    [
      consumeRecentArrival,
      enqueueSubmission,
      failedSubmissions,
      optimisticIds.size,
      recentArrivalIds,
      restoreFailed,
      retryFailed,
      soundEnabled,
      taskIconScale,
      toggleSound,
    ],
  );

  return (
    <AnimationCoordinatorContext.Provider value={value}>
      <View className="flex-1">
        {children}
        {active ? (
          <TearFlyOverlay
            key={active.request.taskId}
            request={active.request}
            targetRect={active.targetRect}
            onComplete={() => finalizeActive(active.request)}
            onTearStart={playTear}
          />
        ) : null}
      </View>
    </AnimationCoordinatorContext.Provider>
  );
}

export function useAnimationCoordinator() {
  const context = useContext(AnimationCoordinatorContext);
  if (!context) throw new Error("useAnimationCoordinator must be used within AnimationCoordinatorProvider");
  return context;
}
