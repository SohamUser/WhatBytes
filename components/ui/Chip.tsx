import { Pressable, Text } from "react-native";

import { cn } from "@/utils/cn";

interface ChipProps {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  tone?: "neutral" | "low" | "medium" | "high";
  disabled?: boolean;
  compact?: boolean;
}

const selectedToneClasses = {
  neutral: "border-brand-600 bg-brand-600",
  low: "border-success-600 bg-success-600",
  medium: "border-warning-600 bg-warning-600",
  high: "border-danger-600 bg-danger-600",
};

const idleToneClasses = {
  neutral: "border-slate-300 bg-white",
  low: "border-success-200 bg-success-50",
  medium: "border-warning-200 bg-warning-50",
  high: "border-danger-200 bg-danger-50",
};

const idleTextClasses = {
  neutral: "text-slate-700",
  low: "text-success-700",
  medium: "text-warning-700",
  high: "text-danger-700",
};

export function Chip({
  label,
  selected = false,
  onPress,
  tone = "neutral",
  disabled = false,
  compact = false,
}: ChipProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected, disabled: disabled || !onPress }}
      disabled={disabled || !onPress}
      onPress={onPress}
      className={cn(
        compact
          ? "min-h-7 items-center justify-center rounded-full border px-2 py-1"
          : "min-h-9 items-center justify-center rounded-full border px-3 py-1.5",
        selected ? selectedToneClasses[tone] : idleToneClasses[tone],
        disabled && "opacity-50",
      )}
    >
      <Text
        className={cn(
          compact ? "text-[10px] font-bold capitalize" : "text-xs font-semibold capitalize",
          selected ? "text-white" : idleTextClasses[tone],
        )}
      >
        {label}
      </Text>
    </Pressable>
  );
}
