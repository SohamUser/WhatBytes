import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect, useRef, useState } from "react";
import {
  findNodeHandle,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { StickyNote } from "@/components/StickyNote";
import { TornEdgeSvg } from "@/components/TornEdgeSvg";
import { Button } from "@/components/ui/Button";
import { DatePickerField } from "@/components/ui/DatePickerField";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { LoadingState } from "@/components/ui/LoadingState";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
  const scrollRef = useRef<ScrollView | null>(null);
  const titleInputRef = useRef<TextInput | null>(null);
  const descriptionInputRef = useRef<TextInput | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState(() => normalizeDueDate(new Date()));
  const [priority, setPriority] = useState<Priority>("medium");
  const [titleError, setTitleError] = useState<string | undefined>();
  const [submitError, setSubmitError] = useState<string | undefined>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  function revealInput(input: TextInput | null, extraOffset = 24) {
    const nativeHandle = findNodeHandle(input);
    if (nativeHandle === null) return;

    setTimeout(() => {
      scrollRef.current?.scrollResponderScrollNativeHandleToKeyboard(
        nativeHandle,
        extraOffset,
        true,
      );
    }, 120);
  }

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
    <SafeAreaView className="flex-1 bg-paper-100" edges={["top", "bottom", "left", "right"]}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1"
      >
        <View className="border-b border-cork-500/25 bg-paper-50">
          <View className="mx-auto min-h-16 w-full max-w-2xl flex-row items-center px-2 py-2">
            <Pressable
              accessibilityLabel="Close task form"
              accessibilityRole="button"
              className="h-12 w-12 items-center justify-center rounded-full active:bg-paper-200"
              onPress={() => router.back()}
            >
              <Ionicons color="#57534E" name="close" size={24} />
            </Pressable>
            <View className="flex-1 px-2">
              <Text className="text-xs font-bold uppercase tracking-[1.8px] text-cork-700/70">
                Sticky note
              </Text>
              <Text className="text-2xl text-ink-900" style={{ fontFamily: "Kalam_700Bold" }}>
              {taskId ? "Edit task" : "New task"}
              </Text>
            </View>
          </View>
        </View>

        <ScrollView
          ref={scrollRef}
          automaticallyAdjustKeyboardInsets
          contentContainerClassName="mx-auto w-full max-w-2xl gap-5 px-5 pb-8 pt-5"
          keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
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
              <StickyNote color="#FFEB7A" rotation={-0.45} style={{ minHeight: 360 }}>
                <View className="h-14 justify-end px-4">
                  <Text className="mb-0.5 text-center text-xs uppercase tracking-[2px] text-stone-600/70" style={{ fontFamily: "Kalam_400Regular" }}>
                    task details
                  </Text>
                  <TornEdgeSvg dashed />
                </View>
                <View className="px-7 pt-3">
                  <Text className="text-xs font-bold uppercase tracking-[1.5px] text-stone-600/70">
                    Title
                  </Text>
                  <TextInput
                    ref={titleInputRef}
                    accessibilityLabel="Task title"
                    autoFocus={!taskId}
                    className="min-h-14 py-1 text-[29px] leading-10 text-stone-900"
                    maxLength={120}
                    placeholder="What needs doing?"
                    placeholderTextColor="#8A7A50"
                    returnKeyType="next"
                    style={{ fontFamily: "Kalam_700Bold" }}
                    value={title}
                    onChangeText={(value) => {
                      setTitle(value);
                      if (value.trim()) setTitleError(undefined);
                    }}
                    onFocus={() => revealInput(titleInputRef.current)}
                    onSubmitEditing={() => descriptionInputRef.current?.focus()}
                  />
                  <View className={`border-b border-dashed ${titleError ? "border-danger-600" : "border-stone-600/35"}`} />
                  {titleError ? <Text className="mt-1 text-xs font-semibold text-danger-700">{titleError}</Text> : null}
                </View>
                <View className="min-h-44 flex-1 px-7 pb-6 pt-4">
                  <Text className="text-xs font-bold uppercase tracking-[1.5px] text-stone-600/70">
                    Description · optional
                  </Text>
                  <TextInput
                    ref={descriptionInputRef}
                    accessibilityLabel="Task description"
                    className="min-h-36 pt-2 text-[20px] leading-7 text-stone-800"
                    maxLength={1000}
                    multiline
                    placeholder="Add a few helpful details…"
                    placeholderTextColor="#8A7A50"
                    style={{ fontFamily: "Kalam_400Regular", textAlignVertical: "top" }}
                    value={description}
                    onChangeText={setDescription}
                    onFocus={() => revealInput(descriptionInputRef.current, 100)}
                  />
                </View>
              </StickyNote>
              <View className="gap-5 rounded-2xl border border-cork-500/25 bg-paper-50 p-4 shadow-sm">
                <DatePickerField label="Due date" value={dueDate} onChange={setDueDate} />
                <View className="gap-2">
                <Text className="text-sm font-bold uppercase tracking-wide text-ink-700">
                  Priority
                </Text>
                <SegmentedControl
                  accessibilityLabel="Task priority"
                  options={priorities}
                  value={priority}
                  onChange={setPriority}
                />
                </View>
              </View>
            </>
          )}
        </ScrollView>
        {!missingTask ? (
          <View className="border-t border-cork-500/25 bg-paper-50 px-5 pb-3 pt-3">
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
