import { ReactNode } from "react";
import { Text, TextInput, TextInputProps, View } from "react-native";

import { cn } from "@/utils/cn";

interface InputProps extends TextInputProps {
  label: string;
  error?: string;
  rightElement?: ReactNode;
}

export function Input({ label, error, rightElement, className, ...props }: InputProps) {
  return (
    <View className="gap-2">
      <Text className="text-sm font-semibold text-slate-700">
        {label}
      </Text>
      <View className="relative">
        <TextInput
          accessibilityLabel={label}
          className={cn(
            "min-h-12 rounded-2xl border bg-slate-50 px-4 py-3 text-base text-slate-900 placeholder:text-slate-400",
            Boolean(rightElement) && "pr-12",
            error ? "border-danger-500" : "border-slate-200 focus:border-brand-600 focus:bg-white",
            className,
          )}
          {...props}
        />
        {rightElement ? (
          <View className="absolute bottom-0 right-0 top-0 w-12 items-center justify-center">
            {rightElement}
          </View>
        ) : null}
      </View>
      {error ? <Text className="text-xs font-medium text-danger-600">{error}</Text> : null}
    </View>
  );
}
