import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToast } from "@/context/ToastContext";
import { cn } from "@/utils/cn";

const toneClasses = {
  success: "border-olive-600 bg-olive-50",
  error: "border-danger-600 bg-[#FFF4EF]",
  info: "border-cork-500 bg-paper-50",
};

const toneColors = {
  success: "#535D2E",
  error: "#B91C1C",
  info: "#57534E",
};

export function ToastViewport() {
  const { toast, dismissToast } = useToast();
  const insets = useSafeAreaInsets();

  if (!toast) return null;

  return (
    <View
      className="absolute left-4 right-4 z-50"
      pointerEvents="box-none"
      style={{ bottom: insets.bottom + 84 }}
    >
      <Pressable
        accessibilityRole="alert"
        onPress={dismissToast}
        className={cn(
          "min-h-12 flex-row items-center rounded-sm border-l-4 px-4 py-3 shadow-lg",
          toneClasses[toast.tone],
        )}
      >
        <Text className="flex-1 pr-3 text-base text-ink-900" style={{ fontFamily: "Kalam_400Regular" }}>{toast.message}</Text>
        <Ionicons color={toneColors[toast.tone]} name="close" size={20} />
      </Pressable>
    </View>
  );
}
