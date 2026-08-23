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
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAnimationCoordinator } from "@/context/AnimationCoordinator";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { useToast } from "@/context/ToastContext";
import { routes } from "@/navigation/routes";
import { logout } from "@/services/authService";
import type { PriorityFilter, Task, TaskStatusFilter } from "@/types";
import { cn } from "@/utils/cn";
import { filterAndSortTasks } from "@/utils/taskFilters";

const statusOptions: { label: string; value: TaskStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "To do", value: "incomplete" },
  { label: "Done", value: "completed" },
];

const priorityOptions: { label: string; value: PriorityFilter }[] = [
  { label: "All priorities", value: "all" },
  { label: "High", value: "high" },
  { label: "Medium", value: "medium" },
  { label: "Low", value: "low" },
];

export default function StickyTaskBoardScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { tasks, isLoading, error, busyTaskIds, retry, toggleTask, removeTask } = useTasks();
  const { recentArrivalIds, consumeRecentArrival } = useAnimationCoordinator();
  const [status, setStatus] = useState<TaskStatusFilter>("incomplete");
  const [priority, setPriority] = useState<PriorityFilter>("all");
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

  const visibleTasks = useMemo(
    () => filterAndSortTasks(
      tasks.filter((task) => task.completed || !hiddenIds.has(task.id)),
      { priority, status },
    ),
    [hiddenIds, priority, status, tasks],
  );
  const activeCount = useMemo(
    () => tasks.reduce((count, task) => count + (task.completed ? 0 : 1), 0),
    [tasks],
  );
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
            {activeCount} {activeCount === 1 ? "note" : "notes"} to do
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
        data={visibleTasks}
        keyExtractor={(task) => task.id}
        contentContainerClassName="pb-28"
        keyboardShouldPersistTaps="handled"
        ListHeaderComponent={
          <View className="gap-3 px-4 pb-4 pt-2">
            <SegmentedControl
              accessibilityLabel="Filter tasks by status"
              options={statusOptions}
              value={status}
              onChange={setStatus}
            />
            <View>
              <Text className="mb-2 text-xs font-bold uppercase tracking-[1.5px] text-ink-700">
                Priority
              </Text>
              <View className="flex-row flex-wrap gap-2">
                {priorityOptions.map((option) => {
                  const selected = priority === option.value;
                  return (
                    <Pressable
                      key={option.value}
                      accessibilityLabel={`${option.label} priority filter`}
                      accessibilityRole="radio"
                      accessibilityState={{ checked: selected }}
                      className={cn(
                        "min-h-11 items-center justify-center rounded-full border px-4",
                        selected
                          ? "border-accent-600 bg-accent-500"
                          : "border-cork-700/25 bg-paper-50/75 active:bg-paper-100",
                      )}
                      onPress={() => setPriority(option.value)}
                    >
                      <Text className={cn("text-sm font-bold", selected ? "text-white" : "text-ink-700")}>
                        {option.label}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Text className="mt-2 text-xs font-semibold text-ink-700/70">
                Sorted by due date · earliest first
              </Text>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="px-5 pt-12">
            {tasks.length === 0 ? (
              <EmptyState
                actionLabel="Create a note"
                icon="create-outline"
                message="Tear off a fresh sticky note and it will land here."
                title="Your board is clear"
                onAction={() => router.push(routes.create)}
              />
            ) : (
              <EmptyState
                actionLabel="Clear filters"
                icon="options-outline"
                message="No notes match the selected status and priority."
                title="No matching notes"
                onAction={() => {
                  setStatus("incomplete");
                  setPriority("all");
                }}
              />
            )}
          </View>
        }
        renderItem={({ item }) => {
          const arriving = recentArrivalIds.has(item.id) || remoteArrivalIds.has(item.id);
          return (
            <Animated.View
              className="mb-4 px-4"
              layout={LinearTransition.springify().damping(17).reduceMotion(ReduceMotion.System)}
            >
              <StickyTaskCard
                arriving={arriving && !item.completed}
                busy={busyTaskIds.has(item.id)}
                completed={item.completed}
                task={item}
                onArrivalRendered={() => markArrivalRendered(item.id)}
                onComplete={() => (item.completed ? toggleTask(item) : completeTask(item))}
                onDelete={() => setActiveSheet({ type: "delete", task: item })}
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
