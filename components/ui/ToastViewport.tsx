import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToast } from "@/context/ToastContext";
import { cn } from "@/utils/cn";

const toneClasses = {
  success: "bg-success-700",
  error: "bg-danger-700",
  info: "bg-slate-800",
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
          "min-h-12 flex-row items-center rounded-xl px-4 py-3 shadow-lg",
          toneClasses[toast.tone],
        )}
      >
        <Text className="flex-1 pr-3 text-sm font-medium text-white">{toast.message}</Text>
        <Ionicons className="text-white" name="close" size={20} />
      </Pressable>
    </View>
  );
}
