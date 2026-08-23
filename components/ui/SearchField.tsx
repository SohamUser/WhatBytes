import { Ionicons } from "@expo/vector-icons";
import { Pressable, TextInput, View } from "react-native";

interface SearchFieldProps {
  value: string;
  onChangeText: (value: string) => void;
}

export function SearchField({ value, onChangeText }: SearchFieldProps) {
  return (
    <View className="min-h-12 flex-row items-center rounded-full border border-white/60 bg-white px-3 shadow-sm">
      <Ionicons className="text-slate-400" name="search" size={18} />
      <TextInput
        accessibilityLabel="Search tasks"
        autoCapitalize="none"
        className="h-12 flex-1 px-3 text-base text-slate-900 placeholder:text-slate-400"
        placeholder="Search tasks"
        returnKeyType="search"
        value={value}
        onChangeText={onChangeText}
      />
      {value ? (
        <Pressable
          accessibilityLabel="Clear search"
          accessibilityRole="button"
          className="h-12 w-12 items-center justify-center rounded-full active:bg-slate-100"
          onPress={() => onChangeText("")}
        >
          <Ionicons className="text-slate-500" name="close" size={20} />
        </Pressable>
      ) : null}
    </View>
  );
}
