import { Ionicons } from "@expo/vector-icons";
import { View } from "react-native";
import Animated, { useAnimatedStyle } from "react-native-reanimated";

import { useAnimationCoordinator } from "@/context/AnimationCoordinator";

interface TaskTabIconProps {
  color: string;
  size: number;
  focused: boolean;
}

export function TaskTabIcon({ color, size, focused }: TaskTabIconProps) {
  const { registerTaskIcon, taskIconScale } = useAnimationCoordinator();
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: taskIconScale.value }],
  }));

  return (
    <Animated.View
      ref={(node) => registerTaskIcon(node as View | null)}
      collapsable={false}
      style={animatedStyle}
    >
      <Ionicons color={color} name={focused ? "documents" : "documents-outline"} size={size} />
    </Animated.View>
  );
}
