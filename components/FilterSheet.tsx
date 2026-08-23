import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { PriorityFilter } from "@/types";
import { cn } from "@/utils/cn";

import { Button } from "./ui/Button";

interface FilterSheetProps {
  visible: boolean;
  value: PriorityFilter;
  onApply: (value: PriorityFilter) => void;
  onClose: () => void;
}

const options: { label: string; description: string; value: PriorityFilter }[] = [
  { label: "All priorities", description: "Show every priority", value: "all" },
  { label: "High", description: "Urgent work", value: "high" },
  { label: "Medium", description: "Standard priority", value: "medium" },
  { label: "Low", description: "Can wait", value: "low" },
];

export function FilterSheet({ visible, value, onApply, onClose }: FilterSheetProps) {
  const [draft, setDraft] = useState<PriorityFilter>(value);

  useEffect(() => {
    if (visible) setDraft(value);
  }, [value, visible]);

  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      transparent
      visible={visible}
    >
      <View className="flex-1 justify-end bg-slate-950/40">
        <Pressable
          accessibilityLabel="Close filters"
          className="flex-1"
          onPress={onClose}
        />
        <SafeAreaView
          className="rounded-t-3xl bg-white"
          edges={["bottom", "left", "right"]}
        >
          <View className="mx-auto w-full max-w-2xl px-4 pb-4 pt-3">
            <View className="mb-3 h-1 w-10 self-center rounded-full bg-slate-300" />
            <View className="flex-row items-center justify-between pb-3">
              <View>
                <Text className="text-xl font-bold text-slate-950">Priority</Text>
                <Text className="mt-1 text-sm text-slate-500">Choose one priority to show</Text>
              </View>
              <Pressable
                accessibilityLabel="Close filters"
                accessibilityRole="button"
                className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-100"
                onPress={onClose}
              >
                <Ionicons className="text-slate-600" name="close" size={23} />
              </Pressable>
            </View>

            <View className="overflow-hidden rounded-2xl border border-slate-200">
              {options.map((option, index) => {
                const selected = draft === option.value;
                return (
                  <Pressable
                    key={option.value}
                    accessibilityLabel={option.label}
                    accessibilityRole="radio"
                    accessibilityState={{ checked: selected }}
                    className={cn(
                      "min-h-16 flex-row items-center px-4 active:bg-slate-50",
                      index > 0 && "border-t border-slate-200",
                    )}
                    onPress={() => setDraft(option.value)}
                  >
                    <View
                      className={cn(
                        "h-6 w-6 items-center justify-center rounded-full border-2",
                        selected ? "border-brand-600" : "border-slate-400",
                      )}
                    >
                      {selected ? <View className="h-3 w-3 rounded-full bg-brand-600" /> : null}
                    </View>
                    <View className="ml-3 flex-1">
                      <Text className="text-base font-semibold text-slate-800">{option.label}</Text>
                      <Text className="mt-0.5 text-xs text-slate-500">{option.description}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>

            <View className="mt-5 flex-row gap-3">
              <Button
                className="flex-1"
                label="Clear"
                variant="secondary"
                onPress={() => setDraft("all")}
              />
              <Button
                className="flex-1"
                label="Apply"
                onPress={() => onApply(draft)}
              />
            </View>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
