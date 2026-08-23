import { Pressable, Text, View } from "react-native";

import { cn } from "@/utils/cn";

interface SegmentOption<T extends string> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string> {
  accessibilityLabel: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  accessibilityLabel,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  return (
    <View
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="tablist"
      className="min-h-12 flex-row rounded-xl border border-cork-500/35 bg-paper-100 p-1"
    >
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected }}
            className={cn(
              "min-h-10 flex-1 items-center justify-center rounded-lg px-3",
              selected ? "bg-accent-500" : "active:bg-paper-200",
            )}
            onPress={() => onChange(option.value)}
          >
            <Text
              className={cn(
                "text-sm font-semibold",
                selected ? "text-white" : "text-ink-700",
              )}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
