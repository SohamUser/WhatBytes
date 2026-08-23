import DateTimePicker, { DateTimePickerEvent } from "@react-native-community/datetimepicker";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Platform, Pressable, Text, View } from "react-native";

import { formatDueDate, normalizeDueDate } from "@/utils/date";

import { Button } from "./Button";

interface DatePickerFieldProps {
  label: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function DatePickerField({ label, value, onChange }: DatePickerFieldProps) {
  const [isOpen, setIsOpen] = useState(false);

  function handleChange(event: DateTimePickerEvent, selectedDate?: Date) {
    if (Platform.OS === "android") setIsOpen(false);
    if (event.type === "set" && selectedDate) onChange(normalizeDueDate(selectedDate));
  }

  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-slate-700">
        {label}
      </Text>
      <Pressable
        accessibilityLabel={`${label}, ${formatDueDate(value)}`}
        accessibilityRole="button"
        onPress={() => setIsOpen(true)}
        className="min-h-12 flex-row items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 active:border-brand-600"
      >
        <Text className="text-base text-slate-900">{formatDueDate(value)}</Text>
        <Ionicons className="text-brand-600" name="calendar-outline" size={21} />
      </Pressable>

      {isOpen ? (
        <View className="rounded-xl bg-slate-50 p-2">
          <DateTimePicker
            display={Platform.OS === "ios" ? "inline" : "default"}
            mode="date"
            value={value}
            onChange={handleChange}
          />
          {Platform.OS === "ios" ? (
            <Button label="Done" variant="ghost" onPress={() => setIsOpen(false)} />
          ) : null}
        </View>
      ) : null}
    </View>
  );
}
