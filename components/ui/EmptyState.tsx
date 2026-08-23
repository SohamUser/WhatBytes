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
    <View className="items-center rounded-2xl border border-slate-200 bg-white px-6 py-10">
      <View className="mb-4 h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
        <Ionicons className="text-brand-600" name={icon} size={28} />
      </View>
      <Text className="text-center text-xl font-bold text-slate-900">{title}</Text>
      <Text className="mt-2 text-center text-sm leading-5 text-slate-500">{message}</Text>
      {actionLabel && onAction ? (
        <Button className="mt-5" label={actionLabel} onPress={onAction} />
      ) : null}
    </View>
  );
}
