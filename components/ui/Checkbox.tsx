import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

interface CheckboxProps {
  checked: boolean;
  onPress: () => void;
  disabled?: boolean;
  label: string;
  displayLabel?: string;
}

export function Checkbox({ checked, onPress, disabled, label, displayLabel }: CheckboxProps) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled, busy: disabled }}
      disabled={disabled}
      onPress={onPress}
      className={`min-h-12 flex-row items-center rounded-xl px-2 active:bg-slate-100 ${
        disabled ? "opacity-60" : ""
      }`}
    >
      {disabled ? (
        <>
          <ActivityIndicator className="text-brand-600" size="small" />
          <Text className="ml-3 text-sm font-semibold text-slate-600">Updating…</Text>
        </>
      ) : (
        <View className="flex-row items-center">
          <View
            className={`h-6 w-6 items-center justify-center rounded-md border-2 ${
              checked ? "border-brand-600 bg-brand-600" : "border-slate-500 bg-white"
            }`}
          >
            {checked ? <Ionicons className="text-white" name="checkmark" size={17} /> : null}
          </View>
          <Text
            className={`ml-3 text-sm font-semibold ${
              checked ? "text-slate-500" : "text-slate-700"
            }`}
          >
            {displayLabel ?? (checked ? "Completed" : "Done")}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
