import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

import { Button } from "./Button";

interface EmptyStateProps {
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}

export function EmptyState({
  title,
  message,
  actionLabel,
  onAction,
  icon = "checkmark-done-circle-outline",
}: EmptyStateProps) {
  return (
    <View className="rotate-[0.5deg] items-center rounded-sm border border-cork-500/20 bg-[#FFEB7A] px-6 py-10 shadow-lg">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-full bg-white/40">
        <Ionicons color="#8A6B2C" name={icon} size={28} />
      </View>
      <Text className="text-center text-2xl text-ink-900" style={{ fontFamily: "Kalam_700Bold" }}>{title}</Text>
      <Text className="mt-2 text-center text-base leading-6 text-ink-700" style={{ fontFamily: "Kalam_400Regular" }}>{message}</Text>
      {actionLabel && onAction ? (
        <Button className="mt-5" label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
