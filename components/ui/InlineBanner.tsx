import { Ionicons } from "@expo/vector-icons";
import { Text, View } from "react-native";

interface InlineBannerProps {
  message: string;
  tone?: "error" | "info";
}

export function InlineBanner({ message, tone = "error" }: InlineBannerProps) {
  const isError = tone === "error";
  return (
    <View
      accessibilityRole="alert"
      className={`flex-row items-start gap-2 rounded-xl border p-3 ${
        isError ? "border-danger-200 bg-[#FFF4EF]" : "border-cork-500/30 bg-paper-50"
      }`}
    >
      <Ionicons
        color={isError ? "#DC2626" : "#8A6B2C"}
        name={isError ? "alert-circle-outline" : "information-circle-outline"}
        size={20}
      />
      <Text className={isError ? "flex-1 text-sm text-danger-700" : "flex-1 text-sm text-ink-700"}>
        {message}
      </Text>
    </View>
  );
}
