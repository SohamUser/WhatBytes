import { Ionicons } from "@expo/vector-icons";
import { useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { runOnJS } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { StickyNote } from "@/components/StickyNote";
import { StickyActionSheet } from "@/components/StickyActionSheet";
import type { StickyAction } from "@/components/StickyActionSheet";
import { TornEdgeSvg } from "@/components/TornEdgeSvg";
import { Button } from "@/components/ui/Button";
import { InlineBanner } from "@/components/ui/InlineBanner";
import { useAnimationCoordinator } from "@/context/AnimationCoordinator";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/context/ToastContext";
import { logout } from "@/services/authService";
import { createTaskDocumentId } from "@/services/taskService";
import { buildStickyTaskInput } from "@/utils/stickyNotes";

export default function CreateStickyScreen() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const noteRef = useRef<View | null>(null);
  const descriptionRef = useRef<TextInput | null>(null);
  const instanceId = useRef(`${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const revisionRef = useRef(0);
  const acceptingRef = useRef(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const {
    enqueueSubmission,
    failedSubmissions,
    restoreFailed,
    retryFailed,
    soundEnabled,
    toggleSound,
  } = useAnimationCoordinator();

  function updateTitle(value: string) {
    revisionRef.current += 1;
    setTitle(value);
    if (value.trim()) setValidationMessage(null);
  }

  function updateDescription(value: string) {
    revisionRef.current += 1;
    setDescription(value);
  }

  function submitDraft() {
    if (acceptingRef.current) return;
    const input = buildStickyTaskInput(title, description);
    if (!input) {
      setValidationMessage("Give your task a title first.");
      return;
    }

    const node = noteRef.current;
    if (!node) return;
    acceptingRef.current = true;
    const revision = `${instanceId.current}:${revisionRef.current}`;
    node.measureInWindow((x, y, width, height) => {
      const accepted = enqueueSubmission({
        taskId: createTaskDocumentId(),
        input,
        previewTitle: input.title,
        previewDescription: input.description,
        sourceRect: { x, y, width, height },
        draftRevision: revision,
      });
      if (accepted) {
        setTitle("");
        setDescription("");
        revisionRef.current += 1;
      }
      acceptingRef.current = false;
    });
  }

  const tearGesture = Gesture.Pan()
    .activeOffsetY([-12, 12])
    .onEnd((event) => {
      if (event.translationY <= -72 || event.velocityY <= -600) runOnJS(submitDraft)();
    });

  const failed = failedSubmissions[0];
  const accountActions: StickyAction[] = [
    {
      label: soundEnabled ? "Mute tearing sound" : "Enable tearing sound",
      icon: soundEnabled ? "volume-mute-outline" : "volume-medium-outline",
      onPress: toggleSound,
    },
    {
      label: "Sign out",
      icon: "log-out-outline",
      tone: "danger",
      onPress: () => {
        setAccountMenuOpen(false);
        void logout().catch(() => {
          showToast("Couldn't sign out. Please try again.", "error");
        });
      },
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-paper-100" edges={["top", "left", "right"]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between px-5 pb-3 pt-2">
          <View>
            <Text className="text-xs font-bold uppercase tracking-[2px] text-ink-500">
              Fresh sheet
            </Text>
            <Text className="text-3xl text-ink-900" style={{ fontFamily: "Kalam_700Bold" }}>
              What needs doing?
            </Text>
          </View>
          <Pressable
            accessibilityLabel={`Account, ${user?.email ?? "signed in"}`}
            accessibilityRole="button"
            className="h-12 w-12 items-center justify-center rounded-full border border-cork-500/30 bg-paper-50/80 active:bg-white"
            onPress={() => setAccountMenuOpen(true)}
          >
            <Ionicons color="#57534E" name="person-circle-outline" size={28} />
          </Pressable>
        </View>

        <View className="flex-1 px-5 pb-3">
          {failed ? (
            <View className="mb-3 gap-2">
              <InlineBanner message={failed.error} />
              <View className="flex-row gap-2">
                <Button
                  className="flex-1"
                  label="Retry"
                  variant="secondary"
                  onPress={() => retryFailed(failed.taskId)}
                />
                <Button
                  className="flex-1"
                  label="Restore text"
                  variant="ghost"
                  onPress={() => {
                    const restored = restoreFailed(failed.taskId);
                    if (restored !== null) {
                      setTitle(restored.title);
                      setDescription(restored.description);
                      revisionRef.current += 1;
                    }
                  }}
                />
              </View>
            </View>
          ) : null}

          <StickyNote
            className="flex-1"
            color="#FFEB7A"
            rotation={-0.7}
            style={{ minHeight: 310, maxHeight: 590 }}
          >
            <View ref={noteRef} collapsable={false} className="flex-1">
              <GestureDetector gesture={tearGesture}>
                <View
                  accessible
                  accessibilityHint="Swipe upward to add this task"
                  accessibilityLabel="Tear handle"
                  accessibilityRole="button"
                  className="h-16 justify-end px-4"
                >
                  <Text
                    className="mb-0.5 text-center text-xs uppercase tracking-[2px] text-stone-600/70"
                    style={{ fontFamily: "Kalam_400Regular" }}
                  >
                    pull up to tear
                  </Text>
                  <TornEdgeSvg dashed />
                </View>
              </GestureDetector>
              <View className="px-7 pt-3">
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-stone-600/70">
                  Title
                </Text>
                <TextInput
                  accessibilityLabel="Task title"
                  autoFocus
                  className="min-h-14 py-1 text-[29px] leading-10 text-stone-900"
                  maxLength={120}
                  placeholder="What needs doing?"
                  placeholderTextColor="#8A7A50"
                  returnKeyType="next"
                  style={{ fontFamily: "Kalam_700Bold" }}
                  value={title}
                  onChangeText={updateTitle}
                  onSubmitEditing={() => descriptionRef.current?.focus()}
                />
                <View className="border-b border-dashed border-stone-600/35" />
              </View>
              <View className="flex-1 px-7 pb-6 pt-4">
                <Text className="text-xs font-bold uppercase tracking-[1.5px] text-stone-600/70">
                  Description · optional
                </Text>
                <TextInput
                  ref={descriptionRef}
                  accessibilityLabel="Task description"
                  className="flex-1 pt-2 text-[21px] leading-8 text-stone-800"
                  maxLength={1000}
                  multiline
                  placeholder="Add a few helpful details…"
                  placeholderTextColor="#8A7A50"
                  style={{ fontFamily: "Kalam_400Regular", textAlignVertical: "top" }}
                  value={description}
                  onChangeText={updateDescription}
                />
              </View>
            </View>
          </StickyNote>

          {validationMessage ? (
            <Text accessibilityRole="alert" className="mt-2 text-center text-sm font-semibold text-danger-700">
              {validationMessage}
            </Text>
          ) : null}
        </View>

        <View className="px-5 pb-4 pt-2">
          <Button
            fullWidth
            label="Add task"
            leftIcon={<Ionicons color="white" name="paper-plane-outline" size={20} />}
            onPress={submitDraft}
          />
        </View>
        <StickyActionSheet
          actions={accountActions}
          message={user?.email ?? "Signed in"}
          title="Account"
          visible={accountMenuOpen}
          onClose={() => setAccountMenuOpen(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
