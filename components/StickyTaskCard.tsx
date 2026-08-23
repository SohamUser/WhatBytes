import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Pressable, Text } from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  ReduceMotion,
  runOnJS,
  useAnimatedProps,
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import Svg, { Path } from "react-native-svg";

import { StickyNote } from "@/components/StickyNote";
import { Task } from "@/types";
import { formatCreatedAt, getStickyAppearance, getStickyCardTitle } from "@/utils/stickyNotes";

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface StickyTaskCardProps {
  task: Task;
  busy: boolean;
  arriving?: boolean;
  completed?: boolean;
  onArrivalRendered?: () => void;
  onEdit: () => void;
  onOpenMenu: () => void;
  onComplete: () => Promise<void>;
}

export function StickyTaskCard({
  task,
  busy,
  arriving = false,
  completed = false,
  onArrivalRendered,
  onEdit,
  onOpenMenu,
  onComplete,
}: StickyTaskCardProps) {
  const checkProgress = useSharedValue(completed ? 1 : 0);
  const dismissProgress = useSharedValue(0);
  const reduceMotion = useReducedMotion();
  const [animating, setAnimating] = useState(false);
  const appearance = getStickyAppearance(task.id);

  useEffect(() => {
    if (arriving) onArrivalRendered?.();
  }, [arriving, onArrivalRendered]);

  const checkProps = useAnimatedProps(() => ({
    strokeDashoffset: 25 * (1 - checkProgress.value),
  }));

  const cardStyle = useAnimatedStyle(() => ({
    opacity: 1 - dismissProgress.value,
    transform: [
      { translateY: -12 * dismissProgress.value },
      { scale: 1 - 0.15 * dismissProgress.value },
    ],
  }));

  async function commitCompletion() {
    try {
      await onComplete();
    } catch {
      checkProgress.value = withTiming(0, { duration: 160 });
      dismissProgress.value = withTiming(0, { duration: 180 });
      setAnimating(false);
    }
  }

  function beginCompletion() {
    if (busy || animating) return;
    if (completed) {
      void onComplete().catch(() => undefined);
      return;
    }
    setAnimating(true);
    const finish = () => void commitCompletion();
    checkProgress.value = withTiming(
      1,
      {
        duration: reduceMotion ? 100 : 235,
        easing: Easing.out(Easing.cubic),
        reduceMotion: ReduceMotion.Never,
      },
      (finished) => {
        if (!finished) return;
        dismissProgress.value = withTiming(
          1,
          {
            duration: reduceMotion ? 80 : 130,
            easing: Easing.in(Easing.quad),
            reduceMotion: ReduceMotion.Never,
          },
          (dismissed) => {
            if (dismissed) runOnJS(finish)();
          },
        );
      },
    );
  }

  return (
    <Animated.View
      entering={arriving ? FadeInDown.springify().damping(14).reduceMotion(ReduceMotion.System) : undefined}
      style={cardStyle}
    >
      <StickyNote
        color={completed ? "#E7E1D6" : appearance.color}
        rotation={completed ? appearance.rotation * 0.35 : appearance.rotation}
        style={{ height: completed ? 128 : 164, opacity: busy ? 0.62 : 1 }}
      >
        <Pressable
          accessibilityHint="Opens the task editor. Long press for more actions."
          accessibilityLabel={`${task.title}${completed ? ", completed" : ""}`}
          className="flex-1 px-4 pb-2 pt-4"
          disabled={busy || animating}
          onLongPress={onOpenMenu}
          onPress={onEdit}
        >
          <Text
            className={`text-[19px] leading-7 text-ink-900 ${completed ? "line-through opacity-60" : ""}`}
            numberOfLines={completed ? 2 : 3}
            style={{ fontFamily: "Kalam_700Bold" }}
          >
            {getStickyCardTitle(task)}
          </Text>
          <Text className="mt-auto text-[11px] font-semibold uppercase tracking-wide text-ink-700/70">
            {formatCreatedAt(task.createdAt)}
          </Text>
        </Pressable>

        <Pressable
          accessibilityLabel={completed ? `Restore ${task.title}` : `Complete ${task.title}`}
          accessibilityRole="checkbox"
          accessibilityState={{ checked: completed, disabled: busy || animating }}
          className="absolute bottom-2 right-2 h-12 w-12 items-center justify-center rounded-full bg-white/40 active:bg-white/70"
          disabled={busy || animating}
          onPress={beginCompletion}
        >
          {completed ? (
            <Ionicons color="#57534E" name="return-up-back-outline" size={22} />
          ) : (
            <Svg height={30} viewBox="0 0 32 32" width={30}>
              <Path d="M4 16 C4 8 8 4 16 4 C24 4 28 8 28 16 C28 24 24 28 16 28 C8 28 4 24 4 16" fill="none" opacity={0.48} stroke="#57534E" strokeWidth={1.5} />
              <AnimatedPath
                animatedProps={checkProps}
                d="M8 16 L14 22 L25 10"
                fill="none"
                stroke="#3F6212"
                strokeDasharray="25 25"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
              />
            </Svg>
          )}
        </Pressable>
      </StickyNote>
    </Animated.View>
  );
}
