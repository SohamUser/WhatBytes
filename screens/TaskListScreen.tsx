import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useMemo, useState } from "react";
import { Alert, Pressable, RefreshControl, SectionList, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import { FilterSheet } from "@/components/FilterSheet";
import { TaskCard } from "@/components/TaskCard";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ExtendedFab } from "@/components/ui/ExtendedFab";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { LoadingState } from "@/components/ui/LoadingState";
import { SearchField } from "@/components/ui/SearchField";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useAuth } from "@/context/AuthContext";
import { useTasks } from "@/context/TaskContext";
import { useToast } from "@/context/ToastContext";
import { routes } from "@/navigation/routes";
import { logout } from "@/services/authService";
import { PriorityFilter, Task, TaskStatusFilter } from "@/types";
import { groupTasksByDueDate } from "@/utils/taskSections";

const statusOptions: { label: string; value: TaskStatusFilter }[] = [
  { label: "All", value: "all" },
  { label: "To do", value: "incomplete" },
  { label: "Done", value: "completed" },
];

const headerDateFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: "long",
  day: "numeric",
  month: "long",
});

const priorityLabels: Record<Exclude<PriorityFilter, "all">, string> = {
  low: "Low priority",
  medium: "Medium priority",
  high: "High priority",
};

export default function TaskListScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { tasks, isLoading, error, busyTaskIds, retry, toggleTask, removeTask } = useTasks();
  const [priority, setPriority] = useState<PriorityFilter>("all");
  const [status, setStatus] = useState<TaskStatusFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSheetOpen, setFilterSheetOpen] = useState(false);
  const insets = useSafeAreaInsets();

  const filteredTasks = useMemo(() => {
    const normalizedSearch = searchQuery.trim().toLocaleLowerCase();
    return tasks.filter((task) => {
      const matchesPriority = priority === "all" || task.priority === priority;
      const matchesStatus =
        status === "all" || (status === "completed" ? task.completed : !task.completed);
      const matchesSearch =
        !normalizedSearch ||
        task.title.toLocaleLowerCase().includes(normalizedSearch) ||
        task.description.toLocaleLowerCase().includes(normalizedSearch);
      return matchesPriority && matchesStatus && matchesSearch;
    });
  }, [priority, searchQuery, status, tasks]);

  const sections = useMemo(() => groupTasksByDueDate(filteredTasks), [filteredTasks]);
  const activeCount = useMemo(
    () => tasks.reduce((count, task) => count + (task.completed ? 0 : 1), 0),
    [tasks],
  );
  const accountInitial = user?.email?.charAt(0).toUpperCase() || "A";

  function openEditor(taskId?: string) {
    router.push(
      taskId
        ? { pathname: routes.taskForm, params: { taskId } }
        : { pathname: routes.taskForm },
    );
  }

  function confirmDelete(task: Task) {
    Alert.alert("Delete task?", `“${task.title}” will be permanently removed.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => void removeTask(task.id) },
    ]);
  }

  function openTaskMenu(task: Task) {
    Alert.alert(task.title, undefined, [
      { text: "Edit", onPress: () => openEditor(task.id) },
      { text: "Delete", style: "destructive", onPress: () => confirmDelete(task) },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  async function signOut() {
    try {
      await logout();
    } catch {
      showToast("Couldn't sign out. Please try again.", "error");
    }
  }

  function openAccountMenu() {
    Alert.alert("Account", user?.email ?? "Signed in", [
      { text: "Sign out", style: "destructive", onPress: () => void signOut() },
      { text: "Cancel", style: "cancel" },
    ]);
  }

  function clearCriteria() {
    setPriority("all");
    setStatus("all");
    setSearchQuery("");
  }

  if (isLoading && tasks.length === 0) return <LoadingState label="Loading your tasks…" />;

  return (
    <SafeAreaView className="flex-1 bg-brand-600" edges={["top", "left", "right"]}>
      <StatusBar style="light" />
      <View className="rounded-b-[28px] bg-brand-600 pb-5">
        <View className="mx-auto w-full max-w-2xl px-4 pt-2">
          <View className="min-h-16 flex-row items-center">
            <View className="min-w-0 flex-1">
              <Text className="text-xs font-semibold text-brand-100">
                {headerDateFormatter.format(new Date())}
              </Text>
              <View className="mt-1 flex-row items-end">
                <Text className="text-2xl font-bold tracking-tight text-white">My tasks</Text>
                <Text className="mb-0.5 ml-2 text-sm text-brand-100">{activeCount} to do</Text>
              </View>
            </View>
            <Pressable
              accessibilityLabel={`Account, ${user?.email ?? "signed in"}`}
              accessibilityRole="button"
              className="h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-white/15 active:bg-white/25"
              onPress={openAccountMenu}
            >
              <Text className="text-base font-bold text-white">{accountInitial}</Text>
            </Pressable>
          </View>
          <View className="mt-2">
            <SearchField value={searchQuery} onChangeText={setSearchQuery} />
          </View>
        </View>
      </View>

      <SectionList
        className="mx-auto w-full max-w-2xl bg-surface"
        sections={sections}
        keyExtractor={(task) => task.id}
        contentContainerClassName="pb-32"
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={retry} />}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <View className="gap-3 px-4 pb-2 pt-4">
            <View className="flex-row items-center gap-2">
              <View className="flex-1">
                <SegmentedControl
                  accessibilityLabel="Task status"
                  options={statusOptions}
                  value={status}
                  onChange={setStatus}
                />
              </View>
              <Pressable
                accessibilityLabel={`Priority filter${priority === "all" ? "" : ", 1 active"}`}
                accessibilityRole="button"
                className="relative h-12 w-12 items-center justify-center rounded-xl border border-slate-300 bg-white active:bg-slate-100"
                onPress={() => setFilterSheetOpen(true)}
              >
                <Ionicons className="text-slate-700" name="options-outline" size={22} />
                {priority !== "all" ? (
                  <View className="absolute -right-1 -top-1 h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1">
                    <Text className="text-[10px] font-bold text-white">1</Text>
                  </View>
                ) : null}
              </Pressable>
            </View>
            {priority !== "all" ? (
              <Pressable
                accessibilityLabel={`Remove ${priorityLabels[priority]} filter`}
                accessibilityRole="button"
                className="min-h-12 self-start flex-row items-center rounded-full border border-brand-200 bg-brand-50 px-3 active:bg-brand-100"
                onPress={() => setPriority("all")}
              >
                <Text className="text-sm font-semibold text-brand-700">
                  {priorityLabels[priority]}
                </Text>
                <Ionicons className="ml-2 text-brand-700" name="close" size={17} />
              </Pressable>
            ) : null}
            {error ? (
              <View className="gap-2">
                <InlineBanner message={error} />
                <Button label="Retry" variant="secondary" onPress={retry} />
              </View>
            ) : null}
          </View>
        }
        ListEmptyComponent={
          <View className="px-4 pt-5">
            {tasks.length === 0 ? (
              <EmptyState
                actionLabel="Create task"
                message="Your tasks will appear here, organised by due date."
                title="No tasks yet"
                onAction={() => openEditor()}
              />
            ) : (
              <EmptyState
                actionLabel="Clear filters"
                icon="search-outline"
                message="No tasks match the current search and filters."
                title="No results"
                onAction={clearCriteria}
              />
            )}
          </View>
        }
        renderSectionHeader={({ section }) => (
          <View className="bg-surface px-4 pb-2 pt-5">
            <Text className="text-sm font-bold text-slate-800">{section.title}</Text>
          </View>
        )}
        renderItem={({ item }) => (
          <View className="mb-2 px-4">
            <TaskCard
              busy={busyTaskIds.has(item.id)}
              task={item}
              onDelete={() => confirmDelete(item)}
              onEdit={() => openEditor(item.id)}
              onOpenMenu={() => openTaskMenu(item)}
              onToggle={() => void toggleTask(item)}
            />
          </View>
        )}
      />

      <ExtendedFab
        className="absolute right-4"
        label="New task"
        style={{ bottom: insets.bottom + 16 }}
        onPress={() => openEditor()}
      />
      <FilterSheet
        visible={filterSheetOpen}
        value={priority}
        onApply={(nextPriority) => {
          setPriority(nextPriority);
          setFilterSheetOpen(false);
        }}
        onClose={() => setFilterSheetOpen(false)}
      />
    </SafeAreaView>
  );
}
