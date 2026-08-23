import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FlatList, Pressable, Text, View } from "react-native";
import Animated, { LinearTransition, ReduceMotion } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { StickyActionSheet } from "@/components/StickyActionSheet";
import type { StickyAction } from "@/components/StickyActionSheet";
import { StickyTaskCard } from "@/components/StickyTaskCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { LoadingState } from "@/components/ui/LoadingState";
import { useAnimationCoordinator } from "@/context/AnimationCoordinator";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { useToast } from "@/context/ToastContext";
import { routes } from "@/navigation/routes";
import { logout } from "@/services/authService";
import type { Task } from "@/types";
import { getStickyAppearance } from "@/utils/stickyNotes";

export default function StickyTaskBoardScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { tasks, isLoading, error, busyTaskIds, retry, toggleTask, removeTask } = useTasks();
  const { recentArrivalIds, consumeRecentArrival } = useAnimationCoordinator();
  const [completedOpen, setCompletedOpen] = useState(false);
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(() => new Set());
  const [remoteArrivalIds, setRemoteArrivalIds] = useState<Set<string>>(() => new Set());
  const [activeSheet, setActiveSheet] = useState<
    { type: "account" } | { type: "task" | "delete"; task: Task } | null
  >(null);
  const knownIdsRef = useRef<Set<string> | null>(null);

  useEffect(() => {
    const nextIds = new Set(tasks.map((task) => task.id));
    if (knownIdsRef.current) {
      const arrivals = [...nextIds].filter((id) => !knownIdsRef.current?.has(id));
      if (arrivals.length) setRemoteArrivalIds((current) => new Set([...current, ...arrivals]));
    }
    knownIdsRef.current = nextIds;
  }, [tasks]);

  useEffect(() => {
    const completedIds = new Set(tasks.filter((task) => task.completed).map((task) => task.id));
    setHiddenIds((current) => {
      const next = new Set([...current].filter((id) => !completedIds.has(id)));
      return next.size === current.size ? current : next;
    });
  }, [tasks]);

  const activeTasks = useMemo(
    () => tasks.filter((task) => !task.completed && !hiddenIds.has(task.id)),
    [hiddenIds, tasks],
  );
  const completedTasks = useMemo(() => tasks.filter((task) => task.completed), [tasks]);

  function openEditor(taskId: string) {
    router.push({ pathname: routes.taskForm, params: { taskId } });
  }

  function openTaskMenu(task: Task) {
    setActiveSheet({ type: "task", task });
  }

  async function completeTask(task: Task) {
    setHiddenIds((current) => new Set(current).add(task.id));
    try {
      await toggleTask(task);
    } catch (mutationError) {
      setHiddenIds((current) => {
        const next = new Set(current);
        next.delete(task.id);
        return next;
      });
      throw mutationError;
    }
  }

  const markArrivalRendered = useCallback(
    (taskId: string) => {
      consumeRecentArrival(taskId);
      setRemoteArrivalIds((current) => {
        if (!current.has(taskId)) return current;
        const next = new Set(current);
        next.delete(taskId);
        return next;
      });
    },
    [consumeRecentArrival],
  );

  async function signOut() {
    try {
      await logout();
    } catch {
      showToast("Couldn't sign out. Please try again.", "error");
    }
  }

  let sheetTitle = "";
  let sheetMessage: string | undefined;
  let sheetActions: StickyAction[] = [];
  if (activeSheet?.type === "account") {
    sheetTitle = "Account";
    sheetMessage = user?.email ?? "Signed in";
    sheetActions = [
      {
        label: "Sign out",
        icon: "log-out-outline",
        tone: "danger",
        onPress: () => {
          setActiveSheet(null);
          void signOut();
        },
      },
    ];
  } else if (activeSheet?.type === "task") {
    const selectedTask = activeSheet.task;
    sheetTitle = selectedTask.title;
    sheetActions = [
      {
        label: "Edit note",
        icon: "create-outline",
        onPress: () => {
          setActiveSheet(null);
          openEditor(selectedTask.id);
        },
      },
      {
        label: "Delete note",
        icon: "trash-outline",
        tone: "danger",
        onPress: () => setActiveSheet({ type: "delete", task: selectedTask }),
      },
    ];
  } else if (activeSheet?.type === "delete") {
    const selectedTask = activeSheet.task;
    sheetTitle = "Delete this note?";
    sheetMessage = `“${selectedTask.title}” will be permanently removed.`;
    sheetActions = [
      {
        label: "Delete permanently",
        icon: "trash-outline",
        tone: "danger",
        onPress: () => {
          setActiveSheet(null);
          void removeTask(selectedTask.id);
        },
      },
    ];
  }

  if (isLoading && tasks.length === 0) return <LoadingState label="Loading your notes…" />;

  return (
    <SafeAreaView className="flex-1 bg-cork-300" edges={["top", "left", "right"]}>
      <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
        <View>
          <Text className="text-xs font-bold uppercase tracking-[2px] text-ink-700">Your board</Text>
          <Text className="text-3xl text-ink-900" style={{ fontFamily: "Kalam_700Bold" }}>
            {activeTasks.length} {activeTasks.length === 1 ? "note" : "notes"} to do
          </Text>
        </View>
        <Pressable
          accessibilityLabel={`Account, ${user?.email ?? "signed in"}`}
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-full border border-cork-700/30 bg-paper-50/65"
          onPress={() => setActiveSheet({ type: "account" })}
        >
          <Text className="font-bold text-ink-700">{user?.email?.charAt(0).toUpperCase() || "A"}</Text>
        </Pressable>
      </View>

      {error ? (
        <View className="gap-2 px-5 pb-3">
          <InlineBanner message={error} />
          <Button label="Retry" variant="secondary" onPress={retry} />
        </View>
      ) : null}

      <FlatList
        data={activeTasks}
        keyExtractor={(task) => task.id}
        numColumns={2}
        columnWrapperClassName="gap-3 px-4"
        contentContainerClassName="gap-3 pb-28 pt-2"
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <View className="px-5 pt-12">
            <EmptyState
              actionLabel="Create a note"
              icon="create-outline"
              message="Tear off a fresh sticky note and it will land here."
              title="Your board is clear"
              onAction={() => router.push(routes.create)}
            />
          </View>
        }
        ListFooterComponent={
          completedTasks.length ? (
            <View className="mx-4 mt-5 overflow-hidden rounded-2xl border border-cork-700/20 bg-paper-50/80">
              <Pressable
                accessibilityLabel={`${completedOpen ? "Collapse" : "Expand"} ${completedTasks.length} completed tasks`}
                accessibilityRole="button"
                className="min-h-14 flex-row items-center px-4 active:bg-stone-200/70"
                onPress={() => setCompletedOpen((current) => !current)}
              >
                <Ionicons color="#57534E" name="file-tray-full-outline" size={22} />
                <Text className="ml-3 flex-1 text-base font-bold text-ink-700">
                  Completed stack · {completedTasks.length}
                </Text>
                <Ionicons color="#57534E" name={completedOpen ? "chevron-up" : "chevron-down"} size={20} />
              </Pressable>
              {completedOpen ? (
                <View className="gap-3 px-3 pb-3">
                  {completedTasks.map((task) => (
                    <StickyTaskCard
                      key={task.id}
                      busy={busyTaskIds.has(task.id)}
                      completed
                      task={task}
                      onComplete={() => toggleTask(task)}
                      onEdit={() => openEditor(task.id)}
                      onOpenMenu={() => openTaskMenu(task)}
                    />
                  ))}
                </View>
              ) : null}
            </View>
          ) : null
        }
        renderItem={({ item }) => {
          const appearance = getStickyAppearance(item.id);
          const arriving = recentArrivalIds.has(item.id) || remoteArrivalIds.has(item.id);
          return (
            <Animated.View
              className="flex-1"
              layout={LinearTransition.springify().damping(17).reduceMotion(ReduceMotion.System)}
              style={{ marginTop: appearance.stagger, maxWidth: "50%" }}
            >
              <StickyTaskCard
                arriving={arriving}
                busy={busyTaskIds.has(item.id)}
                task={item}
                onArrivalRendered={() => markArrivalRendered(item.id)}
                onComplete={() => completeTask(item)}
                onEdit={() => openEditor(item.id)}
                onOpenMenu={() => openTaskMenu(item)}
              />
            </Animated.View>
          );
        }}
      />
      <StickyActionSheet
        actions={sheetActions}
        message={sheetMessage}
        title={sheetTitle}
        visible={activeSheet !== null}
        onClose={() => setActiveSheet(null)}
      />
    </SafeAreaView>
  );
}
