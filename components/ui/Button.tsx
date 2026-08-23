import { ActivityIndicator, Pressable, PressableProps, Text, View } from "react-native";

import { cn } from "@/utils/cn";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

interface ButtonProps extends PressableProps {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
}

const containerVariants: Record<ButtonVariant, string> = {
  primary: "bg-brand-600 active:bg-brand-700",
  secondary: "border border-brand-200 bg-brand-50 active:bg-brand-100",
  danger: "bg-danger-600 active:bg-danger-700",
  ghost: "bg-transparent active:bg-slate-100",
};

const labelVariants: Record<ButtonVariant, string> = {
  primary: "text-white",
  secondary: "text-brand-700",
  danger: "text-white",
  ghost: "text-slate-700",
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  fullWidth = false,
  disabled,
  leftIcon,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      disabled={isDisabled}
      className={cn(
        "min-h-12 flex-row items-center justify-center rounded-2xl px-5 py-3 active:opacity-90",
        containerVariants[variant],
        fullWidth && "w-full",
        isDisabled && "opacity-50",
        className,
      )}
      {...props}
    >
      {loading ? (
        <ActivityIndicator className={labelVariants[variant]} />
      ) : (
        <View className="flex-row items-center gap-2">
          {leftIcon}
          <Text className={cn("text-base font-semibold", labelVariants[variant])}>
            {label}
          </Text>
        </View>
      )}
    </Pressable>
  );
}
