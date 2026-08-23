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
        isError ? "border-danger-200 bg-danger-50" : "border-brand-200 bg-brand-50"
      }`}
    >
      <Ionicons
        className={isError ? "text-danger-600" : "text-brand-600"}
        name={isError ? "alert-circle-outline" : "information-circle-outline"}
        size={20}
      />
      <Text className={isError ? "flex-1 text-sm text-danger-700" : "flex-1 text-sm text-brand-700"}>
        {message}
      </Text>
    </View>
  );
}
