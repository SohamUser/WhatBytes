import { ActivityIndicator, Text, View } from "react-native";

interface LoadingStateProps {
  label?: string;
}

export function LoadingState({ label = "Loading…" }: LoadingStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-4 bg-paper-100 px-6">
      <View className="h-16 w-16 rotate-[-2deg] items-center justify-center rounded-sm bg-[#FFEB7A] shadow-lg">
        <ActivityIndicator color="#C65D3B" size="large" />
      </View>
      <Text className="text-lg text-ink-700" style={{ fontFamily: "Kalam_400Regular" }}>{label}</Text>
    </View>
  );
}
