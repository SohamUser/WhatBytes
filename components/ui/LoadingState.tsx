import { ActivityIndicator, Text, View } from "react-native";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-surface px-6">
      <View className="h-14 w-14 items-center justify-center rounded-2xl border border-brand-100 bg-white">
        <ActivityIndicator className="text-brand-600" size="large" />
      </View>
      <Text className="text-sm text-slate-500">{label}</Text>
    </View>
  );
}
