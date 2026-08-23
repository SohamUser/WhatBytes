import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Button } from "@/components/ui/Button";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { Input } from "@/components/ui/Input";
import { LoadingState } from "@/components/ui/LoadingState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { TextArea } from "@/components/ui/TextArea";
import { useTasks } from "@/context/TaskContext";
import { Priority } from "@/types";
import { normalizeDueDate } from "@/utils/date";

const priorities: { label: string; value: Priority }[] = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export default function TaskFormScreen() {
  const { taskId } = useLocalSearchParams<{ taskId?: string }>();
  const { tasks, isLoading, createTask, updateTask } = useTasks();
  const task = taskId ? tasks.find((item) => item.id === taskId) : undefined;
  const initializedTaskId = useRef<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => normalizeDueDate(new Date()));
  const [priority, setPriority] = useState<Priority>("medium");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!task || initializedTaskId.current === task.id) return;
    setTitle(task.title);
    setDescription(task.description);
    setDueDate(task.dueDate);
    setPriority(task.priority);
    initializedTaskId.current = task.id;
  }, [task]);

  async function handleSubmit() {
    if (!title.trim()) {
      setTitleError("Title is required.");
      return;
    }

    setTitleError(undefined);
    setSubmitError(undefined);
    setIsSubmitting(true);
    try {
      const input = { title, description, dueDate, priority };
      if (taskId) {
        await updateTask(taskId, input);
      } else {
        await createTask(input);
      }
      router.back();
    } catch {
      setSubmitError("Your changes weren't saved. Your form is still here so you can retry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (taskId && isLoading && !task) return <LoadingState label="Loading task…" />;

  const missingTask = Boolean(taskId && !task);

  return (
    <SafeAreaView className="flex-1 bg-surface" edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="light" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="bg-brand-600">
          <View className="mx-auto min-h-16 w-full max-w-2xl flex-row items-center px-2 py-2">
            <Pressable
              accessibilityLabel="Close task form"
              accessibilityRole="button"
              className="h-12 w-12 items-center justify-center rounded-full active:bg-white/15"
              onPress={() => router.back()}
            >
              <Ionicons className="text-white" name="close" size={24} />
            </Pressable>
            <Text className="flex-1 px-2 text-xl font-bold text-white">
              {taskId ? "Edit task" : "New task"}
            </Text>
          </View>
        </View>

        <ScrollView
          contentContainerClassName="mx-auto w-full max-w-2xl gap-6 px-4 pb-8 pt-6"
          keyboardShouldPersistTaps="handled"
        >
          {missingTask ? (
            <View className="gap-4">
              <InlineBanner message="This task is no longer available." />
              <Button label="Go back" variant="secondary" onPress={() => router.back()} />
            </View>
          ) : (
            <>
              {submitError ? <InlineBanner message={submitError} /> : null}
              <Input
                autoFocus={!taskId}
                error={titleError}
                label="Task title *"
                maxLength={120}
                placeholder="e.g. Deliver product photos"
                value={title}
                onChangeText={(value) => {
                  setTitle(value);
                  if (value.trim()) setTitleError(undefined);
                }}
              />
              <TextArea
                label="Description"
                maxLength={1000}
                placeholder="Add client details, location, or useful notes…"
                value={description}
                onChangeText={setDescription}
              />
              <DatePickerField label="Due date" value={dueDate} onChange={setDueDate} />
              <View className="gap-2">
                <Text className="text-sm font-semibold text-slate-700">
                  Priority
                </Text>
                <SegmentedControl
                  accessibilityLabel="Task priority"
                  options={priorities}
                  value={priority}
                  onChange={setPriority}
                />
              </View>
            </>
          )}
        </ScrollView>
        {!missingTask ? (
          <View className="border-t border-slate-200 bg-white px-4 pb-3 pt-3">
            <View className="mx-auto w-full max-w-2xl">
              <Button
                fullWidth
                label={taskId ? "Save changes" : "Create task"}
                loading={isSubmitting}
                onPress={() => void handleSubmit()}
              />
            </View>
          </View>
        ) : null}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
