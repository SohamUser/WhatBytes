import { Ionicons } from "@expo/vector-icons";
import { Pressable, PressableProps, Text } from "react-native";

import { cn } from "@/utils/cn";

interface ExtendedFabProps extends PressableProps {
  label: string;
}

export function ExtendedFab({ label, className, ...props }: ExtendedFabProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      className={cn(
        "min-h-14 flex-row items-center justify-center rounded-full bg-brand-600 px-5 shadow-lg active:bg-brand-700",
        className,
      )}
      {...props}
    >
      <Ionicons className="text-white" name="add" size={23} />
      <Text className="ml-2 text-base font-bold text-white">{label}</Text>
    </Pressable>
  );
}
